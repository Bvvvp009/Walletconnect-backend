import express from 'express';
import cors from 'cors';
import { WalletConnectSDK } from '../src/core/WalletConnectSDK';
import { Address } from 'viem';

/**
 * 🚀 Express.js API Server Example
 * 
 * This example shows how to integrate WalletConnect Backend SDK into a web application.
 * Perfect for building dApps, DeFi platforms, or any Web3 application.
 */

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize WalletConnect SDK
const sdk = new WalletConnectSDK({
  projectId: 'YOUR_PROJECT_ID', // Get from https://cloud.walletconnect.com/
  timeouts: {
    connection: 60000, // 60 seconds
    transaction: 120000, // 2 minutes
    signing: 45000, // 45 seconds
    contractCall: 90000, // 1.5 minutes
    contractRead: 30000, // 30 seconds
    gasEstimation: 30000, // 30 seconds
  }
});

// Initialize SDK
sdk.init().then(() => {
  console.log('✅ WalletConnect SDK initialized');
}).catch(console.error);

// API Routes

/**
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', async (req, res) => {
  try {
    const timeouts = await sdk.getTimeoutConfig();
    const sessions = await sdk.getAllSessions();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      sdk: {
        initialized: true,
        activeSessions: sessions.length,
        timeouts
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/connect
 * Create a new connection for a user
 */
app.post('/api/connect', async (req, res) => {
  try {
    const { userId, chainId = 1, methods = ['eth_sendTransaction', 'eth_sign'] } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }

    console.log(`🔗 Creating connection for user: ${userId}`);

    const connection = await sdk.connect({
      userId,
      chainId,
      methods
    });

    res.json(connection);
  } catch (error) {
    console.error('Connection error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/connect/:userId/status
 * Check connection status for a user
 */
app.get('/api/connect/:userId/status', async (req, res) => {
  try {
    const { userId } = req.params;
    const isConnected = await sdk.isConnected(userId);
    const session = await sdk.getSession(userId);

    res.json({
      userId,
      isConnected,
      session: session ? {
        userId: session.userId,
        isActive: session.isActive,
        createdAt: session.createdAt,
        lastActivity: session.lastActivity
      } : null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/connect/:userId/accounts
 * Get user accounts
 */
app.get('/api/connect/:userId/accounts', async (req, res) => {
  try {
    const { userId } = req.params;
    const accounts = await sdk.getAccounts(userId);

    res.json({
      userId,
      accounts,
      count: accounts.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/connect/:userId/balance
 * Get user balance
 */
app.get('/api/connect/:userId/balance', async (req, res) => {
  try {
    const { userId } = req.params;
    const { address } = req.query;

    const balance = await sdk.getBalance(userId, address as Address);

    res.json({
      userId,
      address: address || 'default',
      balance: balance.toString(),
      balanceWei: balance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/connect/:userId/transaction
 * Send a transaction
 */
app.post('/api/connect/:userId/transaction', async (req, res) => {
  try {
    const { userId } = req.params;
    const { to, value, data, chainId = 1 } = req.body;

    if (!to || !value) {
      return res.status(400).json({
        success: false,
        error: 'to and value are required'
      });
    }

    console.log(`✍️ Sending transaction for user: ${userId}`);

    const result = await sdk.sendTransaction({
      userId,
      to: to as Address,
      value: BigInt(value),
      data: data as `0x${string}`,
      chainId
    });

    res.json(result);
  } catch (error) {
    console.error('Transaction error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/connect/:userId/sign
 * Sign a message
 */
app.post('/api/connect/:userId/sign', async (req, res) => {
  try {
    const { userId } = req.params;
    const { message, address } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'message is required'
      });
    }

    console.log(`✍️ Signing message for user: ${userId}`);

    const result = await sdk.signMessage({
      userId,
      message,
      address: address as Address
    });

    res.json(result);
  } catch (error) {
    console.error('Signing error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/connect/:userId/contract/read
 * Read from a smart contract
 */
app.post('/api/connect/:userId/contract/read', async (req, res) => {
  try {
    const { userId } = req.params;
    const { contract, functionName, args = [] } = req.body;

    if (!contract || !functionName) {
      return res.status(400).json({
        success: false,
        error: 'contract and functionName are required'
      });
    }

    console.log(`📖 Reading contract for user: ${userId}`);

    const result = await sdk.readContract({
      userId,
      contract,
      functionName,
      args
    });

    res.json(result);
  } catch (error) {
    console.error('Contract read error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/connect/:userId/contract/call
 * Call a smart contract function
 */
app.post('/api/connect/:userId/contract/call', async (req, res) => {
  try {
    const { userId } = req.params;
    const { contract, functionName, args = [], value = 0, gas } = req.body;

    if (!contract || !functionName) {
      return res.status(400).json({
        success: false,
        error: 'contract and functionName are required'
      });
    }

    console.log(`🏗️ Calling contract for user: ${userId}`);

    const result = await sdk.callContract({
      userId,
      contract,
      functionName,
      args,
      value: BigInt(value),
      gas: gas ? BigInt(gas) : undefined
    });

    res.json(result);
  } catch (error) {
    console.error('Contract call error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/connect/:userId/contract/estimate-gas
 * Estimate gas for a contract call
 */
app.post('/api/connect/:userId/contract/estimate-gas', async (req, res) => {
  try {
    const { userId } = req.params;
    const { contract, functionName, args = [], value = 0 } = req.body;

    if (!contract || !functionName) {
      return res.status(400).json({
        success: false,
        error: 'contract and functionName are required'
      });
    }

    console.log(`⛽ Estimating gas for user: ${userId}`);

    const result = await sdk.estimateGas({
      userId,
      contract,
      functionName,
      args,
      value: BigInt(value)
    });

    res.json(result);
  } catch (error) {
    console.error('Gas estimation error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/wallets
 * Get supported wallets
 */
app.get('/api/wallets', async (req, res) => {
  try {
    const { chain } = req.query;
    
    const wallets = chain 
      ? await sdk.getSupportedWallets(chain as string)
      : await sdk.getSupportedWallets();

    res.json({
      wallets,
      count: wallets.length,
      chain: chain || 'all'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/wallets/recommended
 * Get recommended wallets for a chain
 */
app.get('/api/wallets/recommended', async (req, res) => {
  try {
    const { chain = 'eip155:1' } = req.query;
    
    const wallets = await sdk.getRecommendedWallets(chain as string);

    res.json({
      wallets,
      count: wallets.length,
      chain
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/wallets/:name
 * Get specific wallet information
 */
app.get('/api/wallets/:name', async (req, res) => {
  try {
    const { name } = req.params;
    
    const wallet = await sdk.getWalletInfo(name);

    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: 'Wallet not found'
      });
    }

    res.json({
      success: true,
      wallet
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/connect/:userId/disconnect
 * Disconnect a user
 */
app.post('/api/connect/:userId/disconnect', async (req, res) => {
  try {
    const { userId } = req.params;

    console.log(`🔌 Disconnecting user: ${userId}`);

    const result = await sdk.disconnect(userId);

    res.json({
      success: result,
      userId
    });
  } catch (error) {
    console.error('Disconnect error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/sessions
 * Get all active sessions
 */
app.get('/api/sessions', async (req, res) => {
  try {
    const sessions = await sdk.getAllSessions();

    res.json({
      sessions: sessions.map(session => ({
        userId: session.userId,
        isActive: session.isActive,
        createdAt: session.createdAt,
        lastActivity: session.lastActivity
      })),
      count: sessions.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/timeouts
 * Get current timeout configuration
 */
app.get('/api/timeouts', async (req, res) => {
  try {
    const timeouts = await sdk.getTimeoutConfig();

    res.json({
      timeouts,
      formatted: Object.entries(timeouts).reduce((acc, [key, value]) => {
        acc[key] = `${Math.round(value / 1000)}s`;
        return acc;
      }, {} as Record<string, string>)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PUT /api/timeouts
 * Update timeout configuration
 */
app.put('/api/timeouts', async (req, res) => {
  try {
    const { timeouts } = req.body;

    await sdk.updateTimeoutConfig(timeouts);

    const updatedTimeouts = await sdk.getTimeoutConfig();

    res.json({
      success: true,
      timeouts: updatedTimeouts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Express API Server running on port ${PORT}`);
  console.log(`📚 API Documentation:`);
  console.log(`  - Health: GET http://localhost:${PORT}/api/health`);
  console.log(`  - Connect: POST http://localhost:${PORT}/api/connect`);
  console.log(`  - Status: GET http://localhost:${PORT}/api/connect/:userId/status`);
  console.log(`  - Accounts: GET http://localhost:${PORT}/api/connect/:userId/accounts`);
  console.log(`  - Balance: GET http://localhost:${PORT}/api/connect/:userId/balance`);
  console.log(`  - Transaction: POST http://localhost:${PORT}/api/connect/:userId/transaction`);
  console.log(`  - Sign: POST http://localhost:${PORT}/api/connect/:userId/sign`);
  console.log(`  - Contract Read: POST http://localhost:${PORT}/api/connect/:userId/contract/read`);
  console.log(`  - Contract Call: POST http://localhost:${PORT}/api/connect/:userId/contract/call`);
  console.log(`  - Estimate Gas: POST http://localhost:${PORT}/api/connect/:userId/contract/estimate-gas`);
  console.log(`  - Wallets: GET http://localhost:${PORT}/api/wallets`);
  console.log(`  - Sessions: GET http://localhost:${PORT}/api/sessions`);
  console.log(`  - Timeouts: GET http://localhost:${PORT}/api/timeouts`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  await sdk.destroy();
  process.exit(0);
});

export { app }; 