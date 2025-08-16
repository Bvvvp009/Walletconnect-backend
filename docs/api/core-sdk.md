# 🔧 Core SDK API Reference

This document provides comprehensive API documentation for the WalletConnect Backend SDK.

## 📋 Table of Contents

- [WalletConnectSDK Class](#walletconnectsdk-class)
- [Constructor Options](#constructor-options)
- [Core Methods](#core-methods)
- [Connection Methods](#connection-methods)
- [Transaction Methods](#transaction-methods)
- [Contract Methods](#contract-methods)
- [Wallet Methods](#wallet-methods)
- [Session Methods](#session-methods)
- [Event System](#event-system)
- [Utility Methods](#utility-methods)

## 🏗️ WalletConnectSDK Class

The main class for interacting with WalletConnect v2 protocol.

### Import

```typescript
import { WalletConnectSDK } from 'walletconnect-backend-sdk';
```

### Constructor

```typescript
new WalletConnectSDK(options: SDKOptions)
```

## 🔧 Constructor Options

### SDKOptions Interface

```typescript
interface SDKOptions {
  // Required
  projectId: string;

  // Optional
  relayUrl?: string;
  metadata?: Metadata;
  storage?: StorageAdapter;
  database?: DatabaseConfig;
  logger?: Logger;
  network?: NetworkConfig;
  sessionTimeout?: number;
  cleanupInterval?: number;
  maxSessions?: number;
  timeouts?: Partial<TimeoutConfig>;
  supportedWallets?: string[];
  defaultWallet?: string;
}
```

### Configuration Examples

#### Basic Configuration
```typescript
const sdk = new WalletConnectSDK({
  projectId: 'your_project_id_here'
});
```

#### Advanced Configuration
```typescript
const sdk = new WalletConnectSDK({
  projectId: 'your_project_id_here',
  relayUrl: 'wss://relay.walletconnect.com',
  metadata: {
    name: 'My App',
    description: 'My Web3 Application',
    url: 'https://myapp.com',
    icons: ['https://myapp.com/icon.png']
  },
  timeouts: {
    connection: 60000,
    transaction: 120000,
    signing: 45000,
    contractCall: 90000,
    contractRead: 30000,
    gasEstimation: 30000
  },
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  cleanupInterval: 5 * 60 * 1000, // 5 minutes
  maxSessions: 1000
});
```

## 🚀 Core Methods

### init()

Initialize the SDK and establish connections.

```typescript
await sdk.init(): Promise<void>
```

**Example:**
```typescript
const sdk = new WalletConnectSDK({ projectId: 'your_id' });
await sdk.init();
console.log('SDK initialized successfully');
```

### destroy()

Clean up resources and close connections.

```typescript
await sdk.destroy(): Promise<void>
```

**Example:**
```typescript
await sdk.destroy();
console.log('SDK destroyed successfully');
```

## 🔗 Connection Methods

### connect()

Create a new wallet connection for a user.

```typescript
async connect(request: ConnectionRequest): Promise<ConnectionResponse>
```

**Parameters:**
```typescript
interface ConnectionRequest {
  userId: string;
  chainId?: number;
  methods?: string[];
  events?: string[];
}
```

**Returns:**
```typescript
interface ConnectionResponse {
  success: boolean;
  uri?: string;
  qrCode?: string;
  topic?: string;
  error?: string;
  deepLinks?: WalletDeepLink[];
  timeout?: number;
  estimatedTime?: number;
}
```

**Example:**
```typescript
const connection = await sdk.connect({
  userId: 'user123',
  chainId: 1,
  methods: ['eth_sendTransaction', 'eth_sign', 'personal_sign']
});

if (connection.success) {
  console.log('Connection URI:', connection.uri);
  console.log('QR Code:', connection.qrCode);
  console.log('Deep Links:', connection.deepLinks);
}
```

### isConnected()

Check if a user is connected.

```typescript
async isConnected(userId: string): Promise<boolean>
```

**Example:**
```typescript
const connected = await sdk.isConnected('user123');
console.log('User connected:', connected);
```

### disconnect()

Disconnect a user.

```typescript
async disconnect(userId: string): Promise<boolean>
```

**Example:**
```typescript
const disconnected = await sdk.disconnect('user123');
console.log('User disconnected:', disconnected);
```

## 💰 Transaction Methods

### sendTransaction()

Send a transaction.

```typescript
async sendTransaction(request: TransactionRequest): Promise<TransactionResponse>
```

**Parameters:**
```typescript
interface TransactionRequest {
  userId: string;
  to: Address;
  value?: bigint;
  data?: `0x${string}`;
  gas?: bigint;
  gasPrice?: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
  nonce?: number;
  chainId?: number;
}
```

**Returns:**
```typescript
interface TransactionResponse {
  success: boolean;
  hash?: string;
  error?: string;
}
```

**Example:**
```typescript
const tx = await sdk.sendTransaction({
  userId: 'user123',
  to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  value: 1000000000000000n, // 0.001 ETH
  chainId: 1
});

if (tx.success) {
  console.log('Transaction hash:', tx.hash);
} else {
  console.error('Transaction failed:', tx.error);
}
```

### signMessage()

Sign a message.

```typescript
async signMessage(request: SignMessageRequest): Promise<SignResponse>
```

**Parameters:**
```typescript
interface SignMessageRequest {
  userId: string;
  message: string;
  address?: Address;
}
```

**Returns:**
```typescript
interface SignResponse {
  success: boolean;
  signature?: string;
  error?: string;
}
```

**Example:**
```typescript
const sign = await sdk.signMessage({
  userId: 'user123',
  message: 'Hello WalletConnect!'
});

if (sign.success) {
  console.log('Signature:', sign.signature);
} else {
  console.error('Signing failed:', sign.error);
}
```

### signTypedData()

Sign typed data (EIP-712).

```typescript
async signTypedData(request: SignTypedDataRequest): Promise<SignResponse>
```

**Parameters:**
```typescript
interface SignTypedDataRequest {
  userId: string;
  domain: TypedDataDomain;
  types: Record<string, TypedDataField[]>;
  value: Record<string, any>;
  address?: Address;
}
```

**Example:**
```typescript
const sign = await sdk.signTypedData({
  userId: 'user123',
  domain: {
    name: 'My App',
    version: '1.0.0',
    chainId: 1,
    verifyingContract: '0x1234567890123456789012345678901234567890'
  },
  types: {
    Person: [
      { name: 'name', type: 'string' },
      { name: 'wallet', type: 'address' }
    ]
  },
  value: {
    name: 'Alice',
    wallet: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
  }
});
```

## 🏗️ Contract Methods

### readContract()

Read data from a smart contract.

```typescript
async readContract(request: ContractReadRequest): Promise<ContractReadResponse>
```

**Parameters:**
```typescript
interface ContractReadRequest {
  userId: string;
  contract: ContractConfig;
  functionName: string;
  args?: any[];
}
```

**Returns:**
```typescript
interface ContractReadResponse {
  success: boolean;
  data?: any;
  error?: string;
}
```

**Example:**
```typescript
const result = await sdk.readContract({
  userId: 'user123',
  contract: {
    address: '0xA0b86a33E6441b8C4C8C0C8C0C8C0C8C0C8C0C8C',
    abi: ERC20_ABI,
    chainId: 1
  },
  functionName: 'balanceOf',
  args: ['0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6']
});

if (result.success) {
  console.log('Balance:', result.data);
}
```

### callContract()

Call a smart contract function.

```typescript
async callContract(request: ContractCallRequest): Promise<ContractCallResponse>
```

**Parameters:**
```typescript
interface ContractCallRequest {
  userId: string;
  contract: ContractConfig;
  functionName: string;
  args?: any[];
  value?: bigint;
  gas?: bigint;
}
```

**Returns:**
```typescript
interface ContractCallResponse {
  success: boolean;
  hash?: string;
  error?: string;
}
```

**Example:**
```typescript
const result = await sdk.callContract({
  userId: 'user123',
  contract: {
    address: '0xA0b86a33E6441b8C4C8C0C8C0C8C0C8C0C8C0C8C',
    abi: ERC20_ABI,
    chainId: 1
  },
  functionName: 'transfer',
  args: ['0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', 1000000n]
});

if (result.success) {
  console.log('Transaction hash:', result.hash);
}
```

### encodeFunction()

Encode function call data.

```typescript
async encodeFunction(request: FunctionEncodeRequest): Promise<FunctionEncodeResponse>
```

**Parameters:**
```typescript
interface FunctionEncodeRequest {
  contract: ContractConfig;
  functionName: string;
  args?: any[];
}
```

**Returns:**
```typescript
interface FunctionEncodeResponse {
  success: boolean;
  data?: `0x${string}`;
  error?: string;
}
```

**Example:**
```typescript
const encoded = await sdk.encodeFunction({
  contract: {
    address: '0xA0b86a33E6441b8C4C8C0C8C0C8C0C8C0C8C0C8C',
    abi: ERC20_ABI,
    chainId: 1
  },
  functionName: 'transfer',
  args: ['0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', 1000000n]
});

if (encoded.success) {
  console.log('Encoded data:', encoded.data);
}
```

### decodeFunction()

Decode function call data.

```typescript
async decodeFunction(request: FunctionDecodeRequest): Promise<FunctionDecodeResponse>
```

**Parameters:**
```typescript
interface FunctionDecodeRequest {
  contract: ContractConfig;
  functionName: string;
  data: `0x${string}`;
}
```

**Returns:**
```typescript
interface FunctionDecodeResponse {
  success: boolean;
  args?: any[];
  error?: string;
}
```

**Example:**
```typescript
const decoded = await sdk.decodeFunction({
  contract: {
    address: '0xA0b86a33E6441b8C4C8C0C8C0C8C0C8C0C8C0C8C',
    abi: ERC20_ABI,
    chainId: 1
  },
  functionName: 'transfer',
  data: '0xa9059cbb000000000000000000000000742d35cc6634c0532925a3b8d4c9db96c4b4d8b600000000000000000000000000000000000000000000000000000000000f4240'
});

if (decoded.success) {
  console.log('Decoded args:', decoded.args);
}
```

### estimateGas()

Estimate gas for a contract call.

```typescript
async estimateGas(request: ContractCallRequest): Promise<{ success: boolean; gas?: bigint; error?: string }>
```

**Example:**
```typescript
const gasEstimate = await sdk.estimateGas({
  userId: 'user123',
  contract: {
    address: '0xA0b86a33E6441b8C4C8C0C8C0C8C0C8C0C8C0C8C',
    abi: ERC20_ABI,
    chainId: 1
  },
  functionName: 'transfer',
  args: ['0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', 1000000n]
});

if (gasEstimate.success) {
  console.log('Gas estimate:', gasEstimate.gas?.toString());
}
```

## 📱 Wallet Methods

### getSupportedWallets()

Get all supported wallets or wallets for a specific chain.

```typescript
async getSupportedWallets(chain?: string): Promise<WalletMetadata[]>
```

**Example:**
```typescript
// Get all wallets
const allWallets = await sdk.getSupportedWallets();

// Get wallets for Ethereum
const ethereumWallets = await sdk.getSupportedWallets('eip155:1');
```

### getRecommendedWallets()

Get recommended wallets for a chain.

```typescript
async getRecommendedWallets(chain: string): Promise<WalletMetadata[]>
```

**Example:**
```typescript
const recommended = await sdk.getRecommendedWallets('eip155:1');
console.log('Recommended wallets:', recommended.map(w => w.name));
```

### getWalletDeepLinks()

Generate deep links for a URI.

```typescript
async getWalletDeepLinks(uri: string): Promise<WalletDeepLink[]>
```

**Example:**
```typescript
const deepLinks = await sdk.getWalletDeepLinks('wc:...');
deepLinks.forEach(link => {
  console.log(`${link.wallet}: ${link.universal}`);
});
```

### getWalletInfo()

Get information about a specific wallet.

```typescript
async getWalletInfo(walletName: string): Promise<WalletMetadata | undefined>
```

**Example:**
```typescript
const metamask = await sdk.getWalletInfo('metamask');
if (metamask) {
  console.log('MetaMask description:', metamask.description);
  console.log('Supported chains:', metamask.chains);
}
```

### checkWalletSupport()

Check if a wallet supports a specific method.

```typescript
async checkWalletSupport(walletName: string, method: string): Promise<boolean>
```

**Example:**
```typescript
const supportsTransfer = await sdk.checkWalletSupport('metamask', 'eth_sendTransaction');
console.log('MetaMask supports transfers:', supportsTransfer);
```

## 📊 Session Methods

### getSession()

Get a user's session.

```typescript
async getSession(userId: string): Promise<UserSession | undefined>
```

**Example:**
```typescript
const session = await sdk.getSession('user123');
if (session) {
  console.log('Session active:', session.isActive);
  console.log('Created:', session.createdAt);
}
```

### getAllSessions()

Get all active sessions.

```typescript
async getAllSessions(): Promise<UserSession[]>
```

**Example:**
```typescript
const sessions = await sdk.getAllSessions();
console.log('Active sessions:', sessions.length);
```

### getAccounts()

Get user accounts.

```typescript
async getAccounts(userId: string): Promise<Address[]>
```

**Example:**
```typescript
const accounts = await sdk.getAccounts('user123');
console.log('User accounts:', accounts);
```

### getBalance()

Get user balance.

```typescript
async getBalance(userId: string, address?: Address): Promise<bigint>
```

**Example:**
```typescript
const balance = await sdk.getBalance('user123');
console.log('Balance:', balance.toString());
```

## ⏱️ Timeout Methods

### getTimeoutConfig()

Get current timeout configuration.

```typescript
async getTimeoutConfig(): Promise<TimeoutConfig>
```

**Example:**
```typescript
const timeouts = await sdk.getTimeoutConfig();
console.log('Connection timeout:', timeouts.connection);
```

### updateTimeoutConfig()

Update timeout configuration.

```typescript
async updateTimeoutConfig(newTimeouts: Partial<TimeoutConfig>): Promise<void>
```

**Example:**
```typescript
await sdk.updateTimeoutConfig({
  connection: 90000, // 90 seconds
  transaction: 180000 // 3 minutes
});
```

### getEstimatedTime()

Get estimated time for an operation.

```typescript
async getEstimatedTime(operation: string): Promise<string>
```

**Example:**
```typescript
const estimatedTime = await sdk.getEstimatedTime('connection');
console.log('Estimated connection time:', estimatedTime);
```

### createProgressTracker()

Create a progress tracker for an operation.

```typescript
async createProgressTracker(operation: string, timeout: number): Promise<ProgressTracker>
```

**Example:**
```typescript
const tracker = await sdk.createProgressTracker('connection', 60000);
console.log('Progress:', tracker.getProgress());
console.log('Remaining:', tracker.getRemaining());
```

## 📡 Event System

### on()

Listen for events.

```typescript
on(event: string, callback: (event: WalletConnectEvent) => void): void
```

**Available Events:**
- `session_connect` - User connected
- `session_disconnect` - User disconnected
- `transaction_response` - Transaction completed
- `sign_response` - Message signed
- `error` - Error occurred
- `info` - Information message

**Example:**
```typescript
sdk.on('session_connect', (event) => {
  console.log('User connected:', event.userId);
});

sdk.on('transaction_response', (event) => {
  if (event.data?.success) {
    console.log('Transaction successful:', event.data.hash);
  } else {
    console.error('Transaction failed:', event.data?.error);
  }
});

sdk.on('error', (event) => {
  console.error('SDK error:', event.error);
});
```

### off()

Remove event listener.

```typescript
off(event: string, callback: (event: WalletConnectEvent) => void): void
```

**Example:**
```typescript
const handleConnect = (event) => console.log('Connected:', event.userId);
sdk.on('session_connect', handleConnect);

// Later...
sdk.off('session_connect', handleConnect);
```

## 🛠️ Utility Methods

### clearAllTimers()

Clear all active timers.

```typescript
async clearAllTimers(): Promise<void>
```

### clearTimer()

Clear a specific timer.

```typescript
async clearTimer(operation: string): Promise<void>
```

### generateQRCode()

Generate QR code for a URI.

```typescript
async generateQRCode(uri: string): Promise<string>
```

**Example:**
```typescript
const qrCode = await sdk.generateQRCode('wc:...');
console.log('QR Code:', qrCode);
```

## 🔍 Error Handling

The SDK provides comprehensive error handling with specific error types:

```typescript
import { WalletConnectSDKError, ErrorCodes } from 'walletconnect-backend-sdk';

try {
  await sdk.connect({ userId: 'user123' });
} catch (error) {
  if (error instanceof WalletConnectSDKError) {
    switch (error.code) {
      case ErrorCodes.SESSION_NOT_FOUND:
        console.error('Session not found');
        break;
      case ErrorCodes.USER_NOT_CONNECTED:
        console.error('User not connected');
        break;
      case ErrorCodes.TRANSACTION_FAILED:
        console.error('Transaction failed');
        break;
      default:
        console.error('Unknown error:', error.message);
    }
  }
}
```

## 📚 Type Definitions

### Core Types

```typescript
type Address = `0x${string}`;
type WalletConnectEvent = {
  type: string;
  timestamp: Date;
  userId: string;
  sessionId?: string;
  error?: Error;
  data?: any;
};

interface ProgressTracker {
  getProgress(): number;
  getRemaining(): number;
  isExpired(): boolean;
}
```

### Configuration Types

```typescript
interface Metadata {
  name: string;
  description: string;
  url: string;
  icons: string[];
}

interface TimeoutConfig {
  connection: number;
  transaction: number;
  signing: number;
  contractCall: number;
  contractRead: number;
  gasEstimation: number;
  sessionExpiry: number;
  cleanup: number;
}
```

## 🚀 Best Practices

### 1. Error Handling
Always wrap SDK calls in try-catch blocks and handle specific error types.

### 2. Resource Cleanup
Always call `destroy()` when shutting down your application.

### 3. Session Management
Implement proper session cleanup and timeout handling.

### 4. Event Handling
Use the event system for real-time updates and error monitoring.

### 5. Timeout Configuration
Configure appropriate timeouts based on your use case and user experience requirements.

---

**For more examples and use cases, check out the [Examples Documentation](./examples/).** 