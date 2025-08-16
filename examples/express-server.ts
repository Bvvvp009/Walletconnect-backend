import express from 'express';
import cors from 'cors';
import { WalletConnectSDK, MemoryStorage, DefaultLogger } from '../src';

const app = express();
const port = process.env.PORT || 3000;

// Initialize the SDK
const sdk = new WalletConnectSDK({
  projectId: process.env.WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  storage: new MemoryStorage(),
  logger: new DefaultLogger('info'),
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  cleanupInterval: 5 * 60 * 1000 // 5 minutes
});

// Middleware
app.use(cors());
app.use(express.json());

// Initialize SDK on startup
async function initializeSDK() {
  try {
    await sdk.init();
    console.log('WalletConnect SDK initialized successfully');
    
    // Set up event listeners
    sdk.on('session_connect', (event) => {
      console.log('User connected:', event.userId);
    });

    sdk.on('session_disconnect', (event) => {
      console.log('User disconnected:', event.userId);
    });

    sdk.on('transaction_response', (event) => {
      console.log('Transaction response:', event.data);
    });
  } catch (error) {
    console.error('Failed to initialize SDK:', error);
    process.exit(1);
  }
}

// API Routes

// Connect a user
app.post('/api/connect', async (req, res) => {
  try {
    const { userId, chainId = 1 } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const connection = await sdk.connect({
      userId,
      chainId,
      methods: [
        'eth_sendTransaction',
        'eth_signTransaction',
        'eth_sign',
        'personal_sign',
        'eth_signTypedData'
      ],
      events: ['chainChanged', 'accountsChanged']
    });

    res.json(connection);
  } catch (error) {
    console.error('Connect error:', error);
    res.status(500).json({ error: 'Failed to connect' });
  }
});

// Check connection status
app.get('/api/status/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const isConnected = await sdk.isConnected(userId);
    const session = await sdk.getSession(userId);
    
    res.json({
      isConnected,
      session: session ? {
        userId: session.userId,
        topic: session.topic,
        address: session.address,
        isActive: session.isActive,
        createdAt: session.createdAt,
        lastActivity: session.lastActivity
      } : null
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ error: 'Failed to check status' });
  }
});

// Get user accounts
app.get('/api/accounts/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const accounts = await sdk.getAccounts(userId);
    res.json({ accounts });
  } catch (error) {
    console.error('Get accounts error:', error);
    res.status(500).json({ error: 'Failed to get accounts' });
  }
});

// Get user balance
app.get('/api/balance/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { address } = req.query;
    
    const balance = await sdk.getBalance(userId, address as `0x${string}`);
    res.json({ balance: balance.toString() });
  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({ error: 'Failed to get balance' });
  }
});

// Sign a message
app.post('/api/sign', async (req, res) => {
  try {
    const { userId, message, address } = req.body;
    
    if (!userId || !message) {
      return res.status(400).json({ error: 'userId and message are required' });
    }

    const result = await sdk.signMessage({
      userId,
      message,
      address
    });

    res.json(result);
  } catch (error) {
    console.error('Sign message error:', error);
    res.status(500).json({ error: 'Failed to sign message' });
  }
});

// Send a transaction
app.post('/api/transaction', async (req, res) => {
  try {
    const { userId, to, value, data, gas, gasPrice, chainId = 1 } = req.body;
    
    if (!userId || !to) {
      return res.status(400).json({ error: 'userId and to are required' });
    }

    const result = await sdk.sendTransaction({
      userId,
      to,
      value: value ? BigInt(value) : undefined,
      data,
      gas: gas ? BigInt(gas) : undefined,
      gasPrice: gasPrice ? BigInt(gasPrice) : undefined,
      chainId
    });

    res.json(result);
  } catch (error) {
    console.error('Send transaction error:', error);
    res.status(500).json({ error: 'Failed to send transaction' });
  }
});

// Disconnect a user
app.post('/api/disconnect/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const success = await sdk.disconnect(userId);
    res.json({ success });
  } catch (error) {
    console.error('Disconnect error:', error);
    res.status(500).json({ error: 'Failed to disconnect' });
  }
});

// Get all sessions
app.get('/api/sessions', async (req, res) => {
  try {
    const sessions = await sdk.getAllSessions();
    res.json({ sessions });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Failed to get sessions' });
  }
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const sessions = await sdk.getAllSessions();
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      activeSessions: sessions.length
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Start server
async function startServer() {
  await initializeSDK();
  
  app.listen(port, () => {
    console.log(`WalletConnect API server running on port ${port}`);
    console.log(`Health check: http://localhost:${port}/api/health`);
  });
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down...');
  await sdk.destroy();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down...');
  await sdk.destroy();
  process.exit(0);
});

startServer().catch(console.error); 