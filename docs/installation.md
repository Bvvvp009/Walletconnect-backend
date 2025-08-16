# 📦 Installation Guide

This guide will help you install and set up the WalletConnect Backend SDK in your project.

## 🎯 Prerequisites

Before installing the SDK, make sure you have:

- **Node.js** version 18.0.0 or higher
- **npm** or **yarn** package manager
- **TypeScript** (recommended for type safety)
- **WalletConnect Cloud** account (for project ID)

### Check Your Environment

```bash
# Check Node.js version
node --version  # Should be >= 18.0.0

# Check npm version
npm --version   # Should be >= 8.0.0

# Check TypeScript (if using)
npx tsc --version
```

## 🚀 Installation

### 1. Install the SDK

Using npm:
```bash
npm install walletconnect-backend-sdk
```

Using yarn:
```bash
yarn add walletconnect-backend-sdk
```

Using pnpm:
```bash
pnpm add walletconnect-backend-sdk
```

### 2. Install Peer Dependencies

The SDK has several peer dependencies that you may need to install:

```bash
# Core dependencies
npm install @walletconnect/sign-client @walletconnect/types viem

# Optional dependencies (install as needed)
npm install express cors dotenv qrcode

# Database dependencies (choose one or more)
npm install sqlite3 sqlite          # SQLite
npm install pg                      # PostgreSQL
npm install mysql2                  # MySQL
npm install mongoose                # MongoDB
npm install redis                   # Redis

# Development dependencies
npm install -D typescript @types/node
```

### 3. TypeScript Configuration

If you're using TypeScript, make sure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## 🔧 Setup WalletConnect Cloud

### 1. Create WalletConnect Cloud Account

1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Sign up or log in to your account
3. Create a new project
4. Copy your Project ID

### 2. Environment Variables

Create a `.env` file in your project root:

```env
# Required
WALLETCONNECT_PROJECT_ID=your_project_id_here

# Optional
NODE_ENV=development
PORT=3000
LOG_LEVEL=info

# Database (if using)
DATABASE_URL=your_database_url_here
REDIS_URL=your_redis_url_here

# Telegram Bot (if using)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
```

### 3. Load Environment Variables

Install and configure dotenv:

```bash
npm install dotenv
```

In your main file:
```typescript
import dotenv from 'dotenv';
dotenv.config();
```

## 🚀 Basic Setup

### 1. Import the SDK

```typescript
import { WalletConnectSDK } from 'walletconnect-backend-sdk';
```

### 2. Initialize the SDK

```typescript
const sdk = new WalletConnectSDK({
  projectId: process.env.WALLETCONNECT_PROJECT_ID!
});

await sdk.init();
```

### 3. Basic Usage Example

```typescript
import { WalletConnectSDK } from 'walletconnect-backend-sdk';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  // Initialize SDK
  const sdk = new WalletConnectSDK({
    projectId: process.env.WALLETCONNECT_PROJECT_ID!
  });

  await sdk.init();

  // Connect a user
  const connection = await sdk.connect({
    userId: 'user123',
    chainId: 1
  });

  if (connection.success) {
    console.log('Connection URI:', connection.uri);
    console.log('QR Code:', connection.qrCode);
  }

  // Cleanup
  await sdk.destroy();
}

main().catch(console.error);
```

## 📦 Package Structure

After installation, you'll have access to:

```
node_modules/walletconnect-backend-sdk/
├── dist/                    # Compiled JavaScript
├── src/                     # TypeScript source
├── examples/                # Example files
├── docs/                    # Documentation
├── package.json
└── README.md
```

## 🔧 Configuration Options

### Basic Configuration

```typescript
const sdk = new WalletConnectSDK({
  projectId: 'your_project_id',
  relayUrl: 'wss://relay.walletconnect.com',
  metadata: {
    name: 'My App',
    description: 'My Web3 Application',
    url: 'https://myapp.com',
    icons: ['https://myapp.com/icon.png']
  }
});
```

### Advanced Configuration

```typescript
const sdk = new WalletConnectSDK({
  projectId: 'your_project_id',
  timeouts: {
    connection: 60000,
    transaction: 120000,
    signing: 45000,
    contractCall: 90000,
    contractRead: 30000,
    gasEstimation: 30000
  },
  storage: new SQLiteStorage({ filename: 'sessions.db' }),
  logger: new ConsoleLogger({ level: 'info' }),
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  cleanupInterval: 5 * 60 * 1000, // 5 minutes
  maxSessions: 1000
});
```

## 🗄️ Database Setup

### SQLite (Default)

```typescript
import { SQLiteStorage } from 'walletconnect-backend-sdk';

const sdk = new WalletConnectSDK({
  projectId: 'your_project_id',
  storage: new SQLiteStorage({
    filename: './sessions.db'
  })
});
```

### PostgreSQL

```typescript
import { PostgreSQLStorage } from 'walletconnect-backend-sdk';

const sdk = new WalletConnectSDK({
  projectId: 'your_project_id',
  storage: new PostgreSQLStorage({
    connectionString: process.env.DATABASE_URL!
  })
});
```

### MongoDB

```typescript
import { MongoDBStorage } from 'walletconnect-backend-sdk';

const sdk = new WalletConnectSDK({
  projectId: 'your_project_id',
  storage: new MongoDBStorage({
    uri: process.env.MONGODB_URI!
  })
});
```

## 🔍 Verification

### 1. Test Installation

Create a test file `test-installation.ts`:

```typescript
import { WalletConnectSDK } from 'walletconnect-backend-sdk';

async function testInstallation() {
  try {
    const sdk = new WalletConnectSDK({
      projectId: process.env.WALLETCONNECT_PROJECT_ID!
    });

    await sdk.init();
    console.log('✅ SDK installed and initialized successfully!');

    const wallets = await sdk.getSupportedWallets();
    console.log(`📱 Found ${wallets.length} supported wallets`);

    await sdk.destroy();
    console.log('✅ SDK destroyed successfully!');
  } catch (error) {
    console.error('❌ Installation test failed:', error);
  }
}

testInstallation();
```

### 2. Run the Test

```bash
npx ts-node test-installation.ts
```

## 🚨 Troubleshooting

### Common Issues

#### 1. TypeScript Errors

**Problem:** TypeScript compilation errors
**Solution:** Make sure you have the correct TypeScript configuration and types installed.

```bash
npm install -D typescript @types/node
```

#### 2. Missing Dependencies

**Problem:** Module not found errors
**Solution:** Install missing peer dependencies.

```bash
npm install @walletconnect/sign-client viem
```

#### 3. Environment Variables

**Problem:** Project ID not found
**Solution:** Make sure your `.env` file is properly configured and loaded.

```typescript
import dotenv from 'dotenv';
dotenv.config();

console.log('Project ID:', process.env.WALLETCONNECT_PROJECT_ID);
```

#### 4. Database Connection

**Problem:** Database connection errors
**Solution:** Check your database configuration and connection strings.

```typescript
// Test database connection
const storage = new SQLiteStorage({ filename: './test.db' });
await storage.init();
```

### Getting Help

If you encounter issues:

1. Check the [Troubleshooting Guide](./troubleshooting.md)
2. Search [GitHub Issues](https://github.com/your-org/walletconnect-backend-sdk/issues)
3. Join our [Discord Community](https://discord.gg/walletconnect)
4. Review the [API Documentation](./api/core-sdk.md)

## 📚 Next Steps

After successful installation:

1. **Read the [Quick Start Guide](./quick-start.md)** for basic usage
2. **Explore [Examples](./examples/)** for real-world use cases
3. **Check [API Reference](./api/core-sdk.md)** for detailed documentation
4. **Review [Best Practices](./advanced/best-practices.md)** for production use

## 🔄 Updates

To update the SDK to the latest version:

```bash
npm update walletconnect-backend-sdk
```

Check the [Changelog](../CHANGELOG.md) for breaking changes and new features.

---

**🎉 Installation complete! Ready to build amazing Web3 applications?** 