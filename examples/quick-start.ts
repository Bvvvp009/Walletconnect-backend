import { WalletConnectSDK } from '../src/core/WalletConnectSDK';
import { DefaultLogger } from '../src/utils/Logger';
import * as qrcode from 'qrcode-terminal';

/**
 * 🚀 Quick Start Example
 * 
 * This example shows the fastest way to get started with WalletConnect Backend SDK.
 * Perfect for developers who want to see results immediately.
 * 
 * Includes comprehensive wallet deep link implementations to fix common connection issues.
 */

/**
 * Comprehensive Wallet Deep Link Implementation
 * Fixes common issues with wallet connections across multiple wallets
 */
class WalletConnector {
  /**
   * Generate deep links for all supported wallets with proper formatting
   */
  static generateWalletLinks(uri: string) {
    const encodedUri = encodeURIComponent(uri);
    
    return {
      // MetaMask - Most popular wallet
      metamask: {
        primary: {
          universal: `https://metamask.app.link/dapp/${encodedUri}`,
          native: `metamask://dapp/${encodedUri}`
        },
        fallback: {
          direct: `metamask://wc?uri=${encodedUri}`,
          appStore: {
            ios: 'https://apps.apple.com/app/metamask-blockchain-wallet/id1438144202',
            android: 'https://play.google.com/store/apps/details?id=io.metamask'
          }
        }
      },

      // Trust Wallet - Binance ecosystem (WORKING FORMAT)
      trustwallet: {
        primary: {
          universal: `https://link.trustwallet.com/wc?uri=${encodedUri}`,
          native: `trust://wc?uri=${encodedUri}`
        },
        fallback: {
          direct: `trust://wc?uri=${encodedUri}`,
          withCoinId: `https://link.trustwallet.com/wc?uri=${encodedUri}&coin_id=60`,
          appStore: {
            ios: 'https://apps.apple.com/app/trust-crypto-bitcoin-wallet/id1288339409',
            android: 'https://play.google.com/store/apps/details?id=com.wallet.crypto.trustapp'
          }
        }
      },

      // Coinbase Wallet - Exchange wallet
      coinbasewallet: {
        primary: {
          universal: `https://wallet.coinbase.com/wsegue?uri=${encodedUri}`,
          native: `coinbase-wallet://wc?uri=${encodedUri}`
        },
        fallback: {
          direct: `coinbase-wallet://dapp/${encodedUri}`,
          appStore: {
            ios: 'https://apps.apple.com/app/coinbase-wallet/id1278383455',
            android: 'https://play.google.com/store/apps/details?id=org.toshi'
          }
        }
      },

      // Rainbow - Beautiful UI
      rainbow: {
        primary: {
          universal: `https://rainbow.me/wc?uri=${encodedUri}`,
          native: `rainbow://wc?uri=${encodedUri}`
        },
        fallback: {
          direct: `rainbow://dapp/${encodedUri}`,
          appStore: {
            ios: 'https://apps.apple.com/app/rainbow-ethereum-wallet/id1457119021',
            android: 'https://play.google.com/store/apps/details?id=me.rainbow'
          }
        }
      },

      // Phantom - Solana support
      phantom: {
        primary: {
          universal: `https://phantom.app/ul/browse/${encodedUri}`,
          native: `phantom://browse/${encodedUri}`
        },
        fallback: {
          direct: `phantom://wc?uri=${encodedUri}`,
          appStore: {
            ios: 'https://apps.apple.com/app/phantom-crypto-wallet/id1598432977',
            android: 'https://play.google.com/store/apps/details?id=app.phantom'
          }
        }
      },

      // Argent - DeFi focused
      argent: {
        primary: {
          universal: `https://argent.xyz/app/wc?uri=${encodedUri}`,
          native: `argent://wc?uri=${encodedUri}`
        },
        fallback: {
          direct: `argent://dapp/${encodedUri}`,
          appStore: {
            ios: 'https://apps.apple.com/app/argent-defi-wallet/id1358746906',
            android: 'https://play.google.com/store/apps/details?id=im.argent.contractwalletclient'
          }
        }
      },

      // imToken - Asian market
      imtoken: {
        primary: {
          universal: `https://link.imtoken.com/nav/DappView?url=${encodedUri}`,
          native: `imtokenv2://navigate/DappView?url=${encodedUri}`
        },
        fallback: {
          direct: `imtokenv2://wc?uri=${encodedUri}`,
          appStore: {
            ios: 'https://apps.apple.com/app/imtoken/id1384798940',
            android: 'https://play.google.com/store/apps/details?id=im.token.app'
          }
        }
      },

      // TokenPocket - Multi-chain
      tokenpocket: {
        primary: {
          universal: `https://www.tokenpocket.pro/dapp/${encodedUri}`,
          native: `tpdapp://dapp/${encodedUri}`
        },
        fallback: {
          direct: `tpdapp://wc?uri=${encodedUri}`,
          appStore: {
            ios: 'https://apps.apple.com/app/tokenpocket/id1436591849',
            android: 'https://play.google.com/store/apps/details?id=vip.mytokenpocket'
          }
        }
      },

      // 1inch - DEX aggregator
      '1inch': {
        primary: {
          universal: `https://1inch.io/wallet/wc?uri=${encodedUri}`,
          native: `1inch://wc?uri=${encodedUri}`
        },
        fallback: {
          direct: `1inch://dapp/${encodedUri}`,
          appStore: {
            ios: 'https://apps.apple.com/app/1inch-defi-wallet/id1546049391',
            android: 'https://play.google.com/store/apps/details?id=io.oneinch.wallet'
          }
        }
      },

      // OKX - Exchange wallet
      okx: {
        primary: {
          universal: `https://www.okx.com/web3/wc?uri=${encodedUri}`,
          native: `okx://wc?uri=${encodedUri}`
        },
        fallback: {
          direct: `okx://dapp/${encodedUri}`,
          appStore: {
            ios: 'https://apps.apple.com/app/okx-buy-bitcoin-eth/id1327268470',
            android: 'https://play.google.com/store/apps/details?id=com.okinc.okex.gp'
          }
        }
      },

      // Binance Wallet - Exchange wallet
      binancewallet: {
        primary: {
          universal: `https://www.bnbchain.org/en/binance-wallet/wc?uri=${encodedUri}`,
          native: `binance://wc?uri=${encodedUri}`
        },
        fallback: {
          direct: `binance://dapp/${encodedUri}`,
          appStore: {
            ios: 'https://apps.apple.com/app/binance-buy-sell-crypto/id1436799971',
            android: 'https://play.google.com/store/apps/details?id=com.binance.dev'
          }
        }
      }
    };
  }

  /**
   * Detect user platform
   */
  static detectPlatform(): 'ios' | 'android' | 'web' {
    if (typeof window === 'undefined') return 'web';
    
    const userAgent = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(userAgent)) return 'ios';
    if (/Android/.test(userAgent)) return 'android';
    return 'web';
  }

  /**
   * Open specific wallet with proper fallback handling
   */
  static openWallet(walletName: string, uri: string): void {
    const links = this.generateWalletLinks(uri);
    const walletLinks = links[walletName as keyof typeof links];
    
    if (!walletLinks) {
      console.error(`❌ Wallet ${walletName} not supported`);
      return;
    }

    const platform = this.detectPlatform();
    console.log(`📱 Opening ${walletName} on ${platform}...`);
    console.log(`🔗 URI: ${uri}`);
    
    try {
      if (platform === 'ios') {
        this.openOnIOS(walletLinks);
      } else if (platform === 'android') {
        this.openOnAndroid(walletLinks);
      } else {
        this.openOnWeb(walletLinks);
      }
    } catch (error) {
      console.error(`❌ Failed to open ${walletName}:`, error);
    }
  }

  /**
   * iOS-specific wallet opening
   */
  private static openOnIOS(walletLinks: any): void {
    try {
      console.log('📱 iOS: Trying universal link first...');
      if (typeof window !== 'undefined') {
        window.location.href = walletLinks.primary.universal;
        
        // Fallback to native link after 2 seconds
        setTimeout(() => {
          console.log('📱 iOS: Trying native link...');
          window.location.href = walletLinks.primary.native;
        }, 2000);
        
        // Final fallback to app store after 4 seconds
        setTimeout(() => {
          console.log('📱 iOS: Redirecting to App Store...');
          window.open(walletLinks.fallback.appStore.ios, '_blank');
        }, 4000);
      }
    } catch (error) {
      console.error('❌ iOS wallet opening failed:', error);
    }
  }

  /**
   * Android-specific wallet opening
   */
  private static openOnAndroid(walletLinks: any): void {
    try {
      console.log('📱 Android: Trying native link first...');
      if (typeof window !== 'undefined') {
        window.location.href = walletLinks.primary.native;
        
        // Fallback to universal link after 2 seconds
        setTimeout(() => {
          console.log('📱 Android: Trying universal link...');
          window.location.href = walletLinks.primary.universal;
        }, 2000);
        
        // Final fallback to Play Store after 4 seconds
        setTimeout(() => {
          console.log('📱 Android: Redirecting to Play Store...');
          window.open(walletLinks.fallback.appStore.android, '_blank');
        }, 4000);
      }
    } catch (error) {
      console.error('❌ Android wallet opening failed:', error);
    }
  }

  /**
   * Web-specific wallet opening
   */
  private static openOnWeb(walletLinks: any): void {
    try {
      console.log('🌐 Web: Using universal link...');
      if (typeof window !== 'undefined') {
        window.location.href = walletLinks.primary.universal;
        
        // Fallback to direct format after 2 seconds
        setTimeout(() => {
          console.log('🌐 Web: Trying direct format...');
          window.location.href = walletLinks.fallback.direct;
        }, 2000);
        
        // Final fallback to app store after 4 seconds
        setTimeout(() => {
          console.log('🌐 Web: Redirecting to app store...');
          window.open(walletLinks.fallback.appStore.ios, '_blank');
        }, 4000);
      }
    } catch (error) {
      console.error('❌ Web wallet opening failed:', error);
    }
  }

  /**
   * Test all wallet deep links
   */
  static testAllWalletLinks(uri: string) {
    console.log('\n🧪 Testing All Wallet Deep Links...');
    
    const links = this.generateWalletLinks(uri);
    const platform = this.detectPlatform();
    
    console.log(`📱 Platform: ${platform}`);
    console.log(`🔗 Original URI: ${uri}`);
    console.log(`🔗 Encoded URI: ${encodeURIComponent(uri)}`);
    
    console.log('\n📱 Generated Links for All Wallets:');
    
    Object.entries(links).forEach(([walletName, walletLinks]) => {
      console.log(`\n🔗 ${walletName.toUpperCase()}:`);
      console.log(`  Primary Universal: ${walletLinks.primary.universal}`);
      console.log(`  Primary Native: ${walletLinks.primary.native}`);
      console.log(`  Fallback Direct: ${walletLinks.fallback.direct}`);
      console.log(`  iOS App Store: ${walletLinks.fallback.appStore.ios}`);
      console.log(`  Android Play Store: ${walletLinks.fallback.appStore.android}`);
    });
    
    return links;
  }

  /**
   * Compare wallet links with SDK generated links
   */
  static compareWithSDKLinks(uri: string, sdkDeepLinks: any[]) {
    console.log('\n🔍 Comparing with SDK Generated Links...');
    
    const ourLinks = this.generateWalletLinks(uri);
    
    sdkDeepLinks.forEach(sdkLink => {
      const ourWalletLinks = ourLinks[sdkLink.wallet as keyof typeof ourLinks];
      
      if (ourWalletLinks) {
        console.log(`\n📱 ${sdkLink.wallet.toUpperCase()}:`);
        console.log(`  SDK Universal: ${sdkLink.universal}`);
        console.log(`  Our Universal: ${ourWalletLinks.primary.universal}`);
        
        if (sdkLink.universal !== ourWalletLinks.primary.universal) {
          console.log(`  ⚠️  DIFFERENT - Potential encoding issue!`);
        } else {
          console.log(`  ✅ MATCH - Encoding is correct!`);
        }
      }
    });
  }
}

/**
 * Trust Wallet Deep Link Implementation
 * Fixes common issues with Trust Wallet connections
 */
class TrustWalletConnector {
  /**
   * Generate Trust Wallet deep links with proper formatting (WORKING FORMAT)
   */
  static generateTrustWalletLinks(uri: string) {
    // ✅ Always encode the URI - this is the most common fix
    const encodedUri = encodeURIComponent(uri);
    
    return {
      primary: {
        // Working format (matches Trust Wallet's official format)
        universal: `https://link.trustwallet.com/wc?uri=${encodedUri}`,
        native: `trust://wc?uri=${encodedUri}`
      },
      alternative: {
        // With coin_id parameter
        universal: `https://link.trustwallet.com/wc?uri=${encodedUri}&coin_id=60`,
        native: `trust://wc?uri=${encodedUri}&coin_id=60`
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
   * Detect user platform
   */
  static detectPlatform(): 'ios' | 'android' | 'web' {
    if (typeof window === 'undefined') return 'web';
    
    const userAgent = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(userAgent)) return 'ios';
    if (/Android/.test(userAgent)) return 'android';
    return 'web';
  }

  /**
   * Open Trust Wallet with proper fallback handling
   */
  static openTrustWallet(uri: string): void {
    const links = this.generateTrustWalletLinks(uri);
    const platform = this.detectPlatform();
    
    console.log(`📱 Opening Trust Wallet on ${platform}...`);
    console.log(`🔗 URI: ${uri}`);
    
    try {
      if (platform === 'ios') {
        this.openOnIOS(links);
      } else if (platform === 'android') {
        this.openOnAndroid(links);
      } else {
        this.openOnWeb(links);
      }
    } catch (error) {
      console.error('❌ Failed to open Trust Wallet:', error);
    }
  }

  /**
   * iOS-specific Trust Wallet opening
   */
  private static openOnIOS(links: any): void {
    try {
      // iOS prefers universal links
      console.log('📱 iOS: Trying universal link first...');
      if (typeof window !== 'undefined') {
        window.location.href = links.primary.universal;
        
        // Fallback to native link after 2 seconds
        setTimeout(() => {
          console.log('📱 iOS: Trying native link...');
          window.location.href = links.primary.native;
        }, 2000);
        
        // Final fallback to app store after 4 seconds
        setTimeout(() => {
          console.log('📱 iOS: Redirecting to App Store...');
          window.open(links.fallback.appStore.ios, '_blank');
        }, 4000);
      }
    } catch (error) {
      console.error('❌ iOS Trust Wallet opening failed:', error);
    }
  }

  /**
   * Android-specific Trust Wallet opening
   */
  private static openOnAndroid(links: any): void {
    try {
      // Android can handle native links directly
      console.log('📱 Android: Trying native link first...');
      if (typeof window !== 'undefined') {
        window.location.href = links.primary.native;
        
        // Fallback to universal link after 2 seconds
        setTimeout(() => {
          console.log('📱 Android: Trying universal link...');
          window.location.href = links.primary.universal;
        }, 2000);
        
        // Final fallback to Play Store after 4 seconds
        setTimeout(() => {
          console.log('📱 Android: Redirecting to Play Store...');
          window.open(links.fallback.appStore.android, '_blank');
        }, 4000);
      }
    } catch (error) {
      console.error('❌ Android Trust Wallet opening failed:', error);
    }
  }

  /**
   * Web-specific Trust Wallet opening
   */
  private static openOnWeb(links: any): void {
    try {
      // Web browsers use universal links
      console.log('🌐 Web: Using universal link...');
      if (typeof window !== 'undefined') {
        window.location.href = links.primary.universal;
        
        // Fallback to direct format after 2 seconds
        setTimeout(() => {
          console.log('🌐 Web: Trying direct format...');
          window.location.href = links.fallback.direct;
        }, 2000);
        
        // Final fallback to app store after 4 seconds
        setTimeout(() => {
          console.log('🌐 Web: Redirecting to app store...');
          window.open(links.fallback.appStore.ios, '_blank');
        }, 4000);
      }
    } catch (error) {
      console.error('❌ Web Trust Wallet opening failed:', error);
    }
  }

  /**
   * Test Trust Wallet deep links
   */
  static testTrustWalletLinks(uri: string) {
    console.log('\n🧪 Testing Trust Wallet Deep Links...');
    
    const links = this.generateTrustWalletLinks(uri);
    const platform = this.detectPlatform();
    
    console.log(`📱 Platform: ${platform}`);
    console.log(`🔗 Original URI: ${uri}`);
    console.log(`🔗 Encoded URI: ${encodeURIComponent(uri)}`);
    
    console.log('\n📱 Generated Links:');
    console.log('Primary (Working Format):');
    console.log(`  Universal: ${links.primary.universal}`);
    console.log(`  Native: ${links.primary.native}`);
    
    console.log('\nAlternative (With Coin ID):');
    console.log(`  Universal: ${links.alternative.universal}`);
    console.log(`  Native: ${links.alternative.native}`);
    
    console.log('\nFallback:');
    console.log(`  Direct: ${links.fallback.direct}`);
    console.log(`  Generic: ${links.fallback.generic}`);
    console.log(`  iOS App Store: ${links.fallback.appStore.ios}`);
    console.log(`  Android Play Store: ${links.fallback.appStore.android}`);
    
    return links;
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
  console.log('🚀 WalletConnect Backend SDK - Quick Start\n');
  console.log('🔧 Includes Comprehensive Wallet Deep Link Implementation\n');

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

  // 4. Comprehensive Wallet Deep Link Implementation
  if (connection.uri) {
    console.log('\n🔧 Comprehensive Wallet Deep Link Implementation:');
    
    // Test all wallet deep links
    const allWalletLinks = WalletConnector.testAllWalletLinks(connection.uri);
    
    // Compare with SDK generated links
    if (connection.deepLinks) {
      WalletConnector.compareWithSDKLinks(connection.uri, connection.deepLinks);
    }
    
    // Test Trust Wallet specifically with detailed analysis
    const trustWalletLinks = TrustWalletConnector.testTrustWalletLinks(connection.uri);
    
    // Find Trust Wallet in generated deep links
    const trustWalletDeepLink = connection.deepLinks?.find(dl => dl.wallet === 'trustwallet');
    
    if (trustWalletDeepLink) {
      console.log('\n📱 Current Trust Wallet Deep Link (from SDK):');
      console.log(`  Universal: ${trustWalletDeepLink.universal}`);
      console.log(`  Native: ${trustWalletDeepLink.native}`);
      
      // Compare with our improved implementation
      console.log('\n🔧 Improved Trust Wallet Deep Link (with proper encoding):');
      console.log(`  Universal: ${trustWalletLinks.primary.universal}`);
      console.log(`  Native: ${trustWalletLinks.primary.native}`);
      
      // Check if they're different (indicating encoding issues)
      if (trustWalletDeepLink.universal !== trustWalletLinks.primary.universal) {
        console.log('\n⚠️  WARNING: Deep links are different!');
        console.log('   This indicates URI encoding issues in the current implementation.');
        console.log('   Use the improved WalletConnector for better compatibility.');
        
        // Show the exact difference
        console.log('\n🔍 URI Encoding Analysis:');
        console.log(`  SDK URI: ${trustWalletDeepLink.universal.replace('https://link.trustwallet.com/wc?uri=', '')}`);
        console.log(`  Our URI: ${trustWalletLinks.primary.universal.replace('https://link.trustwallet.com/wc?uri=', '')}`);
        console.log(`  Original: ${connection.uri}`);
        console.log(`  Encoded: ${encodeURIComponent(connection.uri)}`);
      } else {
        console.log('\n✅ Deep links match - encoding is correct!');
      }
      
      // Show Trust Wallet specific troubleshooting
      console.log('\n🔧 Trust Wallet Troubleshooting:');
      console.log('   ✅ Using working format: https://link.trustwallet.com/wc?uri=<encoded_uri>');
      console.log('   If Trust Wallet still has issues:');
      console.log('   1. Try the PRIMARY format (Working Format)');
      console.log('   2. Try the ALTERNATIVE format (With Coin ID)');
      console.log('   3. Make sure Trust Wallet is updated to latest version');
      console.log('   4. Check Trust Wallet app permissions');
      console.log('   5. Try on different device/platform');
    }
    
    // Demonstrate opening different wallets
    console.log('\n📱 To open specific wallets, use:');
    console.log('   WalletConnector.openWallet("metamask", connection.uri)');
    console.log('   WalletConnector.openWallet("trustwallet", connection.uri)');
    console.log('   WalletConnector.openWallet("coinbasewallet", connection.uri)');
    console.log('   WalletConnector.openWallet("rainbow", connection.uri)');
    console.log('   (This would open wallets with proper fallback handling)');
    
    // Show Trust Wallet specific implementation
    console.log('\n🔧 Trust Wallet Specific Implementation:');
    console.log('   TrustWalletConnector.openTrustWallet(connection.uri)');
    console.log('   TrustWalletConnector.testTrustWalletLinks(connection.uri)');
    console.log('   (These provide the most reliable Trust Wallet deep links)');
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
  console.log('🔧 Comprehensive wallet deep link implementation included for better compatibility.');
  console.log('📱 Supported wallets: MetaMask, Trust Wallet, Coinbase Wallet, Rainbow, Phantom, Argent, imToken, TokenPocket, 1inch, OKX, Binance Wallet');
}

// Run the example
if (require.main === module) {
  quickStart().catch(console.error);
}

export { quickStart, TrustWalletConnector, WalletConnector }; 