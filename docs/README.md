# 📚 WalletConnect Backend SDK Documentation

Welcome to the comprehensive documentation for the WalletConnect Backend SDK - a powerful TypeScript library for integrating WalletConnect v2 protocol into backend applications.

## 🎯 Overview

The WalletConnect Backend SDK provides a complete solution for backend wallet interactions, featuring session persistence, contract interactions, timeout management, and support for 20+ major wallets.

### ✨ Key Features

- 🔗 **WalletConnect v2 Integration** - Full protocol support
- 📱 **20+ Wallet Support** - MetaMask, Trust Wallet, Coinbase, and more
- ⏱️ **Flexible Timeouts** - Configurable for all operations
- 🏗️ **Contract Interactions** - Full viem integration
- 💾 **Session Persistence** - Database storage and recovery
- 📡 **Event System** - Real-time event handling
- 🔧 **TypeScript** - Full type safety
- 🚀 **Production Ready** - Error handling and testing

## 📋 Table of Contents

### 🚀 Getting Started
- [Installation](./installation.md)
- [Quick Start](./quick-start.md)
- [Configuration](./configuration.md)
- [Basic Usage](./basic-usage.md)

### 📖 API Reference
- [Core SDK](./api/core-sdk.md)
- [Types & Interfaces](./api/types.md)
- [Storage Adapters](./api/storage.md)
- [Event System](./api/events.md)
- [Error Handling](./api/errors.md)

### 🏗️ Features
- [Wallet Connections](./features/connections.md)
- [Contract Interactions](./features/contracts.md)
- [Transaction Management](./features/transactions.md)
- [Session Management](./features/sessions.md)
- [Timeout Management](./features/timeouts.md)
- [Wallet Deep Links](./features/deep-links.md)

### 📱 Examples
- [Quick Start Example](./examples/quick-start.md)
- [Express API Server](./examples/express-server.md)
- [Contract Interactions](./examples/contracts.md)
- [DEX Trading Bot](./examples/dex-bot.md)
- [Telegram Bot](./examples/telegram-bot.md)
- [Deep Links & Timeouts](./examples/deep-links.md)

### 🔧 Advanced Topics
- [Database Integration](./advanced/database.md)
- [Custom Storage](./advanced/storage.md)
- [Event Handling](./advanced/events.md)
- [Error Recovery](./advanced/errors.md)
- [Performance Optimization](./advanced/performance.md)
- [Security Best Practices](./advanced/security.md)

### 🚀 Deployment
- [Production Setup](./deployment/production.md)
- [Environment Configuration](./deployment/environment.md)
- [Monitoring & Logging](./deployment/monitoring.md)
- [Scaling Strategies](./deployment/scaling.md)

## 🎯 Use Cases

### Web Applications
Build dApps and DeFi platforms with seamless wallet integration.

### Mobile Applications
Create mobile-first experiences with deep link support.

### DeFi Platforms
Implement automated trading and yield farming strategies.

### NFT Marketplaces
Handle NFT transactions and metadata interactions.

### Gaming
Integrate blockchain features into games and metaverses.

### Enterprise
Build secure, scalable enterprise blockchain solutions.

## 🚀 Quick Start

```bash
# Install the SDK
npm install walletconnect-backend-sdk

# Basic usage
import { WalletConnectSDK } from 'walletconnect-backend-sdk';

const sdk = new WalletConnectSDK({
  projectId: 'YOUR_PROJECT_ID'
});

await sdk.init();
```

## 📊 Supported Wallets

| Wallet | Deep Links | Features |
|--------|------------|----------|
| MetaMask | ✅ | Universal, Native, Web |
| Trust Wallet | ✅ | Universal, Native, Web |
| Coinbase Wallet | ✅ | Universal, Native, Web |
| Rainbow | ✅ | Universal, Native, Web |
| Phantom | ✅ | Universal, Native, Web |
| Argent | ✅ | Universal, Native, Web |
| imToken | ✅ | Universal, Native, Web |
| TokenPocket | ✅ | Universal, Native, Web |
| 1inch | ✅ | Universal, Native, Web |
| OKX | ✅ | Universal, Native, Web |
| Binance | ✅ | Universal, Native, Web |
| SafePal | ✅ | Universal, Native, Web |
| Math Wallet | ✅ | Universal, Native, Web |
| Huobi | ✅ | Universal, Native, Web |
| BitKeep | ✅ | Universal, Native, Web |
| Gate Wallet | ✅ | Universal, Native, Web |
| Bybit Wallet | ✅ | Universal, Native, Web |

## 🔧 Configuration Options

```typescript
interface SDKOptions {
  projectId: string;                    // Required: WalletConnect Cloud project ID
  relayUrl?: string;                    // Optional: Custom relay URL
  metadata?: Metadata;                  // Optional: App metadata
  storage?: StorageAdapter;             // Optional: Custom storage
  database?: DatabaseConfig;            // Optional: Database configuration
  logger?: Logger;                      // Optional: Custom logger
  network?: NetworkConfig;              // Optional: Network settings
  sessionTimeout?: number;              // Optional: Session timeout
  cleanupInterval?: number;             // Optional: Cleanup interval
  maxSessions?: number;                 // Optional: Max sessions
  timeouts?: Partial<TimeoutConfig>;    // Optional: Timeout configuration
  supportedWallets?: string[];          // Optional: Supported wallets
  defaultWallet?: string;               // Optional: Default wallet
}
```

## 📡 Event System

The SDK provides a comprehensive event system for real-time updates:

```typescript
sdk.on('session_connect', (event) => {
  console.log('User connected:', event.userId);
});

sdk.on('transaction_response', (event) => {
  console.log('Transaction completed:', event.data.hash);
});

sdk.on('error', (event) => {
  console.error('Error occurred:', event.error);
});
```

## 🏗️ Contract Interactions

Full viem integration for smart contract interactions:

```typescript
// Read contract
const result = await sdk.readContract({
  userId: 'user123',
  contract: { address, abi, chainId },
  functionName: 'balanceOf',
  args: [userAddress]
});

// Call contract
const tx = await sdk.callContract({
  userId: 'user123',
  contract: { address, abi, chainId },
  functionName: 'transfer',
  args: [recipient, amount]
});
```

## ⏱️ Timeout Management

Flexible timeout configuration for all operations:

```typescript
const sdk = new WalletConnectSDK({
  projectId: 'YOUR_PROJECT_ID',
  timeouts: {
    connection: 60000,      // 60 seconds
    transaction: 120000,    // 2 minutes
    signing: 45000,         // 45 seconds
    contractCall: 90000,    // 1.5 minutes
    contractRead: 30000,    // 30 seconds
    gasEstimation: 30000    // 30 seconds
  }
});
```

## 📱 Deep Links

Generate deep links for all supported wallets:

```typescript
const connection = await sdk.connect({ userId: 'user123' });

// Get deep links for all wallets
connection.deepLinks.forEach(deepLink => {
  console.log(`${deepLink.wallet}: ${deepLink.universal}`);
});
```

## 🔧 Storage Options

Multiple storage adapters for different use cases:

- **Memory Storage** - In-memory storage (default)
- **SQLite** - Local file-based storage
- **PostgreSQL** - Production database
- **MySQL** - Production database
- **MongoDB** - NoSQL database
- **Redis** - High-performance caching

## 🚀 Examples

### Quick Start
```bash
npm run example:quick-start
```

### Express API Server
```bash
npm run example:express-server
```

### Contract Interactions
```bash
npm run example:contract-interactions
```

### DEX Trading Bot
```bash
npm run example:dex-trading-bot
```

### Telegram Bot
```bash
npm run example:telegram-bot
```

## 📚 Additional Resources

- [WalletConnect v2 Documentation](https://docs.walletconnect.com/)
- [Viem Documentation](https://viem.sh/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [GitHub Repository](https://github.com/your-org/walletconnect-backend-sdk)

## 🤝 Community

- [Discord](https://discord.gg/walletconnect)
- [GitHub Issues](https://github.com/your-org/walletconnect-backend-sdk/issues)
- [GitHub Discussions](https://github.com/your-org/walletconnect-backend-sdk/discussions)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

**Ready to build amazing Web3 applications? Start with our [Quick Start Guide](./quick-start.md)! 🚀** 