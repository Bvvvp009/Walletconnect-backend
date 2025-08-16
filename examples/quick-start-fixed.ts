import { WalletConnectSDK } from '../src/core/WalletConnectSDK';
import { DefaultLogger } from '../src/utils/Logger';
import * as qrcode from 'qrcode-terminal';

/**
 * 🚀 Quick Start Example - Fixed for Node.js
 * 
 * This example shows the fastest way to get started with WalletConnect Backend SDK.
 * Perfect for developers who want to see results immediately.
 * 
 * Includes Trust Wallet deep link implementation to fix common connection issues.
 */

/**
 * Trust Wallet Deep Link Implementation - Node.js Compatible
 * Fixes common issues with Trust Wallet connections
 */
class TrustWalletConnector {
  /**
   * Generate Trust Wallet deep links with proper formatting
   */
  static generateTrustWalletLinks(uri: string) {
    // ✅ Always encode the URI - this is the most common fix
    const encodedUri = encodeURIComponent(uri);
    const unencodedUri = uri;
    
    return {
      primary: {
        // Primary format - most reliable (ENCODED)
        universal: `https://link.trustwallet.com/open_url?coin_id=60&url=${encodedUri}`,
        native: `trust://open_url?coin_id=60&url=${encodedUri}`
      },
      alternative: {
        // Alternative format - sometimes works better (UNENCODED)
        universal: `https://link.trustwallet.com/open_url?coin_id=60&url=${unencodedUri}`,
        native: `trust://open_url?coin_id=60&url=${unencodedUri}`
      },
      fallback: {
        // Direct WalletConnect format
        direct: `trust://wc?uri=${encodedUri}`,
        // Generic deep link format
        generic: `trust://dapp?uri=${encodedUri}`,
        // App store fallbacks
        appStore: {
          ios: 'https://apps.apple.com/app/trust-crypto-bitcoin-wallet/id1288339409',
          android: 'https://play.google.com/store/apps/details?id=com.wallet.crypto.trustapp'
        }
      }
    };
  }

  /**
   * Test Trust Wallet deep links
   */
  static testTrustWalletLinks(uri: string) {
    console.log('\n🧪 Testing Trust Wallet Deep Links...');
    
    const links = this.generateTrustWalletLinks(uri);
    
    console.log(`🔗 Original URI: ${uri}`);
    console.log(`🔗 Encoded URI: ${encodeURIComponent(uri)}`);
    
    console.log('\n📱 Generated Links:');
    console.log('Primary (ENCODED - Most Reliable):');
    console.log(`  Universal: ${links.primary.universal}`);
    console.log(`  Native: ${links.primary.native}`);
    
    console.log('\nAlternative (UNENCODED - Sometimes Better):');
    console.log(`  Universal: ${links.alternative.universal}`);
    console.log(`  Native: ${links.alternative.native}`);
    
    console.log('\nFallback:');
    console.log(`  Direct: ${links.fallback.direct}`);
    console.log(`  Generic: ${links.fallback.generic}`);
    console.log(`  iOS App Store: ${links.fallback.appStore.ios}`);
    console.log(`  Android Play Store: ${links.fallback.appStore.android}`);
    
    return links;
  }

  /**
   * Compare Trust Wallet links with SDK generated links
   */
  static compareWithSDK(uri: string, sdkDeepLinks: any[]) {
    console.log('\n🔍 Comparing Trust Wallet Deep Links...');
    
    const ourLinks = this.generateTrustWalletLinks(uri);
    const sdkTrustWallet = sdkDeepLinks.find(dl => dl.wallet === 'trustwallet');
    
    if (sdkTrustWallet) {
      console.log('\n📱 SDK Generated Trust Wallet Links:');
      console.log(`  Universal: ${sdkTrustWallet.universal}`);
      console.log(`  Native: ${sdkTrustWallet.native}`);
      
      console.log('\n🔧 Our Improved Trust Wallet Links:');
      console.log(`  Universal (Encoded): ${ourLinks.primary.universal}`);
      console.log(`  Native (Encoded): ${ourLinks.primary.native}`);
      console.log(`  Universal (Unencoded): ${ourLinks.alternative.universal}`);
      console.log(`  Native (Unencoded): ${ourLinks.alternative.native}`);
      
      // Check if they're different (indicating encoding issues)
      if (sdkTrustWallet.universal !== ourLinks.primary.universal) {
        console.log('\n⚠️  WARNING: Deep links are different!');
        console.log('   This indicates URI encoding issues in the current implementation.');
        console.log('   Use the improved TrustWalletConnector for better compatibility.');
        
        // Show the exact difference
        console.log('\n🔍 URI Encoding Analysis:');
        const sdkUri = sdkTrustWallet.universal.replace('https://link.trustwallet.com/open_url?coin_id=60&url=', '');
        const ourUri = ourLinks.primary.universal.replace('https://link.trustwallet.com/open_url?coin_id=60&url=', '');
        console.log(`  SDK URI: ${sdkUri}`);
        console.log(`  Our URI (Encoded): ${ourUri}`);
        console.log(`  Original: ${uri}`);
        console.log(`  Encoded: ${encodeURIComponent(uri)}`);
        
        console.log('\n🔧 Trust Wallet Troubleshooting:');
        console.log('   If Trust Wallet opens but nothing happens:');
        console.log('   1. Try the ENCODED version (Primary)');
        console.log('   2. Try the UNENCODED version (Alternative)');
        console.log('   3. Make sure Trust Wallet is updated');
        console.log('   4. Check internet connection');
        console.log('   5. Try on different device/platform');
      } else {
        console.log('\n✅ Deep links match - encoding is correct!');
      }
    } else {
      console.log('\n❌ No Trust Wallet deep links found in SDK response');
    }
  }
}

/**
 * Display QR code in terminal
 */
function displayQRCode(uri: string, title: string = 'Scan QR Code') {
  console.log(`\n📱 ${title}`);
  console.log('═'.repeat(50));
  qrcode.generate(uri, { small: true }, (qr) => {
    console.log(qr);
  });
  console.log('═'.repeat(50));
  console.log(`🔗 URI: ${uri}`);
  console.log('📱 Scan the QR code above with your wallet app\n');
}

async function quickStart() {
  console.log('🚀 WalletConnect Backend SDK - Quick Start (Fixed)\n');
  console.log('🔧 Includes Trust Wallet Deep Link Implementation\n');

  // 1. Initialize SDK (minimal configuration)
  const sdk = new WalletConnectSDK({
    projectId: 'd135d60071032d4c35b867a5420a0d32', // Get from https://cloud.walletconnect.com/
    logger: new DefaultLogger('debug') // Enable debug logging
  });

  await sdk.init();
  console.log('✅ SDK initialized');

  // Set up event listeners for connection notifications
  sdk.on('session_connect', (event) => {
    console.log('\n🎉 WALLET CONNECTED! 🎉');
    console.log(`👤 User ID: ${event.userId}`);
    console.log(`🔗 Topic: ${event.data?.topic}`);
    console.log(`📱 Address: ${event.data?.address}`);
    console.log(`⛓️ Chain ID: ${event.data?.chainId}`);
    console.log(`📊 Accounts: ${event.data?.accounts?.length || 0} accounts`);
    
    // Clear the connection timer since user has connected successfully
    sdk.clearTimer(`connection-${event.userId}`).catch(err => 
      console.warn('Failed to clear timer:', err)
    );
    console.log('✅ Connection timer cleared - user successfully connected!');
  });

  sdk.on('session_disconnect', (event) => {
    console.log('\n🔌 WALLET DISCONNECTED!');
    console.log(`👤 User ID: ${event.userId}`);
    console.log(`📋 Reason: ${event.data?.reason || 'Unknown'}`);
  });

  sdk.on('error', (event) => {
    console.log('\n❌ ERROR OCCURRED:');
    console.log(`👤 User ID: ${event.userId || 'N/A'}`);
    console.log(`🔍 Error: ${event.error?.message || 'Unknown error'}`);
  });

  // 2. Connect a user
  const userId = 'user-' + Date.now(); // Generate unique user ID
  console.log(`\n🔗 Connecting user: ${userId}`);

  const connection = await sdk.connect({
    userId,
    chainId: 1, // Ethereum mainnet
    methods: ['eth_sendTransaction', 'eth_sign', 'personal_sign']
  });

  console.log(connection);

  if (!connection.success) {
    console.error('❌ Connection failed:', connection.error);
    console.error('🔍 Debug information:');
    console.error('  - Project ID:', 'd135d60071032d4c35b867a5420a0d32');
    console.error('  - User ID:', userId);
    console.error('  - Chain ID:', 1);
    console.error('  - Methods:', ['eth_sendTransaction', 'eth_sign', 'personal_sign']);
    return;
  }

  console.log('✅ Connection created successfully!');
  console.log(`⏱️ Timeout: ${connection.timeout}ms`);
  
  // Display QR code in terminal
  displayQRCode(connection.uri!, 'WalletConnect QR Code - Scan with your wallet');

  // 3. Show available wallet deep links
  if (connection.deepLinks) {
    console.log('\n📱 Available Wallet Deep Links:');
    connection.deepLinks.slice(0, 5).forEach(deepLink => { // Show first 5
      console.log(`  - ${deepLink.wallet}: ${deepLink.universal}`);
    });
    console.log(`  ... and ${connection.deepLinks.length - 5} more wallets`);
  }

  // 4. Trust Wallet Deep Link Implementation
  if (connection.uri) {
    console.log('\n🔧 Trust Wallet Deep Link Implementation:');
    
    // Test Trust Wallet deep links
    const trustWalletLinks = TrustWalletConnector.testTrustWalletLinks(connection.uri);
    
    // Compare with SDK generated links
    if (connection.deepLinks) {
      TrustWalletConnector.compareWithSDK(connection.uri, connection.deepLinks);
    }
    
    // Show usage instructions
    console.log('\n📱 To use Trust Wallet deep links:');
    console.log('   1. Copy one of the generated links above');
    console.log('   2. Open it in your mobile browser');
    console.log('   3. Trust Wallet should open automatically');
    console.log('   4. If not, manually open Trust Wallet and paste the URI');
    
    console.log('\n🔧 For web implementation, use:');
    console.log('   TrustWalletConnector.generateTrustWalletLinks(uri)');
    console.log('   TrustWalletConnector.testTrustWalletLinks(uri)');
  }

  // 5. Wait for user to connect (with progress tracking)
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
    } else {
      console.log('✅ User connected! Breaking out of progress loop.');
      break;
    }
  }

  if (!connected) {
    console.log('⏰ Connection timed out!');
    console.log('\n💡 Troubleshooting Tips:');
    console.log('   - Make sure your wallet app is updated');
    console.log('   - Try scanning the QR code again');
    console.log('   - For Trust Wallet, use the improved deep links above');
    console.log('   - Check your internet connection');
    console.log('   - Try different wallet apps (MetaMask, Coinbase Wallet, etc.)');
    await sdk.destroy();
    return;
  }

  console.log('✅ User connected successfully!');

  // 6. Get user information
  const accounts = await sdk.getAccounts(userId);
  const balance = await sdk.getBalance(userId);

  console.log('\n👤 User Information:');
  console.log(`  - Address: ${accounts[0]}`);
  console.log(`  - ETH Balance: ${balance.toString()} wei`);

  // 7. Send a simple transaction
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

  // 8. Sign a message
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

  // 9. Cleanup
  console.log('\n🧹 Cleaning up...');
  await sdk.disconnect(userId);
  await sdk.destroy();
  console.log('✅ Done!');

  console.log('\n🎉 Quick start completed successfully!');
  console.log('📚 Check other examples for more advanced features.');
  console.log('🔧 Trust Wallet deep link implementation included for better compatibility.');
}

// Run the example
if (require.main === module) {
  quickStart().catch(console.error);
}

export { quickStart, TrustWalletConnector }; 