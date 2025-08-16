# 🧪 WalletConnect Backend SDK - Test Suite

This directory contains comprehensive tests for the WalletConnect Backend SDK, covering all core functionality, multi-chain support, batch transactions, and EIP signing.

## 📋 Test Overview

### 🎯 Test Coverage

- ✅ **Core Functionality** - Wallet connections, QR codes, deep links
- ✅ **Contract Interactions** - Smart contract reads, writes, gas estimation
- ✅ **Multi-Chain Support** - Ethereum, Polygon, Base Sepolia, Solana
- ✅ **Batch Transactions** - Multiple transaction handling
- ✅ **EIP Signing** - EIP-191, EIP-712, EIP-1559 support
- ✅ **Wallet Registry** - 20+ wallet support verification
- ✅ **Timeout Management** - Configurable timeouts
- ✅ **Error Handling** - Comprehensive error scenarios
- ✅ **Performance** - High-volume and concurrent operations

## 🚀 Running Tests

### Prerequisites

1. **Set up environment variables:**
   ```bash
   echo "WALLETCONNECT_PROJECT_ID=your_project_id_here" > .env
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Get WalletConnect Project ID:**
   - Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
   - Create a new project
   - Copy your Project ID

### Test Commands

#### Run All Tests
```bash
npm test
```

#### Run Specific Test Suites
```bash
# Core functionality tests
npm run test:core

# Solana support tests
npm run test:solana

# Batch transaction tests
npm run test:batch
```

#### Run with Options
```bash
# Quick tests (basic functionality only)
npm run test:quick

# Verbose output
npm run test:verbose
```

## 📁 Test Files

### 1. `core-functionality.test.ts`
**Comprehensive core functionality tests**

**Features Tested:**
- ✅ Wallet connection with QR code generation
- ✅ Deep links for 20+ wallets
- ✅ Progress tracking and timeout handling
- ✅ Contract interactions (read/write)
- ✅ Transaction sending and signing
- ✅ Multi-chain support (Ethereum, Polygon, Base Sepolia)
- ✅ Wallet registry and recommendations
- ✅ Session management
- ✅ Error handling scenarios

**Key Tests:**
```typescript
// Wallet connection with QR code
const connection = await sdk.connect({
  userId: TEST_USER_ID,
  chainId: 84532, // Base Sepolia
  methods: ['eth_sendTransaction', 'eth_sign', 'personal_sign']
});

// Contract interaction
const result = await sdk.readContract({
  userId: TEST_USER_ID,
  contract: STORAGE_CONTRACT,
  functionName: 'retrieve',
  args: []
});
```

### 2. `solana-support.test.ts`
**Solana network support tests**

**Features Tested:**
- ✅ Solana wallet connections (Phantom, Solflare, etc.)
- ✅ Solana transaction signing
- ✅ Solana program interactions
- ✅ Multi-network Solana support (mainnet, devnet, testnet)
- ✅ Cross-chain operations
- ✅ Solana-specific error handling

**Key Tests:**
```typescript
// Solana connection
const connection = await sdk.connect({
  userId: TEST_USER_ID,
  chainId: 'solana:mainnet',
  methods: [
    'solana_signTransaction',
    'solana_signMessage',
    'solana_signAndSendTransaction'
  ]
});

// Solana program interaction
const result = await sdk.callSolanaProgram({
  userId: TEST_USER_ID,
  program: SOLANA_PROGRAM,
  instruction: 'transfer',
  accounts: [...],
  data: [...]
});
```

### 3. `batch-transactions.test.ts`
**Batch transaction and EIP signing tests**

**Features Tested:**
- ✅ Multiple simple transactions in batch
- ✅ Batch contract transactions
- ✅ Mixed transaction types
- ✅ EIP-191 message signing
- ✅ EIP-712 typed data signing
- ✅ EIP-1559 transaction support
- ✅ Wallet ownership verification
- ✅ High-volume transaction handling
- ✅ Concurrent operations

**Key Tests:**
```typescript
// Batch simple transactions
const transactions = [
  { to: accounts[0], value: 100000000000000n },
  { to: accounts[0], value: 100000000000000n },
  { to: accounts[0], value: 100000000000000n }
];

for (const tx of transactions) {
  const result = await sdk.sendTransaction({
    userId: TEST_USER_ID,
    ...tx,
    chainId: 84532
  });
}

// EIP-712 signing
const result = await sdk.signTypedData({
  userId: TEST_USER_ID,
  domain: typedData.domain,
  types: typedData.types,
  value: typedData.value
});
```

### 4. `test-runner.ts`
**Automated test runner with reporting**

**Features:**
- ✅ Automated test execution
- ✅ Comprehensive reporting
- ✅ Color-coded output
- ✅ Performance metrics
- ✅ Error tracking
- ✅ Test suite organization

## 🎯 Test Configuration

### Environment Variables
```env
WALLETCONNECT_PROJECT_ID=your_project_id_here
NODE_ENV=test
LOG_LEVEL=info
```

### Test Contracts
```typescript
// Storage contract for testing
const STORAGE_CONTRACT = {
  address: '0xab501890DAb0Bf3ab9A019cC00FB3Dd21298E1Fd',
  chainId: 84532, // Base Sepolia
  abi: [
    {
      "inputs": [],
      "name": "retrieve",
      "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "uint256", "name": "num", "type": "uint256"}],
      "name": "store",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
};
```

### Timeout Configuration
```typescript
const TEST_CONFIG = {
  timeouts: {
    connection: 120000, // 2 minutes
    transaction: 180000, // 3 minutes
    signing: 60000, // 1 minute
    contractCall: 120000, // 2 minutes
    contractRead: 30000, // 30 seconds
    gasEstimation: 30000 // 30 seconds
  }
};
```

## 📊 Expected Test Results

### Core Functionality Tests
```
📋 Running Test Suite: Core Functionality Tests
==================================================
✅ Wallet Connection Creation (150ms)
✅ QR Code Generation (120ms)
✅ Deep Links Generation (180ms)
==================================================
📊 Suite Results: 3 passed, 0 failed (450ms)
```

### Contract Interaction Tests
```
📋 Running Test Suite: Contract Interaction Tests
==================================================
✅ Contract Read Operation (200ms)
✅ Gas Estimation (150ms)
==================================================
📊 Suite Results: 2 passed, 0 failed (350ms)
```

### Multi-Chain Support Tests
```
📋 Running Test Suite: Multi-Chain Support Tests
==================================================
✅ Ethereum Mainnet Support (100ms)
✅ Polygon Support (100ms)
✅ Base Sepolia Support (100ms)
==================================================
📊 Suite Results: 3 passed, 0 failed (300ms)
```

### Final Report
```
📊 Final Test Report
============================================================
✅ Passed: 13
❌ Failed: 0
📈 Total: 13
⏱️ Duration: 1500ms
📊 Success Rate: 100.0%
============================================================
🎉 All tests passed successfully!
```

## 🔧 Manual Testing

### QR Code Testing
1. Run the core functionality tests
2. Look for QR code output in console
3. Scan with your wallet app
4. Verify connection success

### Deep Links Testing
1. Run tests to generate deep links
2. Click on deep links for different wallets
3. Verify wallet app opens correctly
4. Test fallback web links

### Contract Interaction Testing
1. Ensure you have test ETH on Base Sepolia
2. Run contract interaction tests
3. Verify contract reads work
4. Test contract writes (requires user approval)

### Batch Transaction Testing
1. Ensure sufficient balance for multiple transactions
2. Run batch transaction tests
3. Approve transactions in your wallet
4. Verify all transactions complete successfully

## 🚨 Troubleshooting

### Common Issues

#### 1. Project ID Not Set
```
❌ Error: WALLETCONNECT_PROJECT_ID not set in environment variables
```
**Solution:** Set your WalletConnect Project ID in `.env` file

#### 2. Connection Timeouts
```
⏰ Connection timed out - continuing with tests...
```
**Solution:** Increase timeout values or check network connectivity

#### 3. Insufficient Balance
```
⚠️ Insufficient balance for transaction test
```
**Solution:** Add test ETH to your wallet on Base Sepolia

#### 4. Contract Not Found
```
❌ Contract interaction failed: Contract not found
```
**Solution:** Verify contract address and chain ID

### Debug Mode
Enable verbose logging:
```bash
npm run test:verbose
```

### Manual Test Execution
Run individual test files:
```bash
# Core functionality
npx ts-node tests/core-functionality.test.ts

# Solana support
npx ts-node tests/solana-support.test.ts

# Batch transactions
npx ts-node tests/batch-transactions.test.ts
```

## 📈 Performance Metrics

### Test Performance Targets
- **Connection Time:** < 5 seconds
- **QR Code Generation:** < 1 second
- **Deep Links Generation:** < 2 seconds
- **Contract Read:** < 3 seconds
- **Gas Estimation:** < 2 seconds
- **Transaction Signing:** < 10 seconds
- **Batch Operations:** < 30 seconds

### Performance Monitoring
```typescript
// Performance tracking in tests
const startTime = Date.now();
const result = await sdk.connect({ userId, chainId: 1 });
const duration = Date.now() - startTime;

console.log(`Connection completed in ${duration}ms`);
```

## 🔗 Related Documentation

- [Installation Guide](../docs/installation.md)
- [API Reference](../docs/api/core-sdk.md)
- [Examples](../examples/README.md)
- [Core SDK Documentation](../docs/README.md)

## 🎉 Test Success Criteria

### ✅ All Tests Must Pass
- Core functionality tests: 100% pass rate
- Contract interaction tests: 100% pass rate
- Multi-chain support tests: 100% pass rate
- Batch transaction tests: 100% pass rate

### ✅ Performance Requirements
- Connection establishment: < 5 seconds
- QR code generation: < 1 second
- Deep links generation: < 2 seconds
- Contract operations: < 5 seconds

### ✅ Error Handling
- Graceful timeout handling
- Proper error messages
- Recovery mechanisms
- User-friendly feedback

---

**🧪 Ready to test the WalletConnect Backend SDK? Run `npm test` to start!** 