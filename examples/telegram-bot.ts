import { WalletConnectSDK } from '../src/core/WalletConnectSDK';
import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

dotenv.config();

/**
 * 🤖 Telegram Bot Example
 * 
 * This example shows how to integrate WalletConnect Backend SDK with Telegram Bot API.
 * Uses node-telegram-bot-api for simple polling-based bot.
 */

class TelegramWalletBot {
  private sdk: WalletConnectSDK;
  private bot: TelegramBot;
  private userSessions: Map<number, string> = new Map(); // Telegram ID -> WalletConnect User ID
  private pendingConnections: Map<string, number> = new Map(); // WalletConnect User ID -> Telegram ID
  private projectId: string;
  private isInitialized: boolean = false;

  constructor(botToken: string, projectId: string) {
    this.projectId = projectId;
    
    this.sdk = new WalletConnectSDK({
      projectId: this.projectId,
      timeouts: {
        connection: 300000, // 5 minutes for mobile
        transaction: 180000, // 3 minutes
        signing: 60000, // 1 minute
        contractCall: 120000, // 2 minutes
        contractRead: 30000, // 30 seconds
        gasEstimation: 30000 // 30 seconds
      }
    });

    this.bot = new TelegramBot(botToken, { polling: true });
  }

  /**
   * Initialize the bot
   */
  async init() {
    try {
      await this.sdk.init();
      this.isInitialized = true;
      console.log('✅ Telegram Wallet Bot initialized');
      
      // Setup bot commands
      this.setupCommands();
      
      // Get bot info
      const botInfo = await this.bot.getMe();
      console.log(`🤖 Bot: @${botInfo.username} (${botInfo.first_name})`);
      
    } catch (error) {
      console.error('❌ Failed to initialize bot:', error);
      throw error;
    }
  }

  /**
   * Setup bot commands and handlers
   */
  private setupCommands() {
    // Start command
    this.bot.onText(/\/start/, async (msg) => {
      await this.handleStart(msg.chat.id, msg.from!.id);
    });

    // Connect command
    this.bot.onText(/\/connect/, async (msg) => {
      await this.handleConnect(msg.chat.id, msg.from!.id);
    });

    // Balance command
    this.bot.onText(/\/balance/, async (msg) => {
      await this.handleBalance(msg.chat.id, msg.from!.id);
    });

    // Send command
    this.bot.onText(/\/send/, async (msg) => {
      await this.handleSend(msg.chat.id, msg.from!.id);
    });

    // Contract command
    this.bot.onText(/\/contract/, async (msg) => {
      await this.handleContract(msg.chat.id, msg.from!.id);
    });

    // Wallets command
    this.bot.onText(/\/wallets/, async (msg) => {
      await this.handleWallets(msg.chat.id);
    });

    // Test deep links command
    this.bot.onText(/\/testlinks/, async (msg) => {
      await this.handleTestLinks(msg.chat.id);
    });

    // Help command
    this.bot.onText(/\/help/, async (msg) => {
      await this.handleHelp(msg.chat.id);
    });

    // Disconnect command
    this.bot.onText(/\/disconnect/, async (msg) => {
      await this.handleDisconnect(msg.chat.id, msg.from!.id);
    });

    // Status command
    this.bot.onText(/\/status/, async (msg) => {
      await this.handleStatus(msg.chat.id, msg.from!.id);
    });

    // Handle unknown commands
    this.bot.onText(/\/.*/, async (msg) => {
      await this.bot.sendMessage(msg.chat.id, 'Unknown command. Use /help for available commands.');
    });

    // Handle regular messages
    this.bot.on('message', async (msg) => {
      if (!msg.text?.startsWith('/')) {
        await this.bot.sendMessage(msg.chat.id, 'Use /start to connect your wallet or /help for commands.');
      }
    });

    console.log('✅ Bot commands setup complete');
  }

  /**
   * Handle /start command
   */
  private async handleStart(chatId: number, telegramUserId: number) {
    const welcomeMessage = `
🚀 Welcome to WalletConnect Telegram Bot!

This bot allows you to:
• Connect your wallet securely
• Check balances
• Send transactions
• Interact with smart contracts
• Get real-time notifications

Use /connect to connect your wallet
Use /help for all available commands
    `.trim();

    await this.bot.sendMessage(chatId, welcomeMessage);
  }

  /**
   * Handle /connect command
   */
  private async handleConnect(chatId: number, telegramUserId: number) {
    try {
      console.log(`🔗 Connecting user ${telegramUserId}`);
      
      // Check if user already connected
      const existingUserId = this.userSessions.get(telegramUserId);
      if (existingUserId && await this.sdk.isConnected(existingUserId)) {
        await this.bot.sendMessage(chatId, '✅ You are already connected!');
        return;
      }

      // Create new connection
      const walletUserId = `telegram-${telegramUserId}-${Date.now()}`;
      
      await this.bot.sendMessage(chatId, '🔗 Creating connection...');

      const connection = await this.sdk.connect({
        userId: walletUserId,
        chainId: 1,
        methods: [
          'eth_sendTransaction',
          'eth_sign',
          'personal_sign',
          'eth_signTypedData',
          'eth_call',
          'eth_estimateGas'
        ]
      });

      if (!connection.success) {
        await this.bot.sendMessage(chatId, `❌ Connection failed: ${connection.error}`);
        return;
      }

      // Store session mapping
      this.userSessions.set(telegramUserId, walletUserId);
      this.pendingConnections.set(walletUserId, telegramUserId);

      // Send connection info with deep links
      let message = '📱 Connect your wallet using one of these options:\n\n';
      
      if (connection.deepLinks) {
        // Show top 6 recommended wallets
        const recommendedWallets = ['metamask', 'trustwallet', 'coinbasewallet', 'rainbow', 'argent', 'okx'];
        
        for (const walletName of recommendedWallets) {
          const deepLink = connection.deepLinks.find(dl => dl.wallet === walletName);
          if (deepLink) {
            message += `🔗 ${walletName.toUpperCase()}: ${deepLink.universal}\n\n`;
          }
        }
      }

      message += `⏱️ Timeout: ${Math.round(connection.timeout! / 1000)} seconds\n`;
      message += `⏳ Waiting for connection...`;

      await this.bot.sendMessage(chatId, message);

      // Start monitoring connection
      this.monitorConnection(walletUserId, chatId);

    } catch (error) {
      console.error('❌ Connect error:', error);
      await this.bot.sendMessage(chatId, '❌ Failed to create connection. Please try again.');
    }
  }

  /**
   * Monitor connection status
   */
  private async monitorConnection(walletUserId: string, chatId: number) {
    const maxAttempts = Math.ceil(300000 / 5000); // 5 minutes / 5 seconds
    let attempts = 0;

    console.log(`👀 Monitoring connection for ${walletUserId}`);

    while (attempts < maxAttempts) {
      try {
        const isConnected = await this.sdk.isConnected(walletUserId);
        
        if (isConnected) {
          const accounts = await this.sdk.getAccounts(walletUserId);
          const balance = await this.sdk.getBalance(walletUserId);
          
          await this.bot.sendMessage(chatId, 
            `✅ Connected successfully!\n\n` +
            `👤 Address: ${accounts[0]}\n` +
            `💰 Balance: ${this.formatEther(balance)} ETH\n\n` +
            `Use /balance to check balances\n` +
            `Use /send to send transactions\n` +
            `Use /contract for smart contract interactions`
          );
          
          // Remove from pending connections
          this.pendingConnections.delete(walletUserId);
          return;
        }

        await new Promise(resolve => setTimeout(resolve, 5000));
        attempts++;
      } catch (error) {
        console.error('❌ Connection monitoring error:', error);
        break;
      }
    }

    // Connection timed out
    await this.bot.sendMessage(chatId, '⏰ Connection timed out. Please try /connect again.');
    this.pendingConnections.delete(walletUserId);
  }

  /**
   * Handle /balance command
   */
  private async handleBalance(chatId: number, telegramUserId: number) {
    try {
      const walletUserId = this.userSessions.get(telegramUserId);
      
      if (!walletUserId || !(await this.sdk.isConnected(walletUserId))) {
        await this.bot.sendMessage(chatId, '❌ Please connect your wallet first using /connect');
        return;
      }

      const accounts = await this.sdk.getAccounts(walletUserId);
      const ethBalance = await this.sdk.getBalance(walletUserId);

      let message = '💰 Your Balances:\n\n';
      message += `🌐 ETH: ${this.formatEther(ethBalance)} ETH\n`;
      message += `👤 Address: ${accounts[0]}\n`;

      await this.bot.sendMessage(chatId, message);

    } catch (error) {
      console.error('❌ Balance error:', error);
      await this.bot.sendMessage(chatId, '❌ Failed to get balance. Please try again.');
    }
  }

  /**
   * Handle /send command
   */
  private async handleSend(chatId: number, telegramUserId: number) {
    try {
      const walletUserId = this.userSessions.get(telegramUserId);
      
      if (!walletUserId || !(await this.sdk.isConnected(walletUserId))) {
        await this.bot.sendMessage(chatId, '❌ Please connect your wallet first using /connect');
        return;
      }

      await this.bot.sendMessage(chatId, 
        '✍️ Sending transaction...\n\n' +
        'Format: /send <address> <amount>\n' +
        'Example: /send 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6 0.001\n\n' +
        '⚠️ Transaction sending is disabled in this example for safety.'
      );

    } catch (error) {
      console.error('❌ Send error:', error);
      await this.bot.sendMessage(chatId, '❌ Failed to send transaction. Please try again.');
    }
  }

  /**
   * Handle /contract command
   */
  private async handleContract(chatId: number, telegramUserId: number) {
    try {
      const walletUserId = this.userSessions.get(telegramUserId);
      
      if (!walletUserId || !(await this.sdk.isConnected(walletUserId))) {
        await this.bot.sendMessage(chatId, '❌ Please connect your wallet first using /connect');
        return;
      }

      await this.bot.sendMessage(chatId,
        '🏗️ Smart Contract Interactions:\n\n' +
        'Available commands:\n' +
        '• /contract_read <address> <function> <args>\n' +
        '• /contract_call <address> <function> <args>\n' +
        '• /estimate_gas <address> <function> <args>\n\n' +
        'Example:\n' +
        '/contract_read 0xA0b86a33E6441b8C4C8C0C8C0C8C0C8C0C8C0C8C balanceOf 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
      );

    } catch (error) {
      console.error('❌ Contract error:', error);
      await this.bot.sendMessage(chatId, '❌ Failed to process contract command. Please try again.');
    }
  }

  /**
   * Handle /wallets command
   */
  private async handleWallets(chatId: number) {
    try {
      const wallets = await this.sdk.getRecommendedWallets('eip155:1');
      
      let message = '📱 Recommended Wallets:\n\n';
      
      wallets.forEach(wallet => {
        message += `• ${wallet.name} (${wallet.shortName})\n`;
        message += `  ${wallet.description}\n\n`;
      });

      await this.bot.sendMessage(chatId, message);

    } catch (error) {
      console.error('❌ Wallets error:', error);
      await this.bot.sendMessage(chatId, '❌ Failed to get wallet information.');
    }
  }

  /**
   * Handle /testlinks command
   */
  private async handleTestLinks(chatId: number) {
    try {
      const connection = await this.sdk.connect({
        userId: `test-${Date.now()}`,
        chainId: 1,
        methods: [
          'eth_sendTransaction',
          'eth_sign',
          'personal_sign',
          'eth_signTypedData',
          'eth_call',
          'eth_estimateGas'
        ]
      });

      if (connection.success) {
        let message = '✅ Deep Links Test Successful!\n\n';
        message += 'Available Deep Links:\n';
        if (connection.deepLinks) {
          connection.deepLinks.forEach(dl => {
            message += `• ${dl.wallet.toUpperCase()}: ${dl.universal}\n`;
          });
        } else {
          message += 'No deep links available for this connection.';
        }
        await this.bot.sendMessage(chatId, message);
      } else {
        await this.bot.sendMessage(chatId, `❌ Deep Links Test Failed: ${connection.error}`);
      }
    } catch (error) {
      console.error('❌ Deep Links Test error:', error);
      await this.bot.sendMessage(chatId, '❌ Failed to test deep links.');
    }
  }

  /**
   * Handle /help command
   */
  private async handleHelp(chatId: number) {
    const helpMessage = `
🤖 WalletConnect Telegram Bot - Help

Commands:
/start - Start the bot
/connect - Connect your wallet
/balance - Check your balances
/send - Send a transaction
/contract - Smart contract interactions
/wallets - View supported wallets
/testlinks - Test deep links generation
/status - Check connection status
/disconnect - Disconnect your wallet
/help - Show this help message

Features:
• Secure wallet connection
• Real-time balance checking
• Transaction sending
• Smart contract interactions
• Multiple wallet support
• Mobile-friendly deep links
• 15+ supported wallets including:
  - MetaMask, Trust Wallet, Coinbase Wallet
  - Rainbow, Argent, OKX, Binance Wallet
  - SafePal, Math Wallet, Huobi, BitKeep
  - Gate Wallet, Bybit Wallet, Phantom

For support, contact @your_support_handle
    `.trim();

    await this.bot.sendMessage(chatId, helpMessage);
  }

  /**
   * Handle /status command
   */
  private async handleStatus(chatId: number, telegramUserId: number) {
    try {
      const walletUserId = this.userSessions.get(telegramUserId);
      
      if (!walletUserId) {
        await this.bot.sendMessage(chatId, '❌ No wallet connected. Use /connect to connect.');
        return;
      }

      const isConnected = await this.sdk.isConnected(walletUserId);
      
      if (isConnected) {
        const accounts = await this.sdk.getAccounts(walletUserId);
        await this.bot.sendMessage(chatId, 
          `✅ Connected\n` +
          `👤 Address: ${accounts[0]}\n` +
          `🆔 User ID: ${walletUserId}`
        );
      } else {
        await this.bot.sendMessage(chatId, '❌ Wallet disconnected. Use /connect to reconnect.');
      }

    } catch (error) {
      console.error('❌ Status error:', error);
      await this.bot.sendMessage(chatId, '❌ Failed to get status.');
    }
  }

  /**
   * Handle /disconnect command
   */
  private async handleDisconnect(chatId: number, telegramUserId: number) {
    try {
      const walletUserId = this.userSessions.get(telegramUserId);
      
      if (!walletUserId) {
        await this.bot.sendMessage(chatId, '❌ No wallet connected.');
        return;
      }

      const result = await this.sdk.disconnect(walletUserId);
      
      if (result) {
        this.userSessions.delete(telegramUserId);
        this.pendingConnections.delete(walletUserId);
        await this.bot.sendMessage(chatId, '✅ Wallet disconnected successfully.');
      } else {
        await this.bot.sendMessage(chatId, '❌ Failed to disconnect wallet.');
      }

    } catch (error) {
      console.error('❌ Disconnect error:', error);
      await this.bot.sendMessage(chatId, '❌ Error disconnecting wallet.');
    }
  }

  /**
   * Format ETH amount
   */
  private formatEther(amount: bigint): string {
    return (Number(amount) / 1e18).toFixed(6);
  }

  /**
   * Get bot statistics
   */
  async getStats() {
    const sessions = await this.sdk.getAllSessions();
    
    return {
      connectedUsers: this.userSessions.size,
      pendingConnections: this.pendingConnections.size,
      totalSessions: sessions.length,
      activeSessions: sessions.filter(s => s.isActive).length
    };
  }

  /**
   * Cleanup bot
   */
  async destroy() {
    this.bot.stopPolling();
    await this.sdk.destroy();
    console.log('✅ Telegram Wallet Bot destroyed');
  }
}

/**
 * Example usage of the Telegram Wallet Bot
 */
async function runTelegramBot() {
  console.log('🤖 Telegram Wallet Bot Example\n');

  const BOT_TOKEN = process.env['TELEGRAM_BOT_TOKEN'];
  const PROJECT_ID = process.env['WALLETCONNECT_PROJECT_ID'];

  if (!BOT_TOKEN) {
    console.log('❌ Please set TELEGRAM_BOT_TOKEN environment variable');
    console.log('📱 Get a bot token from @BotFather on Telegram');
    return;
  }

  if (!PROJECT_ID) {
    console.log('❌ Please set WALLETCONNECT_PROJECT_ID environment variable');
    console.log('🌐 Get project ID from https://cloud.walletconnect.com/');
    return;
  }

  try {
    // Create and initialize bot
    const bot = new TelegramWalletBot(BOT_TOKEN, PROJECT_ID);
    await bot.init();

    console.log('✅ Telegram Bot is running!');
    console.log('📱 Users can now interact with the bot on Telegram');
    console.log('🔄 Bot is using polling mode (no webhook needed)');

    // Keep the process running
    process.on('SIGINT', async () => {
      console.log('\n🛑 Shutting down Telegram Bot...');
      await bot.destroy();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Failed to start Telegram Bot:', error);
    process.exit(1);
  }
}

// Run the example
if (require.main === module) {
  runTelegramBot().catch(console.error);
}

export { TelegramWalletBot, runTelegramBot }; 