import { WalletConnectSDK } from '../src/core/WalletConnectSDK';
import { DefaultLogger } from '../src/utils/Logger';

/**
 * 🔧 Trust Wallet WalletConnect v2 Correct Implementation
 * 
 * Trust Wallet expects WalletConnect v2, not v1.
 * This uses the correct deep link format with v2 URIs.
 */

class TrustWalletV2Correct {
  private sdk: WalletConnectSDK;

  constructor(sdk: WalletConnectSDK) {
    this.sdk = sdk;
  }

  /**
   * Generate Trust Wallet deep links using v2 URIs with correct format
   */
  generateTrustWalletV2Links(uri: string) {
    const encodedUri = encodeURIComponent(uri);
    
    return {
      // Official Trust Wallet format with v2 URI
      official: {
        universal: `https://link.trustwallet.com/wc?uri=${encodedUri}`,
        native: `trust://wc?uri=${encodedUri}`
      },
      
      // Official format with coin_id
      officialWithCoin: {
        universal: `https://link.trustwallet.com/wc?uri=${encodedUri}&coin_id=60`,
        native: `trust://wc?uri=${encodedUri}&coin_id=60`
      },
      
      // Legacy format (what we were using before)
      legacy: {
        universal: `https://link.trustwallet.com/open_url?coin_id=60&url=${encodedUri}`,
        native: `trust://open_url?coin_id=60&url=${encodedUri}`
      },
      
      // Direct format
      direct: {
        universal: `trust://wc?uri=${encodedUri}`,
        native: `trust://wc?uri=${encodedUri}`
      },
      
      // Generic dapp format
      generic: {
        universal: `trust://dapp?uri=${encodedUri}`,
        native: `trust://dapp?uri=${encodedUri}`
      },
      
      // Alternative formats
      alternative: {
        // Without coin_id
        noCoinId: {
          universal: `https://link.trustwallet.com/wc?uri=${encodedUri}`,
          native: `trust://wc?uri=${encodedUri}`
        },
        // With different coin_id (BNB)
        bnbCoin: {
          universal: `https://link.trustwallet.com/wc?uri=${encodedUri}&coin_id=714`,
          native: `trust://wc?uri=${encodedUri}&coin_id=714`
        },
        // With additional parameters
        withParams: {
          universal: `https://link.trustwallet.com/wc?uri=${encodedUri}&source=walletconnect&version=2`,
          native: `trust://wc?uri=${encodedUri}&source=walletconnect&version=2`
        }
      }
    };
  }

  /**
   * Test all Trust Wallet v2 deep link formats
   */
  testAllFormats(uri: string) {
    console.log('\n🔧 Trust Wallet WalletConnect v2 Correct Implementation');
    console.log('═'.repeat(70));
    
    const allLinks = this.generateTrustWalletV2Links(uri);
    
    console.log('\n📱 TESTING LINKS (WalletConnect v2 - Correct Format):');
    
    console.log('\n1. OFFICIAL FORMAT (Most Likely to Work):');
    console.log(`   Universal: ${allLinks.official.universal}`);
    console.log(`   Native: ${allLinks.official.native}`);
    
    console.log('\n2. OFFICIAL FORMAT WITH COIN_ID:');
    console.log(`   Universal: ${allLinks.officialWithCoin.universal}`);
    console.log(`   Native: ${allLinks.officialWithCoin.native}`);
    
    console.log('\n3. LEGACY FORMAT (Previous Implementation):');
    console.log(`   Universal: ${allLinks.legacy.universal}`);
    console.log(`   Native: ${allLinks.legacy.native}`);
    
    console.log('\n4. DIRECT FORMAT:');
    console.log(`   Universal: ${allLinks.direct.universal}`);
    console.log(`   Native: ${allLinks.direct.native}`);
    
    console.log('\n5. GENERIC DAPP FORMAT:');
    console.log(`   Universal: ${allLinks.generic.universal}`);
    console.log(`   Native: ${allLinks.generic.native}`);
    
    console.log('\n6. ALTERNATIVE FORMATS:');
    console.log(`   No Coin ID: ${allLinks.alternative.noCoinId.universal}`);
    console.log(`   BNB Coin: ${allLinks.alternative.bnbCoin.universal}`);
    console.log(`   With Params: ${allLinks.alternative.withParams.universal}`);
    
    console.log('\n🔍 URI ANALYSIS:');
    console.log(`WalletConnect v2 URI: ${uri}`);
    console.log(`Length: ${uri.length} characters`);
    console.log(`Protocol: ${uri.startsWith('wc:') ? 'WalletConnect v2' : 'Unknown'}`);
    
    // Check if it's v2
    if (uri.includes('@2')) {
      console.log(`✅ Confirmed: WalletConnect v2 URI`);
    } else {
      console.log(`⚠️  Warning: Not a v2 URI`);
    }
    
    console.log('\n📋 TRUST WALLET EXPECTATIONS:');
    console.log('✅ Trust Wallet supports WalletConnect v2');
    console.log('✅ Use format: https://link.trustwallet.com/wc?uri=<encoded_v2_uri>');
    console.log('❌ Do NOT convert to v1 (causes "unsupported version" error)');
    
    console.log('\n📱 TESTING INSTRUCTIONS:');
    console.log('1. Try the OFFICIAL FORMAT first (matches their docs)');
    console.log('2. If that doesn\'t work, try OFFICIAL FORMAT WITH COIN_ID');
    console.log('3. Test on different devices and Trust Wallet versions');
    console.log('4. Make sure Trust Wallet is updated to latest version');
    console.log('5. Check Trust Wallet app permissions');
    
    return allLinks;
  }

  /**
   * Update the quick-start.ts with the correct Trust Wallet implementation
   */
  generateQuickStartUpdate() {
    console.log('\n🔧 UPDATE FOR quick-start.ts:');
    console.log('═'.repeat(50));
    
    console.log('\nReplace the Trust Wallet section in WalletConnector.generateWalletLinks():');
    console.log(`
      // Trust Wallet - Binance ecosystem (CORRECTED)
      trustwallet: {
        primary: {
          universal: \`https://link.trustwallet.com/wc?uri=\${encodedUri}\`,
          native: \`trust://wc?uri=\${encodedUri}\`
        },
        fallback: {
          direct: \`trust://wc?uri=\${encodedUri}\`,
          withCoinId: \`https://link.trustwallet.com/wc?uri=\${encodedUri}&coin_id=60\`,
          appStore: {
            ios: 'https://apps.apple.com/app/trust-crypto-bitcoin-wallet/id1288339409',
            android: 'https://play.google.com/store/apps/details?id=com.wallet.crypto.trustapp'
          }
        }
      },
    `);
    
    console.log('\nReplace the TrustWalletConnector.generateTrustWalletLinks():');
    console.log(`
  static generateTrustWalletLinks(uri: string) {
    const encodedUri = encodeURIComponent(uri);
    
    return {
      primary: {
        // Official Trust Wallet format (v2 compatible)
        universal: \`https://link.trustwallet.com/wc?uri=\${encodedUri}\`,
        native: \`trust://wc?uri=\${encodedUri}\`
      },
      alternative: {
        // With coin_id parameter
        universal: \`https://link.trustwallet.com/wc?uri=\${encodedUri}&coin_id=60\`,
        native: \`trust://wc?uri=\${encodedUri}&coin_id=60\`
      },
      fallback: {
        // Direct WalletConnect format
        direct: \`trust://wc?uri=\${encodedUri}\`,
        // Generic deep link format
        generic: \`trust://dapp?uri=\${encodedUri}\`,
        // App store fallbacks
        appStore: {
          ios: 'https://apps.apple.com/app/trust-crypto-bitcoin-wallet/id1288339409',
          android: 'https://play.google.com/store/apps/details?id=com.wallet.crypto.trustapp'
        }
      }
    };
  }
    `);
  }
}

/**
 * Main function to test Trust Wallet v2 correct implementation
 */
async function testTrustWalletV2Correct() {
  console.log('🔧 Trust Wallet WalletConnect v2 Correct Implementation\n');
  console.log('This fixes the "unsupported version" error by using v2 URIs.\n');

  // Initialize SDK
  const sdk = new WalletConnectSDK({
    projectId: 'd135d60071032d4c35b867a5420a0d32',
    logger: new DefaultLogger('debug')
  });

  await sdk.init();
  console.log('✅ SDK initialized');

  const fixer = new TrustWalletV2Correct(sdk);

  // Create a test connection
  const userId = 'v2correct-' + Date.now();
  console.log(`\n🔗 Creating test connection for user: ${userId}`);

  const connection = await sdk.connect({
    userId,
    chainId: 1,
    methods: ['eth_sendTransaction', 'eth_sign', 'personal_sign']
  });

  if (!connection.success) {
    console.error('❌ Connection failed:', connection.error);
    await sdk.destroy();
    return;
  }

  console.log('✅ Connection created successfully');
  console.log(`🔗 URI: ${connection.uri}`);

  if (connection.uri) {
    // Test all formats
    const links = fixer.testAllFormats(connection.uri);
    
    // Generate update for quick-start.ts
    fixer.generateQuickStartUpdate();
    
    // Show the most likely to work format
    console.log('\n🎯 MOST LIKELY TO WORK:');
    console.log('Try this first (correct v2 format):');
    console.log(links.official.universal);
  }

  // Cleanup
  await sdk.disconnect(userId);
  await sdk.destroy();
  console.log('\n✅ Testing completed. Use the corrected v2 format above.');
}

// Run the fix
if (require.main === module) {
  testTrustWalletV2Correct().catch(console.error);
}

export { TrustWalletV2Correct, testTrustWalletV2Correct }; 