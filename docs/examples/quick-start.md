# 🚀 Quick Start Example

The Quick Start example demonstrates the fastest way to get started with the WalletConnect Backend SDK. This example is perfect for developers who want to see immediate results and understand the basic workflow.

## 🎯 Overview

This example covers:
- ✅ SDK initialization
- ✅ User connection with QR code
- ✅ Wallet deep links display
- ✅ Progress tracking
- ✅ Basic transactions and signing
- ✅ Complete cleanup

## 📁 File Location

```
examples/quick-start.ts
```

## 🚀 Running the Example

### Prerequisites

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   echo "WALLETCONNECT_PROJECT_ID=your_project_id_here" > .env
   ```

3. **Get WalletConnect Project ID:**
   - Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
   - Create a new project
   - Copy your Project ID

### Run the Example

```bash
npm run example:quick-start
```

## 📖 Code Walkthrough

### 1. SDK Initialization

```typescript
// Initialize SDK (minimal configuration)
const sdk = new WalletConnectSDK({
  projectId: 'YOUR_PROJECT_ID' // Get from https://cloud.walletconnect.com/
});

await sdk.init();
console.log('✅ SDK initialized');
```

**What this does:**
- Creates a new SDK instance with minimal configuration
- Initializes the SDK and establishes connections
- Uses default settings for timeouts and storage

### 2. User Connection

```typescript
const userId = 'user-' + Date.now(); // Generate unique user ID
console.log(`\n🔗 Connecting user: ${userId}`);

const connection = await sdk.connect({
  userId,
  chainId: 1, // Ethereum mainnet
  methods: ['eth_sendTransaction', 'eth_sign', 'personal_sign']
});
```

**What this does:**
- Generates a unique user ID
- Creates a connection request for Ethereum mainnet
- Requests permission for transactions and signing

### 3. Connection Response

```typescript
if (!connection.success) {
  console.error('❌ Connection failed:', connection.error);
  return;
}

console.log('✅ Connected successfully!');
console.log(`📱 URI: ${connection.uri}`);
console.log(`⏱️ Timeout: ${connection.timeout}ms`);
```

**Response includes:**
- `uri`: WalletConnect URI for QR code scanning
- `qrCode`: Base64 encoded QR code image
- `deepLinks`: Deep links for all supported wallets
- `timeout`: Connection timeout in milliseconds
- `estimatedTime`: Estimated time for connection

### 4. Wallet Deep Links

```typescript
// Show available wallet deep links
if (connection.deepLinks) {
  console.log('\n📱 Available Wallet Deep Links:');
  connection.deepLinks.slice(0, 5).forEach(deepLink => { // Show first 5
    console.log(`  - ${deepLink.wallet}: ${deepLink.universal}`);
  });
  console.log(`  ... and ${connection.deepLinks.length - 5} more wallets`);
}
```

**Deep links include:**
- `universal`: Universal link for all platforms
- `native`: Native app deep link
- `web`: Web fallback link

### 5. Progress Tracking

```typescript
// Wait for user to connect (with progress tracking)
console.log('\n⏳ Waiting for user to connect...');
const progressTracker = await sdk.createProgressTracker('connection', connection.timeout!);

let connected = false;
const maxAttempts = Math.ceil(connection.timeout! / 2000); // Check every 2 seconds
let attempts = 0;

while (!connected && attempts < maxAttempts) {
  connected = await sdk.isConnected(userId);
  if (!connected) {
    const progress = progressTracker.getProgress();
    const remaining = progressTracker.getRemaining();
    console.log(`⏳ Progress: ${progress}% (${Math.round(remaining / 1000)}s remaining)`);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    attempts++;
  }
}
```

**Progress tracking features:**
- Real-time progress percentage
- Remaining time calculation
- Automatic timeout handling
- User-friendly progress display

### 6. User Information

```typescript
// Get user accounts and balance
const accounts = await sdk.getAccounts(userId);
const balance = await sdk.getBalance(userId);

console.log('\n👤 User Information:');
console.log(`  - Address: ${accounts[0]}`);
console.log(`  - ETH Balance: ${balance.toString()} wei`);
```

**Information retrieved:**
- User's wallet addresses
- ETH balance in wei
- Account details

### 7. Transaction Sending

```typescript
// Send a simple transaction
console.log('\n✍️ Sending test transaction...');
const txResult = await sdk.sendTransaction({
  userId,
  to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  value: 1000000000000000n, // 0.001 ETH
  chainId: 1
});

if (txResult.success) {
  console.log('✅ Transaction successful!');
  console.log(`  - Hash: ${txResult.hash}`);
} else {
  console.log('❌ Transaction failed:', txResult.error);
}
```

**Transaction features:**
- Send ETH to any address
- Automatic gas estimation
- Transaction hash tracking
- Error handling

### 8. Message Signing

```typescript
// Sign a message
console.log('\n✍️ Signing test message...');
const signResult = await sdk.signMessage({
  userId,
  message: 'Hello WalletConnect Backend SDK!'
});

if (signResult.success) {
  console.log('✅ Message signed successfully!');
  console.log(`  - Signature: ${signResult.signature}`);
} else {
  console.log('❌ Message signing failed:', signResult.error);
}
```

**Signing features:**
- Sign arbitrary messages
- EIP-191 compliant signatures
- Signature verification ready
- Error handling

### 9. Cleanup

```typescript
// Cleanup
console.log('\n🧹 Cleaning up...');
await sdk.disconnect(userId);
await sdk.destroy();
console.log('✅ Done!');
```

**Cleanup process:**
- Disconnect user session
- Destroy SDK instance
- Clean up resources
- Close connections

## 📱 Expected Output

When you run the example, you'll see output similar to:

```
🚀 WalletConnect Backend SDK - Quick Start

✅ SDK initialized

🔗 Connecting user: user-1703123456789

✅ Connected successfully!
📱 URI: wc:1234567890abcdef...
⏱️ Timeout: 30000ms

📱 Available Wallet Deep Links:
  - metamask: https://metamask.app.link/dapp/...
  - trustwallet: https://link.trustwallet.com/open_url?coin_id=60&url=...
  - coinbasewallet: https://wallet.coinbase.com/wsegue...
  - rainbow: https://rainbow.me...
  - argent: https://argent.xyz...
  ... and 15 more wallets

⏳ Waiting for user to connect...
⏳ Progress: 0% (30s remaining)
⏳ Progress: 7% (28s remaining)
⏳ Progress: 13% (26s remaining)
...
✅ User connected successfully!

👤 User Information:
  - Address: 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6
  - ETH Balance: 1000000000000000000 wei

✍️ Sending test transaction...
✅ Transaction successful!
  - Hash: 0x1234567890abcdef...

✍️ Signing test message...
✅ Message signed successfully!
  - Signature: 0xabcdef1234567890...

🧹 Cleaning up...
✅ Done!

🎉 Quick start completed successfully!
📚 Check other examples for more advanced features.
```

## 🔧 Customization

### Modify Timeouts

```typescript
const sdk = new WalletConnectSDK({
  projectId: 'YOUR_PROJECT_ID',
  timeouts: {
    connection: 60000, // 60 seconds
    transaction: 120000, // 2 minutes
    signing: 45000 // 45 seconds
  }
});
```

### Add Custom Methods

```typescript
const connection = await sdk.connect({
  userId,
  chainId: 1,
  methods: [
    'eth_sendTransaction',
    'eth_sign',
    'personal_sign',
    'eth_signTypedData',
    'eth_call',
    'eth_estimateGas'
  ]
});
```

### Custom Chain Support

```typescript
const connection = await sdk.connect({
  userId,
  chainId: 137, // Polygon
  methods: ['eth_sendTransaction', 'eth_sign']
});
```

## 🚨 Troubleshooting

### Common Issues

1. **Connection Timeout**
   - Increase connection timeout
   - Check network connectivity
   - Verify project ID

2. **Transaction Failures**
   - Ensure sufficient ETH balance
   - Check gas prices
   - Verify recipient address

3. **Signing Failures**
   - Check wallet permissions
   - Verify message format
   - Ensure wallet is unlocked

### Debug Mode

Enable debug logging:

```typescript
const sdk = new WalletConnectSDK({
  projectId: 'YOUR_PROJECT_ID',
  logger: new ConsoleLogger({ level: 'debug' })
});
```

## 📚 Next Steps

After completing the Quick Start example:

1. **Explore Contract Interactions** - Learn about smart contract calls
2. **Build Express API Server** - Create a RESTful API
3. **Implement Deep Links** - Add mobile wallet support
4. **Create Trading Bot** - Build DeFi applications
5. **Add Telegram Integration** - Mobile-first experiences

## 🔗 Related Documentation

- [Installation Guide](../installation.md)
- [API Reference](../api/core-sdk.md)
- [Configuration Guide](../configuration.md)
- [Error Handling](../api/errors.md)
- [Event System](../api/events.md)

---

**Ready to build more advanced applications? Check out the [Express API Server Example](./express-server.md)! 🚀** 