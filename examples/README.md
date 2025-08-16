# 🚀 WalletConnect Backend SDK Examples

This directory contains comprehensive examples demonstrating how to use the WalletConnect Backend SDK for various use cases.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Express API Server](#express-api-server)
- [Contract Interactions](#contract-interactions)
- [Wallet Deep Links & Timeouts](#wallet-deep-links--timeouts)
- [DEX Trading Bot](#dex-trading-bot)
- [Telegram Bot](#telegram-bot)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)

## 🚀 Quick Start

**File:** `quick-start.ts`

The fastest way to get started with WalletConnect Backend SDK. Perfect for developers who want to see results immediately.

### Features:
- ✅ Minimal configuration
- ✅ User connection with QR code
- ✅ Wallet deep links
- ✅ Progress tracking
- ✅ Basic transactions and signing
- ✅ Complete cleanup

### Usage:
```bash
npm run example:quick-start
```

### What you'll learn:
- How to initialize the SDK
- How to connect users
- How to handle wallet deep links
- How to send transactions and sign messages
- How to manage timeouts and progress

---

## 🌐 Express API Server

**File:** `express-api-server.ts`

A complete Express.js API server showing how to integrate WalletConnect Backend SDK into a web application.

### Features:
- ✅ RESTful API endpoints
- ✅ User session management
- ✅ Transaction handling
- ✅ Contract interactions
- ✅ Wallet information
- ✅ Timeout management
- ✅ Health checks

### API Endpoints:
```
GET    /api/health                    - Health check
POST   /api/connect                   - Create connection
GET    /api/connect/:userId/status    - Check connection status
GET    /api/connect/:userId/accounts  - Get user accounts
GET    /api/connect/:userId/balance   - Get user balance
POST   /api/connect/:userId/transaction - Send transaction
POST   /api/connect/:userId/sign      - Sign message
POST   /api/connect/:userId/contract/read - Read contract
POST   /api/connect/:userId/contract/call - Call contract
POST   /api/connect/:userId/contract/estimate-gas - Estimate gas
GET    /api/wallets                   - Get supported wallets
GET    /api/wallets/recommended       - Get recommended wallets
GET    /api/wallets/:name             - Get specific wallet info
POST   /api/connect/:userId/disconnect - Disconnect user
GET    /api/sessions                  - Get all sessions
GET    /api/timeouts                  - Get timeout config
PUT    /api/timeouts                  - Update timeout config
```

### Usage:
```bash
npm run example:express-server
```

### What you'll learn:
- How to build a RESTful API with WalletConnect
- How to handle multiple users
- How to manage sessions and timeouts
- How to provide wallet information to frontend
- How to handle errors and edge cases

---

## 🏗️ Contract Interactions

**File:** `contract-interactions.ts`

Advanced example showing comprehensive smart contract interactions using viem integration.

### Features:
- ✅ Function encoding/decoding
- ✅ Contract reads and writes
- ✅ Gas estimation
- ✅ Batch operations
- ✅ Event handling
- ✅ Error management

### Supported Operations:
- **Function Encoding**: Convert function calls to bytecode
- **Function Decoding**: Convert bytecode back to readable data
- **Contract Reads**: Call view functions
- **Contract Writes**: Send transactions to contracts
- **Gas Estimation**: Calculate gas costs
- **Batch Reading**: Read multiple functions at once

### Usage:
```bash
npm run example:contract-interactions
```

### What you'll learn:
- How to encode/decode function calls
- How to interact with ERC20 and NFT contracts
- How to estimate gas costs
- How to handle batch operations
- How to manage contract events

---

## 📱 Wallet Deep Links & Timeouts

**File:** `wallet-deep-links-timeouts.ts`

Comprehensive example demonstrating wallet deep links and flexible timeout management.

### Features:
- ✅ 20+ supported wallets
- ✅ Universal, native, and web deep links
- ✅ Flexible timeout configuration
- ✅ Progress tracking
- ✅ Wallet support checking
- ✅ Recommended wallets

### Supported Wallets:
- MetaMask, Trust Wallet, Coinbase Wallet
- Rainbow, Phantom, Argent
- imToken, TokenPocket, 1inch
- OKX, Binance, SafePal
- Math Wallet, Huobi, BitKeep
- Gate Wallet, Bybit Wallet

### Usage:
```bash
npm run example:deep-links-timeouts
```

### What you'll learn:
- How to generate deep links for all wallets
- How to configure timeouts for different operations
- How to track progress of user interactions
- How to check wallet capabilities
- How to provide wallet recommendations

---

## 🤖 DEX Trading Bot

**File:** `dex-trading-bot.ts`

Advanced example showing how to build a DeFi trading bot with automated strategies.

### Features:
- ✅ Automated trading strategies
- ✅ Price monitoring
- ✅ DEX integration (Uniswap V2)
- ✅ Gas optimization
- ✅ Slippage protection
- ✅ Real-time balance tracking

### Trading Features:
- **Price Monitoring**: Track token prices in real-time
- **Trading Strategies**: Buy low, sell high automation
- **DEX Integration**: Direct Uniswap V2 interactions
- **Gas Management**: Optimize transaction costs
- **Slippage Protection**: Prevent unfavorable trades
- **Balance Tracking**: Monitor portfolio performance

### Usage:
```bash
npm run example:dex-trading-bot
```

### What you'll learn:
- How to build automated trading strategies
- How to interact with DEX protocols
- How to manage gas costs and slippage
- How to monitor prices and execute trades
- How to handle complex DeFi operations

---

## 🤖 Telegram Bot

**File:** `telegram-bot.ts`

Mobile-first example showing how to integrate WalletConnect with Telegram for wallet interactions.

### Features:
- ✅ Telegram Bot API integration
- ✅ Mobile wallet deep links
- ✅ Real-time notifications
- ✅ Command-based interface
- ✅ Session management
- ✅ Transaction monitoring

### Bot Commands:
- `/start` - Initialize bot
- `/connect` - Connect wallet
- `/balance` - Check balances
- `/send` - Send transactions
- `/contract` - Smart contract interactions
- `/wallets` - View supported wallets
- `/help` - Show help
- `/disconnect` - Disconnect wallet

### Usage:
```bash
npm run example:telegram-bot
```

### What you'll learn:
- How to integrate with Telegram Bot API
- How to provide mobile-friendly wallet links
- How to handle user commands and interactions
- How to manage sessions across platforms
- How to provide real-time notifications

---

## ⚙️ Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Get WalletConnect Project ID
1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Create a new project
3. Copy your Project ID

### 3. Set Environment Variables
Create a `.env` file in the root directory:
```env
WALLETCONNECT_PROJECT_ID=your_project_id_here
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
```

### 4. Run Examples
```bash
# Quick start
npm run example:quick-start

# Express server
npm run example:express-server

# Contract interactions
npm run example:contract-interactions

# Deep links and timeouts
npm run example:deep-links-timeouts

# DEX trading bot
npm run example:dex-trading-bot

# Telegram bot
npm run example:telegram-bot
```

---

## 🔧 Environment Variables

| Variable | Description | Required For |
|----------|-------------|--------------|
| `WALLETCONNECT_PROJECT_ID` | Your WalletConnect Cloud project ID | All examples |
| `TELEGRAM_BOT_TOKEN` | Telegram Bot API token | Telegram bot example |
| `PORT` | Server port (default: 3000) | Express server |
| `NODE_ENV` | Environment (development/production) | All examples |

---

## 📚 Additional Resources

### Documentation
- [WalletConnect v2 Documentation](https://docs.walletconnect.com/)
- [Viem Documentation](https://viem.sh/)
- [Express.js Documentation](https://expressjs.com/)
- [Telegram Bot API](https://core.telegram.org/bots/api)

### Community
- [WalletConnect Discord](https://discord.gg/walletconnect)
- [GitHub Issues](https://github.com/your-org/walletconnect-backend-sdk/issues)

### Support
- Create an issue on GitHub
- Join our Discord community
- Check the documentation

---

## 🎯 Use Cases

These examples cover the most common use cases for WalletConnect Backend SDK:

1. **Web Applications** - Express API server
2. **Mobile Apps** - Telegram bot with deep links
3. **DeFi Platforms** - DEX trading bot
4. **NFT Marketplaces** - Contract interactions
5. **Gaming** - Quick start for game integration
6. **Enterprise** - Comprehensive timeout management

---

## 🚀 Getting Started

1. **Choose your use case** from the examples above
2. **Follow the setup instructions** to configure your environment
3. **Run the example** to see it in action
4. **Customize the code** for your specific needs
5. **Deploy to production** with proper error handling

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](../CONTRIBUTING.md) for details.

---

**Happy building! 🚀** 