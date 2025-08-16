import { WalletConnectSDK, MemoryStorage, DefaultLogger } from '../src';

async function basicExample() {
  // Initialize the SDK
  const sdk = new WalletConnectSDK({
    projectId: 'd135d60071032d4c35b867a5420a0d32', // Get this from https://cloud.walletconnect.com/
    storage: new MemoryStorage(),
    logger: new DefaultLogger('debug'),
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
    cleanupInterval: 5 * 60 * 1000 // 5 minutes
  });

  // Initialize the SDK
  await sdk.init();

  // Set up event listeners
  sdk.on('session_connect', (event) => {
    console.log('User connected:', event.userId);
  });

  sdk.on('session_disconnect', (event) => {
    console.log('User disconnected:', event.userId);
  });

  sdk.on('transaction_response', (event) => {
    if (event.data.success) {
      console.log('Transaction successful:', event.data.hash);
    } else {
      console.log('Transaction failed:', event.data.error);
    }
  });

  // Connect a user
  const userId = 'user123';
  const connection = await sdk.connect({
    userId,
    chainId: 1, // Ethereum mainnet
    methods: [
      'eth_sendTransaction',
      'eth_signTransaction',
      'eth_sign',
      'personal_sign',
      'eth_signTypedData'
    ],
    events: ['chainChanged', 'accountsChanged']
  });

  if (connection.success) {
    console.log('Connection URI:', connection.uri);
    console.log('QR Code:', connection.qrCode);
    
    // The user should scan the QR code or use the URI with their wallet
    // Once connected, you can perform transactions and other operations
    
    // Wait for connection (in a real app, you'd poll or use WebSocket)
    await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds
    
    // Check if user is connected
    const isConnected = await sdk.isConnected(userId);
    console.log('User connected:', isConnected);
    
    if (isConnected) {
      // Get user accounts
      const accounts = await sdk.getAccounts(userId);
      console.log('User accounts:', accounts);
      
      // Get balance
      if (accounts.length > 0) {
        const balance = await sdk.getBalance(userId, accounts[0]);
        console.log('Balance:', balance.toString());
      }
      
      // Sign a message
      const signResult = await sdk.signMessage({
        userId,
        message: 'Hello WalletConnect!'
      });
      
      if (signResult.success) {
        console.log('Message signed:', signResult.signature);
      }
      
      // Send a transaction (example)
      const txResult = await sdk.sendTransaction({
        userId,
        to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        value: 1000000000000000n, // 0.001 ETH
        chainId: 1
      });
      
      if (txResult.success) {
        console.log('Transaction sent:', txResult.hash);
      }
    }
    
    // Disconnect user
    await sdk.disconnect(userId);
  } else {
    console.error('Connection failed:', connection.error);
  }

  // Clean up
  await sdk.destroy();
}

// Run the example
basicExample().catch(console.error); 