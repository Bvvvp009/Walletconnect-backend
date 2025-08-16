import { WalletMetadata, WalletDeepLink } from '../types';

// Comprehensive Wallet Registry with Deep Links
export class WalletRegistry {
  private static wallets: Map<string, WalletMetadata> = new Map([
    // MetaMask
    ['metamask', {
      name: 'MetaMask',
      shortName: 'MetaMask',
      description: 'The most popular Web3 wallet',
      url: 'https://metamask.io',
      icons: ['https://cdn.iconscout.com/icon/free/png-256/metamask-2728406-2261817.png'],
      deepLinks: {
        universal: 'https://metamask.app.link/wc?uri=',
        native: 'metamask://wc?uri=',
        web: 'https://metamask.io'
      },
      chains: ['eip155:1', 'eip155:137', 'eip155:56', 'eip155:42161'],
      features: ['connect', 'disconnect', 'sign', 'send', 'switch'],
      supportedMethods: [
        'eth_sendTransaction',
        'eth_sign',
        'personal_sign',
        'eth_signTypedData',
        'eth_accounts',
        'eth_chainId',
        'wallet_switchEthereumChain',
        'wallet_addEthereumChain'
      ],
      supportedEvents: ['chainChanged', 'accountsChanged', 'connect', 'disconnect']
    }],

    // WalletConnect
    ['walletconnect', {
      name: 'WalletConnect',
      shortName: 'WC',
      description: 'Open protocol for connecting wallets to dapps',
      url: 'https://walletconnect.com',
      icons: ['https://cdn.iconscout.com/icon/free/png-256/walletconnect-3521426-2944869.png'],
      deepLinks: {
        universal: 'https://walletconnect.com', 
        native: 'wc://',
        web: 'https://walletconnect.com'
      },
      chains: ['eip155:1', 'eip155:137', 'eip155:56', 'eip155:42161'],
      features: ['connect', 'disconnect', 'sign', 'send', 'switch'],
      supportedMethods: [
        'eth_sendTransaction',
        'eth_sign',
        'personal_sign',
        'eth_signTypedData',
        'eth_accounts',
        'eth_chainId'
      ],
      supportedEvents: ['chainChanged', 'accountsChanged', 'connect', 'disconnect']
    }],

    // Trust Wallet
    ['trustwallet', {
      name: 'Trust Wallet',
      shortName: 'Trust',
      description: 'The most trusted & secure crypto wallet',
      url: 'https://trustwallet.com',
      icons: ['https://cdn.iconscout.com/icon/free/png-256/trust-wallet-3521426-2944869.png'],
      deepLinks: {
        universal: 'https://link.trustwallet.com/wc?uri=',
        native: 'trust://wc?uri=',
        web: 'https://trustwallet.com'
      },
      chains: ['eip155:1', 'eip155:56', 'eip155:137', 'eip155:42161'],
      features: ['connect', 'disconnect', 'sign', 'send', 'switch'],
      supportedMethods: [
        'eth_sendTransaction',
        'eth_sign',
        'personal_sign',
        'eth_signTypedData',
        'eth_accounts',
        'eth_chainId'
      ],
      supportedEvents: ['chainChanged', 'accountsChanged', 'connect', 'disconnect']
    }],

    // Coinbase Wallet
    ['coinbasewallet', {
      name: 'Coinbase Wallet',
      shortName: 'Coinbase',
      description: 'The most trusted crypto wallet',
      url: 'https://wallet.coinbase.com',
      icons: ['https://cdn.iconscout.com/icon/free/png-256/coinbase-wallet-3521426-2944869.png'],
      deepLinks: {
        universal: 'https://wallet.coinbase.com/wsegue?uri=',
        native: 'coinbase-wallet://wc?uri=',
        web: 'https://wallet.coinbase.com'
      },
      chains: ['eip155:1', 'eip155:137', 'eip155:56', 'eip155:42161'],
      features: ['connect', 'disconnect', 'sign', 'send', 'switch'],
      supportedMethods: [
        'eth_sendTransaction',
        'eth_sign',
        'personal_sign',
        'eth_signTypedData',
        'eth_accounts',
        'eth_chainId',
        'wallet_switchEthereumChain',
        'wallet_addEthereumChain'
      ],
      supportedEvents: ['chainChanged', 'accountsChanged', 'connect', 'disconnect']
    }],

    // Rainbow
    ['rainbow', {
      name: 'Rainbow',
      shortName: 'Rainbow',
      description: 'The best way to explore Web3',
      url: 'https://rainbow.me',
      icons: ['https://cdn.iconscout.com/icon/free/png-256/rainbow-wallet-3521426-2944869.png'],
      deepLinks: {
        universal: 'https://rnbwapp.com/wc?uri=',
        native: 'rainbow://wc?uri=',
        web: 'https://rainbow.me'
      },
      chains: ['eip155:1', 'eip155:137', 'eip155:56', 'eip155:42161'],
      features: ['connect', 'disconnect', 'sign', 'send', 'switch'],
      supportedMethods: [
        'eth_sendTransaction',
        'eth_sign',
        'personal_sign',
        'eth_signTypedData',
        'eth_accounts',
        'eth_chainId'
      ],
      supportedEvents: ['chainChanged', 'accountsChanged', 'connect', 'disconnect']
    }],

    // Phantom
    ['phantom', {
      name: 'Phantom',
      shortName: 'Phantom',
      description: 'The most trusted Solana wallet',
      url: 'https://phantom.app',
      icons: ['https://cdn.iconscout.com/icon/free/png-256/phantom-wallet-3521426-2944869.png'],
      deepLinks: {
        universal: 'https://phantom.app/ul/browse/',
        native: 'phantom://browse/',
        web: 'https://phantom.app'
      },
      chains: ['solana:mainnet', 'solana:testnet', 'solana:devnet'],
      features: ['connect', 'disconnect', 'sign', 'send', 'switch'],
      supportedMethods: [
        'signTransaction',
        'signMessage',
        'signAllTransactions',
        'connect',
        'disconnect'
      ],
      supportedEvents: ['connect', 'disconnect', 'accountChanged']
    }],

    // Argent
    ['argent', {
      name: 'Argent',
      shortName: 'Argent',
      description: 'The most secure wallet for DeFi',
      url: 'https://argent.xyz',
      icons: ['https://cdn.iconscout.com/icon/free/png-256/argent-wallet-3521426-2944869.png'],
      deepLinks: {
        universal: 'https://argent.xyz/app/wc?uri=',
        native: 'argent://wc?uri=',
        web: 'https://argent.xyz'
      },
      chains: ['eip155:1', 'eip155:137', 'eip155:42161'],
      features: ['connect', 'disconnect', 'sign', 'send', 'switch'],
      supportedMethods: [
        'eth_sendTransaction',
        'eth_sign',
        'personal_sign',
        'eth_signTypedData',
        'eth_accounts',
        'eth_chainId'
      ],
      supportedEvents: ['chainChanged', 'accountsChanged', 'connect', 'disconnect']
    }],

    // OKX Wallet
    ['okx', {
      name: 'OKX Wallet',
      shortName: 'OKX',
      description: 'The most trusted crypto wallet',
      url: 'https://www.okx.com/web3',
      icons: ['https://cdn.iconscout.com/icon/free/png-256/okx-wallet-3521426-2944869.png'],
      deepLinks: {
        universal: 'https://www.okx.com/download?deeplink=',
        native: 'okx://main/wc?uri=',
        web: 'https://www.okx.com/web3'
      },
      chains: ['eip155:1', 'eip155:56', 'eip155:137', 'eip155:42161'],
      features: ['connect', 'disconnect', 'sign', 'send', 'switch'],
      supportedMethods: [
        'eth_sendTransaction',
        'eth_sign',
        'personal_sign',
        'eth_signTypedData',
        'eth_accounts',
        'eth_chainId'
      ],
      supportedEvents: ['chainChanged', 'accountsChanged', 'connect', 'disconnect']
    }],

    // Binance Wallet
    ['binancewallet', {
      name: 'Binance Wallet',
      shortName: 'Binance',
      description: 'The most trusted crypto wallet',
      url: 'https://www.bnbchain.org/en/binance-wallet',
      icons: ['https://cdn.iconscout.com/icon/free/png-256/binance-wallet-3521426-2944869.png'],
      deepLinks: {
        universal: 'https://www.bnbchain.org/en/binance-wallet',
        native: 'binance://',
        web: 'https://www.bnbchain.org/en/binance-wallet'
      },
      chains: ['eip155:1', 'eip155:56', 'eip155:137', 'eip155:42161'],
      features: ['connect', 'disconnect', 'sign', 'send', 'switch'],
      supportedMethods: [
        'eth_sendTransaction',
        'eth_sign',
        'personal_sign',
        'eth_signTypedData',
        'eth_accounts',
        'eth_chainId'
      ],
      supportedEvents: ['chainChanged', 'accountsChanged', 'connect', 'disconnect']
    }],

    // SafePal
    ['safepal', {
      name: 'SafePal',
      shortName: 'SafePal',
      description: 'The most secure crypto wallet',
      url: 'https://www.safepal.com',
      icons: ['https://cdn.iconscout.com/icon/free/png-256/safepal-wallet-3521426-2944869.png'],
      deepLinks: {
        universal: 'https://link.safepal.io/wc?uri=',
        native: 'safepal://wc?uri=',
        web: 'https://www.safepal.com'
      },
      chains: ['eip155:1', 'eip155:56', 'eip155:137', 'eip155:42161'],
      features: ['connect', 'disconnect', 'sign', 'send', 'switch'],
      supportedMethods: [
        'eth_sendTransaction',
        'eth_sign',
        'personal_sign',
        'eth_signTypedData',
        'eth_accounts',
        'eth_chainId'
      ],
      supportedEvents: ['chainChanged', 'accountsChanged', 'connect', 'disconnect']
    }],

    // Math Wallet
    ['mathwallet', {
      name: 'Math Wallet',
      shortName: 'Math',
      description: 'Multi-chain crypto wallet',
      url: 'https://mathwallet.org',
      icons: ['https://cdn.iconscout.com/icon/free/png-256/math-wallet-3521426-2944869.png'],
      deepLinks: {
        universal: 'https://mathwallet.org',
        native: 'mathwallet://',
        web: 'https://mathwallet.org'
      },
      chains: ['eip155:1', 'eip155:56', 'eip155:137', 'eip155:42161'],
      features: ['connect', 'disconnect', 'sign', 'send', 'switch'],
      supportedMethods: [
        'eth_sendTransaction',
        'eth_sign',
        'personal_sign',
        'eth_signTypedData',
        'eth_accounts',
        'eth_chainId'
      ],
      supportedEvents: ['chainChanged', 'accountsChanged', 'connect', 'disconnect']
    }],

    // Huobi Wallet
    ['huobiwallet', {
      name: 'Huobi Wallet',
      shortName: 'Huobi',
      description: 'The most trusted crypto wallet',
      url: 'https://www.huobi.com/wallet',
      icons: ['https://cdn.iconscout.com/icon/free/png-256/huobi-wallet-3521426-2944869.png'],
      deepLinks: {
        universal: 'https://www.huobi.com/wallet',
        native: 'huobi://',
        web: 'https://www.huobi.com/wallet'
      },
      chains: ['eip155:1', 'eip155:56', 'eip155:137', 'eip155:42161'],
      features: ['connect', 'disconnect', 'sign', 'send', 'switch'],
      supportedMethods: [
        'eth_sendTransaction',
        'eth_sign',
        'personal_sign',
        'eth_signTypedData',
        'eth_accounts',
        'eth_chainId'
      ],
      supportedEvents: ['chainChanged', 'accountsChanged', 'connect', 'disconnect']
    }],

    // BitKeep
    ['bitkeep', {
      name: 'BitKeep',
      shortName: 'BitKeep',
      description: 'Multi-chain crypto wallet',
      url: 'https://bitkeep.com',
      icons: ['https://cdn.iconscout.com/icon/free/png-256/bitkeep-wallet-3521426-2944869.png'],
      deepLinks: {
        universal: 'https://bitkeep.com',
        native: 'bitkeep://',
        web: 'https://bitkeep.com'
      },
      chains: ['eip155:1', 'eip155:56', 'eip155:137', 'eip155:42161'],
      features: ['connect', 'disconnect', 'sign', 'send', 'switch'],
      supportedMethods: [
        'eth_sendTransaction',
        'eth_sign',
        'personal_sign',
        'eth_signTypedData',
        'eth_accounts',
        'eth_chainId'
      ],
      supportedEvents: ['chainChanged', 'accountsChanged', 'connect', 'disconnect']
    }],

    // Gate Wallet
    ['gatewallet', {
      name: 'Gate Wallet',
      shortName: 'Gate',
      description: 'The most trusted crypto wallet',
      url: 'https://www.gate.io/wallet',
      icons: ['https://cdn.iconscout.com/icon/free/png-256/gate-wallet-3521426-2944869.png'],
      deepLinks: {
        universal: 'https://www.gate.io/wallet',
        native: 'gate://',
        web: 'https://www.gate.io/wallet'
      },
      chains: ['eip155:1', 'eip155:56', 'eip155:137', 'eip155:42161'],
      features: ['connect', 'disconnect', 'sign', 'send', 'switch'],
      supportedMethods: [
        'eth_sendTransaction',
        'eth_sign',
        'personal_sign',
        'eth_signTypedData',
        'eth_accounts',
        'eth_chainId'
      ],
      supportedEvents: ['chainChanged', 'accountsChanged', 'connect', 'disconnect']
    }],

    // Bybit Wallet
    ['bybitwallet', {
      name: 'Bybit Wallet',
      shortName: 'Bybit',
      description: 'The most trusted crypto wallet',
      url: 'https://www.bybit.com/en/wallet',
      icons: ['https://cdn.iconscout.com/icon/free/png-256/bybit-wallet-3521426-2944869.png'],
      deepLinks: {
        universal: 'https://www.bybit.com/en/wallet',
        native: 'bybit://',
        web: 'https://www.bybit.com/en/wallet'
      },
      chains: ['eip155:1', 'eip155:56', 'eip155:137', 'eip155:42161'],
      features: ['connect', 'disconnect', 'sign', 'send', 'switch'],
      supportedMethods: [
        'eth_sendTransaction',
        'eth_sign',
        'personal_sign',
        'eth_signTypedData',
        'eth_accounts',
        'eth_chainId'
      ],
      supportedEvents: ['chainChanged', 'accountsChanged', 'connect', 'disconnect']
    }]
  ]);

  // Get all available wallets
  static getAllWallets(): WalletMetadata[] {
    return Array.from(this.wallets.values());
  }

  // Get wallet by name
  static getWallet(name: string): WalletMetadata | undefined {
    return this.wallets.get(name.toLowerCase());
  }

  // Get wallets by chain
  static getWalletsByChain(chain: string): WalletMetadata[] {
    return Array.from(this.wallets.values()).filter(wallet => 
      wallet.chains.includes(chain)
    );
  }

  // Get wallets by feature
  static getWalletsByFeature(feature: string): WalletMetadata[] {
    return Array.from(this.wallets.values()).filter(wallet => 
      wallet.features.includes(feature)
    );
  }

  // Generate deep links for a URI
  static generateDeepLinks(uri: string): WalletDeepLink[] {
    const deepLinks: WalletDeepLink[] = [];
    
    for (const [name, wallet] of this.wallets.entries()) {
      if (wallet.deepLinks) {
        let universal = '';
        let native = '';
        
        // Handle wallet-specific URL formats
        switch (name) {
          case 'metamask':
            universal = `https://metamask.app.link/wc?uri=${encodeURIComponent(uri)}`;
            native = `metamask://wc?uri=${encodeURIComponent(uri)}`;
            break;
          case 'trustwallet':
            universal = `https://link.trustwallet.com/wc?uri=${encodeURIComponent(uri)}`;
            native = `trust://wc?uri=${encodeURIComponent(uri)}`;
            break;
          case 'coinbasewallet':
            universal = `https://wallet.coinbase.com/wsegue?uri=${encodeURIComponent(uri)}`;
            native = `coinbase-wallet://wc?uri=${encodeURIComponent(uri)}`;
            break;
          case 'rainbow':
            universal = `https://rnbwapp.com/wc?uri=${encodeURIComponent(uri)}`;
            native = `rainbow://wc?uri=${encodeURIComponent(uri)}`;
            break;
          case 'argent':
            universal = `https://argent.xyz/app/wc?uri=${encodeURIComponent(uri)}`;
            native = `argent://wc?uri=${encodeURIComponent(uri)}`;
            break;
          case 'okx':
            universal = `https://www.okx.com/download?deeplink=${encodeURIComponent(`okx://main/wc?uri=${uri}`)}`;
            native = `okx://main/wc?uri=${encodeURIComponent(uri)}`;
            break;
          case 'phantom':
            universal = `https://phantom.app/ul/browse/${encodeURIComponent(uri)}`;
            native = `phantom://browse/${encodeURIComponent(uri)}`;
            break;
          case 'imtoken':
            universal = `https://link.imtoken.com/nav/DappView?url=${encodeURIComponent(uri)}`;
            native = `imtokenv2://navigate/DappView?url=${encodeURIComponent(uri)}`;
            break;
          case 'binancewallet':
            universal = `https://www.bnbchain.org/en/binance-wallet?uri=${encodeURIComponent(uri)}`;
            native = `binance://wc?uri=${encodeURIComponent(uri)}`;
            break;
          case 'safepal':
            universal = `https://link.safepal.io/wc?uri=${encodeURIComponent(uri)}`;
            native = `safepal://wc?uri=${encodeURIComponent(uri)}`;
            break;
          case 'mathwallet':
            universal = `https://mathwallet.org/wc?uri=${encodeURIComponent(uri)}`;
            native = `mathwallet://wc?uri=${encodeURIComponent(uri)}`;
            break;
          case 'huobiwallet':
            universal = `https://www.huobi.com/wallet?uri=${encodeURIComponent(uri)}`;
            native = `huobi://wc?uri=${encodeURIComponent(uri)}`;
            break;
          case 'bitkeep':
            universal = `https://bitkeep.com/wc?uri=${encodeURIComponent(uri)}`;
            native = `bitkeep://wc?uri=${encodeURIComponent(uri)}`;
            break;
          case 'gatewallet':
            universal = `https://www.gate.io/wallet?uri=${encodeURIComponent(uri)}`;
            native = `gate://wc?uri=${encodeURIComponent(uri)}`;
            break;
          case 'bybitwallet':
            universal = `https://www.bybit.com/en/wallet?uri=${encodeURIComponent(uri)}`;
            native = `bybit://wc?uri=${encodeURIComponent(uri)}`;
            break;
          default:
            // Default behavior for other wallets
            universal = wallet.deepLinks.universal ? `${wallet.deepLinks.universal}${encodeURIComponent(uri)}` : '';
            native = wallet.deepLinks.native ? `${wallet.deepLinks.native}${encodeURIComponent(uri)}` : '';
        }
        
        const deepLink: WalletDeepLink = {
          wallet: name,
          universal,
          native,
          web: wallet.deepLinks.web || ''
        };
        deepLinks.push(deepLink);
      }
    }
    
    return deepLinks;
  }

  // Get recommended wallets for a chain
  static getRecommendedWallets(chain: string): WalletMetadata[] {
    const recommended = ['metamask', 'trustwallet', 'coinbasewallet', 'rainbow', 'argent', 'okx'];
    return recommended
      .map(name => this.getWallet(name))
      .filter(wallet => wallet && wallet.chains.includes(chain)) as WalletMetadata[];
  }

  // Check if wallet supports method
  static supportsMethod(walletName: string, method: string): boolean {
    const wallet = this.getWallet(walletName);
    return wallet ? wallet.supportedMethods.includes(method) : false;
  }

  // Check if wallet supports event
  static supportsEvent(walletName: string, event: string): boolean {
    const wallet = this.getWallet(walletName);
    return wallet ? wallet.supportedEvents.includes(event) : false;
  }

  // Get wallet icon
  static getWalletIcon(walletName: string): string | undefined {
    const wallet = this.getWallet(walletName);
    return wallet?.icons[0];
  }

  // Get wallet description
  static getWalletDescription(walletName: string): string | undefined {
    const wallet = this.getWallet(walletName);
    return wallet?.description;
  }
} 