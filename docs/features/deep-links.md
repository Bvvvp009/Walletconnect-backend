# 📱 Wallet Deep Links

The WalletConnect Backend SDK provides comprehensive support for wallet deep links, enabling seamless mobile wallet integration across 20+ major wallets.

## 🎯 Overview

Deep links allow users to connect their wallets directly from mobile applications, providing a smooth user experience without requiring QR code scanning.

### ✨ Features

- ✅ **20+ Supported Wallets** - All major wallets included
- ✅ **Universal Links** - Cross-platform compatibility
- ✅ **Native Deep Links** - Direct app integration
- ✅ **Web Fallbacks** - Browser-based alternatives
- ✅ **Automatic Generation** - No manual configuration needed
- ✅ **Platform Detection** - Smart link selection

## 📱 Supported Wallets

| Wallet | Universal Link | Native Link | Web Link | Features |
|--------|----------------|--------------|----------|----------|
| **MetaMask** | ✅ | ✅ | ✅ | Most popular wallet |
| **Trust Wallet** | ✅ | ✅ | ✅ | Binance ecosystem |
| **Coinbase Wallet** | ✅ | ✅ | ✅ | Exchange wallet |
| **Rainbow** | ✅ | ✅ | ✅ | Beautiful UI |
| **Phantom** | ✅ | ✅ | ✅ | Solana support |
| **Argent** | ✅ | ✅ | ✅ | DeFi focused |
| **imToken** | ✅ | ✅ | ✅ | Asian market |
| **TokenPocket** | ✅ | ✅ | ✅ | Multi-chain |
| **1inch** | ✅ | ✅ | ✅ | DEX aggregator |
| **OKX** | ✅ | ✅ | ✅ | Exchange wallet |
| **Binance** | ✅ | ✅ | ✅ | Exchange wallet |
| **SafePal** | ✅ | ✅ | ✅ | Hardware support |
| **Math Wallet** | ✅ | ✅ | ✅ | Multi-chain |
| **Huobi** | ✅ | ✅ | ✅ | Exchange wallet |
| **BitKeep** | ✅ | ✅ | ✅ | Multi-chain |
| **Gate Wallet** | ✅ | ✅ | ✅ | Exchange wallet |
| **Bybit Wallet** | ✅ | ✅ | ✅ | Exchange wallet |

## 🚀 Basic Usage

### 1. Automatic Deep Link Generation

When you create a connection, deep links are automatically generated:

```typescript
import { WalletConnectSDK } from 'walletconnect-backend-sdk';

const sdk = new WalletConnectSDK({
  projectId: 'YOUR_PROJECT_ID'
});

await sdk.init();

// Create connection - deep links are automatically generated
const connection = await sdk.connect({
  userId: 'user123',
  chainId: 1
});

if (connection.success && connection.deepLinks) {
  console.log('Generated deep links for all wallets:');
  connection.deepLinks.forEach(deepLink => {
    console.log(`${deepLink.wallet}: ${deepLink.universal}`);
  });
}
```

### 2. Deep Link Structure

Each deep link contains three types of links:

```typescript
interface WalletDeepLink {
  wallet: string;        // Wallet name (e.g., 'metamask')
  universal: string;     // Universal link (works on all platforms)
  native: string;        // Native app deep link
  web: string;          // Web fallback link
  qrCode?: string;      // QR code (if available)
}
```

### 3. Display Deep Links

```typescript
// Display deep links for users
if (connection.deepLinks) {
  console.log('📱 Connect with your preferred wallet:');
  
  connection.deepLinks.forEach(deepLink => {
    console.log(`\n🔗 ${deepLink.wallet.toUpperCase()}:`);
    console.log(`  📱 Mobile: ${deepLink.universal}`);
    console.log(`  📲 Native: ${deepLink.native}`);
    console.log(`  🌐 Web: ${deepLink.web}`);
  });
}
```

## 🔧 Advanced Usage

### 1. Get Specific Wallet Deep Links

```typescript
// Get deep links for specific wallets
const metamaskLink = connection.deepLinks?.find(dl => dl.wallet === 'metamask');
const trustWalletLink = connection.deepLinks?.find(dl => dl.wallet === 'trustwallet');

if (metamaskLink) {
  console.log('MetaMask universal link:', metamaskLink.universal);
}
```

### 2. Generate Custom Deep Links

```typescript
// Generate deep links for any URI
const customDeepLinks = await sdk.getWalletDeepLinks('wc:your_custom_uri_here');

customDeepLinks.forEach(deepLink => {
  console.log(`${deepLink.wallet}: ${deepLink.universal}`);
});
```

### 3. Filter by Chain Support

```typescript
// Get wallets that support Ethereum
const ethereumWallets = await sdk.getSupportedWallets('eip155:1');

// Generate deep links only for Ethereum wallets
const ethereumDeepLinks = connection.deepLinks?.filter(deepLink => 
  ethereumWallets.some(wallet => wallet.name.toLowerCase() === deepLink.wallet)
);
```

## 📱 Mobile Integration

### 1. React Native Example

```typescript
import { Linking } from 'react-native';

// Open wallet deep link
const openWallet = async (deepLink: WalletDeepLink) => {
  try {
    const supported = await Linking.canOpenURL(deepLink.universal);
    
    if (supported) {
      await Linking.openURL(deepLink.universal);
    } else {
      // Fallback to web link
      await Linking.openURL(deepLink.web);
    }
  } catch (error) {
    console.error('Failed to open wallet:', error);
  }
};

// Usage
const metamaskLink = connection.deepLinks?.find(dl => dl.wallet === 'metamask');
if (metamaskLink) {
  await openWallet(metamaskLink);
}
```

### 2. Flutter Example

```dart
import 'package:url_launcher/url_launcher.dart';

Future<void> openWallet(String universalLink) async {
  if (await canLaunch(universalLink)) {
    await launch(universalLink);
  } else {
    // Fallback to web link
    await launch(webLink);
  }
}
```

### 3. Web Example

```typescript
// Web-based deep link handling
const openWallet = (deepLink: WalletDeepLink) => {
  // Try universal link first
  window.location.href = deepLink.universal;
  
  // Fallback to web link after timeout
  setTimeout(() => {
    window.location.href = deepLink.web;
  }, 2000);
};
```

## 🎨 UI Integration

### 1. Wallet Selection Modal

```typescript
// Create a wallet selection interface
const WalletSelector = ({ deepLinks, onSelect }: { 
  deepLinks: WalletDeepLink[], 
  onSelect: (deepLink: WalletDeepLink) => void 
}) => {
  return (
    <div className="wallet-selector">
      <h3>Choose your wallet</h3>
      <div className="wallet-grid">
        {deepLinks.map(deepLink => (
          <button
            key={deepLink.wallet}
            onClick={() => onSelect(deepLink)}
            className="wallet-button"
          >
            <img src={`/icons/${deepLink.wallet}.png`} alt={deepLink.wallet} />
            <span>{deepLink.wallet}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
```

### 2. Deep Link Button

```typescript
// Individual wallet button
const WalletButton = ({ deepLink }: { deepLink: WalletDeepLink }) => {
  const handleClick = () => {
    // Try universal link first
    window.open(deepLink.universal, '_blank');
    
    // Fallback to web link
    setTimeout(() => {
      window.open(deepLink.web, '_blank');
    }, 1000);
  };

  return (
    <button onClick={handleClick} className="wallet-deep-link-btn">
      <img src={`/icons/${deepLink.wallet}.png`} alt={deepLink.wallet} />
      <span>Connect with {deepLink.wallet}</span>
    </button>
  );
};
```

## 🔍 Wallet Information

### 1. Get Wallet Details

```typescript
// Get detailed information about a wallet
const walletInfo = await sdk.getWalletInfo('metamask');

if (walletInfo) {
  console.log('Wallet Details:');
  console.log('  Name:', walletInfo.name);
  console.log('  Description:', walletInfo.description);
  console.log('  URL:', walletInfo.url);
  console.log('  Supported chains:', walletInfo.chains);
  console.log('  Features:', walletInfo.features);
  console.log('  Supported methods:', walletInfo.supportedMethods);
}
```

### 2. Check Wallet Support

```typescript
// Check if wallet supports specific methods
const supportsTransfer = await sdk.checkWalletSupport('metamask', 'eth_sendTransaction');
const supportsSign = await sdk.checkWalletSupport('metamask', 'eth_sign');

console.log('MetaMask supports transfers:', supportsTransfer);
console.log('MetaMask supports signing:', supportsSign);
```

### 3. Get Recommended Wallets

```typescript
// Get recommended wallets for a chain
const recommended = await sdk.getRecommendedWallets('eip155:1');

console.log('Recommended wallets for Ethereum:');
recommended.forEach(wallet => {
  console.log(`  - ${wallet.name} (${wallet.shortName})`);
});
```

## 🌐 Platform-Specific Handling

### 1. iOS Deep Links

```typescript
// iOS-specific deep link handling
const openWalletIOS = (deepLink: WalletDeepLink) => {
  // iOS prefers universal links
  window.location.href = deepLink.universal;
};
```

### 2. Android Deep Links

```typescript
// Android-specific deep link handling
const openWalletAndroid = (deepLink: WalletDeepLink) => {
  // Android can handle both universal and native links
  const link = deepLink.native || deepLink.universal;
  window.location.href = link;
};
```

### 3. Desktop Deep Links

```typescript
// Desktop-specific deep link handling
const openWalletDesktop = (deepLink: WalletDeepLink) => {
  // Desktop typically uses web links
  window.open(deepLink.web, '_blank');
};
```

## 🔧 Configuration

### 1. Custom Deep Link Generation

```typescript
// Custom deep link configuration
const sdk = new WalletConnectSDK({
  projectId: 'YOUR_PROJECT_ID',
  supportedWallets: ['metamask', 'trustwallet', 'coinbasewallet'], // Limit to specific wallets
  defaultWallet: 'metamask' // Set default wallet
});
```

### 2. Deep Link Timeouts

```typescript
// Configure timeouts for deep link operations
const sdk = new WalletConnectSDK({
  projectId: 'YOUR_PROJECT_ID',
  timeouts: {
    connection: 60000, // 60 seconds for deep link connections
    transaction: 120000,
    signing: 45000
  }
});
```

## 🚨 Troubleshooting

### Common Issues

1. **Deep Links Not Opening**
   - Check if wallet app is installed
   - Verify deep link format
   - Test with universal link validator

2. **Fallback Not Working**
   - Ensure web links are accessible
   - Check browser compatibility
   - Verify URL encoding

3. **Platform Detection Issues**
   - Use user agent detection
   - Implement platform-specific logic
   - Test on multiple devices

### Debug Mode

```typescript
// Enable debug logging for deep links
const sdk = new WalletConnectSDK({
  projectId: 'YOUR_PROJECT_ID',
  logger: new ConsoleLogger({ level: 'debug' })
});

// Debug deep link generation
sdk.on('info', (event) => {
  if (event.data?.context === 'deep_links') {
    console.log('Deep link debug:', event.data);
  }
});
```

## 📚 Best Practices

### 1. User Experience

- **Show QR Code First** - Always provide QR code as primary option
- **Display Deep Links** - Show deep links as secondary option
- **Clear Instructions** - Provide step-by-step guidance
- **Fallback Options** - Always have web fallback

### 2. Platform Handling

- **Detect Platform** - Use user agent or platform detection
- **Platform-Specific Links** - Use appropriate link type per platform
- **Graceful Degradation** - Fallback to web if deep links fail

### 3. Error Handling

- **Timeout Handling** - Set appropriate timeouts
- **Error Recovery** - Provide alternative connection methods
- **User Feedback** - Clear error messages and solutions

## 🔗 Related Documentation

- [Quick Start Guide](../quick-start.md)
- [API Reference](../api/core-sdk.md)
- [Wallet Registry](../api/wallet-registry.md)
- [Mobile Integration](../advanced/mobile.md)
- [Platform Detection](../advanced/platforms.md)

---

**Ready to implement deep links in your application? Check out the [Mobile Integration Guide](../advanced/mobile.md)! 📱** 