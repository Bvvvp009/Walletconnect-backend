# WalletConnect Backend SDK

A comprehensive WalletConnect SDK for backend implementations with session persistence and multiple database support. This SDK provides a complete solution for integrating WalletConnect v2 into your backend applications, similar to how you would use MetaMask or other EOA wallets.

## 🚀 Features

- **Complete WalletConnect v2 Integration**: Full support for all WalletConnect v2 features
- **Session Persistence**: Automatic session storage and restoration across server restarts
- **Multiple Database Support**: SQLite, PostgreSQL, MySQL, MongoDB, Redis, and in-memory storage
- **Event-Driven Architecture**: Real-time event handling for all WalletConnect operations
- **TypeScript Support**: Full TypeScript support with comprehensive type definitions
- **Production Ready**: Built with scalability and reliability in mind
- **Easy Integration**: Simple API similar to MetaMask for seamless integration

## 📋 Requirements

- Node.js 18+
- TypeScript 5.3+
- WalletConnect Project ID (get from [WalletConnect Cloud](https://cloud.walletconnect.com/))

## 🛠️ Installation

```bash
npm install walletconnect-backend-sdk
```

## 🚀 Quick Start

### Basic Usage

```typescript
import { WalletConnectSDK, MemoryStorage, DefaultLogger } from 'walletconnect-backend-sdk';

// Initialize the SDK
const sdk = new WalletConnectSDK({
  projectId: 'YOUR_PROJECT_ID',
  storage: new MemoryStorage(),
  logger: new DefaultLogger('info'),
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  cleanupInterval: 5 * 60 * 1000 // 5 minutes
});

// Initialize the SDK
await sdk.init();

// Connect a user
const connection = await sdk.connect({
  userId: 'user123',
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
  
  // User scans QR code or uses URI with their wallet
  // Once connected, you can perform transactions and other operations
  
  // Check if user is connected
  const isConnected = await sdk.isConnected('user123');
  
  if (isConnected) {
    // Get user accounts
    const accounts = await sdk.getAccounts('user123');
    
    // Get balance
    const balance = await sdk.getBalance('user123', accounts[0]);
    
    // Sign a message
    const signResult = await sdk.signMessage({
      userId: 'user123',
      message: 'Hello WalletConnect!'
    });
    
    // Send a transaction
    const txResult = await sdk.sendTransaction({
      userId: 'user123',
      to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      value: 1000000000000000n, // 0.001 ETH
      chainId: 1
    });
  }
}
```

### Express Server Integration

```typescript
import express from 'express';
import { WalletConnectSDK, MemoryStorage, DefaultLogger } from 'walletconnect-backend-sdk';

const app = express();
const sdk = new WalletConnectSDK({
  projectId: process.env.WALLETCONNECT_PROJECT_ID,
  storage: new MemoryStorage(),
  logger: new DefaultLogger('info')
});

// Initialize SDK
await sdk.init();

// Connect endpoint
app.post('/api/connect', async (req, res) => {
  const { userId, chainId = 1 } = req.body;
  
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
});

// Transaction endpoint
app.post('/api/transaction', async (req, res) => {
  const { userId, to, value, chainId = 1 } = req.body;
  
  const result = await sdk.sendTransaction({
    userId,
    to,
    value: BigInt(value),
    chainId
  });

  res.json(result);
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

## 📚 API Reference

### SDK Configuration

```typescript
interface SDKOptions {
  projectId: string;                    // WalletConnect Project ID
  relayUrl?: string;                    // Custom relay URL
  metadata?: {                          // App metadata
    name: string;
    description: string;
    url: string;
    icons: string[];
  };
  storage?: StorageAdapter;             // Storage adapter
  database?: DatabaseConfig;            // Database configuration
  logger?: Logger;                      // Logger instance
  network?: NetworkConfig;              // Network configuration
  sessionTimeout?: number;              // Session timeout in ms
  cleanupInterval?: number;             // Cleanup interval in ms
  maxSessions?: number;                 // Maximum sessions
}
```

### Core Methods

#### Connection Management

```typescript
// Connect a user
await sdk.connect(request: ConnectionRequest): Promise<ConnectionResponse>

// Disconnect a user
await sdk.disconnect(userId: string): Promise<boolean>

// Check connection status
await sdk.isConnected(userId: string): Promise<boolean>
```

#### Session Management

```typescript
// Get user session
await sdk.getSession(userId: string): Promise<UserSession | null>

// Get all sessions
await sdk.getAllSessions(): Promise<UserSession[]>

// Refresh session
await sdk.refreshSession(userId: string): Promise<boolean>

// Cleanup sessions
await sdk.cleanupSessions(): Promise<void>
```

#### Transaction Operations

```typescript
// Send transaction
await sdk.sendTransaction(request: TransactionRequest): Promise<TransactionResponse>

// Sign message
await sdk.signMessage(request: SignMessageRequest): Promise<SignResponse>

// Sign typed data
await sdk.signTypedData(request: SignTypedDataRequest): Promise<SignResponse>
```

#### Account Information

```typescript
// Get user accounts
await sdk.getAccounts(userId: string): Promise<Address[]>

// Get account balance
await sdk.getBalance(userId: string, address?: Address): Promise<bigint>
```

#### Event Handling

```typescript
// Listen to events
sdk.on(event: string, callback: (event: WalletConnectEvent) => void): void

// Remove event listener
sdk.off(event: string, callback: (event: WalletConnectEvent) => void): void
```

## 🗄️ Database Support

The SDK supports multiple database backends for session persistence:

### SQLite (Default)

```typescript
import { SQLiteDatabase } from 'walletconnect-backend-sdk';

const sdk = new WalletConnectSDK({
  projectId: 'YOUR_PROJECT_ID',
  database: {
    type: 'sqlite',
    databasePath: './sessions.db'
  }
});
```

### PostgreSQL

```typescript
const sdk = new WalletConnectSDK({
  projectId: 'YOUR_PROJECT_ID',
  database: {
    type: 'postgresql',
    connectionString: 'postgresql://user:password@localhost:5432/walletconnect',
    options: {
      ssl: true,
      max: 20
    }
  }
});
```

### MySQL

```typescript
const sdk = new WalletConnectSDK({
  projectId: 'YOUR_PROJECT_ID',
  database: {
    type: 'mysql',
    connectionString: 'mysql://user:password@localhost:3306/walletconnect',
    options: {
      connectionLimit: 10
    }
  }
});
```

### MongoDB

```typescript
const sdk = new WalletConnectSDK({
  projectId: 'YOUR_PROJECT_ID',
  database: {
    type: 'mongodb',
    connectionString: 'mongodb://localhost:27017',
    databaseName: 'walletconnect',
    options: {
      maxPoolSize: 10
    }
  }
});
```

### Redis

```typescript
const sdk = new WalletConnectSDK({
  projectId: 'YOUR_PROJECT_ID',
  database: {
    type: 'redis',
    connectionString: 'redis://localhost:6379',
    options: {
      keyPrefix: 'wc:',
      ttl: 86400
    }
  }
});
```

### In-Memory (Development)

```typescript
const sdk = new WalletConnectSDK({
  projectId: 'YOUR_PROJECT_ID',
  database: {
    type: 'memory',
    options: {
      maxSize: 1000,
      ttl: 86400
    }
  }
});
```

## 📊 Event System

The SDK provides a comprehensive event system for monitoring all WalletConnect operations:

### Available Events

- `session_connect`: User connected successfully
- `session_disconnect`: User disconnected
- `session_update`: Session updated
- `session_expire`: Session expired
- `session_ping`: Session ping
- `session_event`: Custom session event
- `transaction_request`: Transaction requested
- `transaction_response`: Transaction response received
- `sign_request`: Sign request initiated
- `sign_response`: Sign response received
- `error`: Error occurred
- `warning`: Warning message
- `info`: Information message

### Event Handling Example

```typescript
// Listen to connection events
sdk.on('session_connect', (event) => {
  console.log('User connected:', event.userId);
  console.log('Wallet address:', event.data.address);
  console.log('Chain ID:', event.data.chainId);
});

// Listen to transaction events
sdk.on('transaction_response', (event) => {
  if (event.data.success) {
    console.log('Transaction successful:', event.data.hash);
  } else {
    console.log('Transaction failed:', event.data.error);
  }
});

// Listen to errors
sdk.on('error', (event) => {
  console.error('SDK Error:', event.error);
  console.error('Context:', event.data.context);
});
```

## 🔧 Configuration Options

### Storage Configuration

```typescript
// Memory storage
const memoryStorage = new MemoryStorage();

// File storage
const fileStorage = new FileStorage({
  filePath: './storage.json',
  options: {
    encoding: 'utf8',
    autoBackup: true
  }
});

// Redis storage
const redisStorage = new RedisStorage({
  connectionString: 'redis://localhost:6379',
  options: {
    keyPrefix: 'wc:',
    ttl: 86400
  }
});
```

### Logger Configuration

```typescript
// Console logger
const consoleLogger = new DefaultLogger('info');

// File logger
const fileLogger = new FileLogger('./logs/walletconnect.log', 'debug');

// Silent logger (for production)
const silentLogger = new SilentLogger();
```

### Network Configuration

```typescript
const networkConfig = {
  chains: [
    {
      chainId: 1,
      name: 'Ethereum',
      rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY',
      blockExplorer: 'https://etherscan.io'
    },
    {
      chainId: 137,
      name: 'Polygon',
      rpcUrl: 'https://polygon-rpc.com',
      blockExplorer: 'https://polygonscan.com'
    }
  ],
  defaultChainId: 1
};
```

## 🚀 Production Deployment

### Environment Variables

```bash
# Required
WALLETCONNECT_PROJECT_ID=your_project_id_here

# Optional
WALLETCONNECT_RELAY_URL=wss://relay.walletconnect.com
NODE_ENV=production
LOG_LEVEL=info
DATABASE_URL=your_database_connection_string
```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

### Health Checks

```typescript
// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const sessions = await sdk.getAllSessions();
    const health = await sdk.getHealth();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      activeSessions: sessions.length,
      database: health
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});
```

## 🔒 Security Considerations

1. **Project ID Security**: Keep your WalletConnect Project ID secure
2. **Database Security**: Use secure database connections with SSL
3. **Session Management**: Implement proper session cleanup and validation
4. **Rate Limiting**: Add rate limiting to your API endpoints
5. **Input Validation**: Validate all user inputs before processing
6. **Error Handling**: Don't expose sensitive information in error messages

## 🧪 Testing

```typescript
import { WalletConnectSDK, MemoryStorage } from 'walletconnect-backend-sdk';

describe('WalletConnect SDK', () => {
  let sdk: WalletConnectSDK;

  beforeEach(async () => {
    sdk = new WalletConnectSDK({
      projectId: 'test_project_id',
      storage: new MemoryStorage()
    });
    await sdk.init();
  });

  afterEach(async () => {
    await sdk.destroy();
  });

  it('should connect a user', async () => {
    const connection = await sdk.connect({
      userId: 'test_user',
      chainId: 1
    });

    expect(connection.success).toBe(true);
    expect(connection.uri).toBeDefined();
  });
});
```

## 📝 Examples

See the `examples/` directory for complete working examples:

- `basic-usage.ts`: Basic SDK usage
- `express-server.ts`: Express.js server integration
- `telegram-bot.ts`: Telegram bot integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

- [Documentation](https://github.com/your-org/walletconnect-backend-sdk)
- [Issues](https://github.com/your-org/walletconnect-backend-sdk/issues)
- [Discussions](https://github.com/your-org/walletconnect-backend-sdk/discussions)

## 🔗 Related Links

- [WalletConnect Documentation](https://docs.walletconnect.com/)
- [WalletConnect Cloud](https://cloud.walletconnect.com/)
- [WalletConnect v2 Migration Guide](https://docs.walletconnect.com/2.0/) 