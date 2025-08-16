import { WalletConnectSDK } from '../src/core/WalletConnectSDK';
import { Address } from 'viem';

/**
 * 🤖 DeFi DEX Trading Bot Example
 * 
 * This example demonstrates how to build a DeFi trading bot using WalletConnect Backend SDK.
 * Shows advanced contract interactions, price monitoring, and automated trading strategies.
 */

// Uniswap V2 Router ABI (simplified)
const UNISWAP_V2_ROUTER_ABI = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amountIn",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "amountOutMin",
        "type": "uint256"
      },
      {
        "internalType": "address[]",
        "name": "path",
        "type": "address[]"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "deadline",
        "type": "uint256"
      }
    ],
    "name": "swapExactTokensForTokens",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "amounts",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amountOutMin",
        "type": "uint256"
      },
      {
        "internalType": "address[]",
        "name": "path",
        "type": "address[]"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "deadline",
        "type": "uint256"
      }
    ],
    "name": "swapExactETHForTokens",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "amounts",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amountIn",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "amountOutMin",
        "type": "uint256"
      },
      {
        "internalType": "address[]",
        "name": "path",
        "type": "address[]"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "deadline",
        "type": "uint256"
      }
    ],
    "name": "swapExactTokensForETH",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "amounts",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// ERC20 Token ABI (simplified)
const ERC20_ABI = [
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {"name": "_spender", "type": "address"},
      {"name": "_value", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"name": "", "type": "bool"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [{"name": "", "type": "uint8"}],
    "type": "function"
  }
];

// Trading configuration
interface TradingConfig {
  userId: string;
  sdk: WalletConnectSDK;
  routerAddress: Address;
  wethAddress: Address;
  usdcAddress: Address;
  slippageTolerance: number; // 0.5 = 0.5%
  maxGasPrice: bigint;
  minTradeAmount: bigint;
}

// Price data interface
interface PriceData {
  token: Address;
  price: number;
  timestamp: number;
}

// Trading strategy interface
interface TradingStrategy {
  name: string;
  shouldBuy: (priceData: PriceData[]) => boolean;
  shouldSell: (priceData: PriceData[]) => boolean;
  buyAmount: (balance: bigint) => bigint;
  sellAmount: (balance: bigint) => bigint;
}

class DexTradingBot {
  private config: TradingConfig;
  private priceHistory: Map<Address, PriceData[]> = new Map();
  private isRunning = false;
  private tradingInterval?: NodeJS.Timeout;

  constructor(config: TradingConfig) {
    this.config = config;
  }

  /**
   * Start the trading bot
   */
  async start() {
    console.log('🤖 Starting DEX Trading Bot...');
    
    // Check if user is connected
    const isConnected = await this.config.sdk.isConnected(this.config.userId);
    if (!isConnected) {
      throw new Error('User not connected. Please connect wallet first.');
    }

    // Get initial balances
    const ethBalance = await this.config.sdk.getBalance(this.config.userId);
    const usdcBalance = await this.getTokenBalance(this.config.usdcAddress);
    
    console.log('💰 Initial Balances:');
    console.log(`  - ETH: ${this.formatEther(ethBalance)} ETH`);
    console.log(`  - USDC: ${this.formatUSDC(usdcBalance)} USDC`);

    this.isRunning = true;
    
    // Start price monitoring and trading
    this.tradingInterval = setInterval(async () => {
      await this.executeTradingCycle();
    }, 30000); // Check every 30 seconds

    console.log('✅ Trading bot started successfully!');
  }

  /**
   * Stop the trading bot
   */
  async stop() {
    console.log('🛑 Stopping DEX Trading Bot...');
    
    this.isRunning = false;
    
    if (this.tradingInterval) {
      clearInterval(this.tradingInterval);
      this.tradingInterval = undefined;
    }

    console.log('✅ Trading bot stopped.');
  }

  /**
   * Execute one trading cycle
   */
  private async executeTradingCycle() {
    try {
      console.log('\n📊 Executing trading cycle...');

      // 1. Update price data
      await this.updatePriceData();

      // 2. Check trading conditions
      const shouldTrade = await this.checkTradingConditions();
      
      if (!shouldTrade) {
        console.log('⏸️ No trading conditions met, skipping cycle.');
        return;
      }

      // 3. Execute trades
      await this.executeTrades();

    } catch (error) {
      console.error('❌ Error in trading cycle:', error);
    }
  }

  /**
   * Update price data for monitored tokens
   */
  private async updatePriceData() {
    console.log('📈 Updating price data...');

    const tokens = [this.config.wethAddress, this.config.usdcAddress];
    
    for (const token of tokens) {
      try {
        // In a real implementation, you would fetch price from DEX or oracle
        // For this example, we'll simulate price data
        const price = this.simulatePrice(token);
        const priceData: PriceData = {
          token,
          price,
          timestamp: Date.now()
        };

        if (!this.priceHistory.has(token)) {
          this.priceHistory.set(token, []);
        }

        const history = this.priceHistory.get(token)!;
        history.push(priceData);

        // Keep only last 100 price points
        if (history.length > 100) {
          history.shift();
        }

        console.log(`  - ${token}: $${price.toFixed(6)}`);
      } catch (error) {
        console.error(`❌ Failed to update price for ${token}:`, error);
      }
    }
  }

  /**
   * Check if trading conditions are met
   */
  private async checkTradingConditions(): Promise<boolean> {
    const wethHistory = this.priceHistory.get(this.config.wethAddress) || [];
    const usdcHistory = this.priceHistory.get(this.config.usdcAddress) || [];

    if (wethHistory.length < 10 || usdcHistory.length < 10) {
      return false; // Need more price data
    }

    // Simple trading strategy: buy when price drops 2%, sell when it rises 2%
    const currentWethPrice = wethHistory[wethHistory.length - 1].price;
    const avgWethPrice = wethHistory.reduce((sum, p) => sum + p.price, 0) / wethHistory.length;
    
    const priceChange = ((currentWethPrice - avgWethPrice) / avgWethPrice) * 100;

    console.log(`📊 Price Analysis:`);
    console.log(`  - Current WETH Price: $${currentWethPrice.toFixed(2)}`);
    console.log(`  - Average WETH Price: $${avgWethPrice.toFixed(2)}`);
    console.log(`  - Price Change: ${priceChange.toFixed(2)}%`);

    return Math.abs(priceChange) > 2; // Trade if price changed more than 2%
  }

  /**
   * Execute trades based on current conditions
   */
  private async executeTrades() {
    console.log('🔄 Executing trades...');

    const wethHistory = this.priceHistory.get(this.config.wethAddress) || [];
    const currentWethPrice = wethHistory[wethHistory.length - 1].price;
    const avgWethPrice = wethHistory.reduce((sum, p) => sum + p.price, 0) / wethHistory.length;
    const priceChange = ((currentWethPrice - avgWethPrice) / avgWethPrice) * 100;

    const ethBalance = await this.config.sdk.getBalance(this.config.userId);
    const usdcBalance = await this.getTokenBalance(this.config.usdcAddress);

    if (priceChange < -2 && usdcBalance > this.config.minTradeAmount) {
      // Price dropped, buy WETH with USDC
      await this.buyWETHWithUSDC(usdcBalance);
    } else if (priceChange > 2 && ethBalance > this.config.minTradeAmount) {
      // Price rose, sell WETH for USDC
      await this.sellWETHForUSDC(ethBalance);
    }
  }

  /**
   * Buy WETH with USDC
   */
  private async buyWETHWithUSDC(usdcBalance: bigint) {
    console.log('🟢 Buying WETH with USDC...');

    const tradeAmount = usdcBalance / 2n; // Use half of USDC balance
    const minWethOut = this.calculateMinOutput(tradeAmount, 0.5); // 0.5% slippage

    try {
      // First approve USDC spending
      await this.approveToken(this.config.usdcAddress, this.config.routerAddress, tradeAmount);

      // Execute swap
      const result = await this.config.sdk.callContract({
        userId: this.config.userId,
        contract: {
          address: this.config.routerAddress,
          abi: UNISWAP_V2_ROUTER_ABI,
          chainId: 1
        },
        functionName: 'swapExactTokensForTokens',
        args: [
          tradeAmount,
          minWethOut,
          [this.config.usdcAddress, this.config.wethAddress],
          await this.getUserAddress(),
          Math.floor(Date.now() / 1000) + 300 // 5 minutes deadline
        ],
        gas: await this.estimateGasForSwap(tradeAmount, [this.config.usdcAddress, this.config.wethAddress])
      });

      if (result.success) {
        console.log('✅ WETH purchase successful!');
        console.log(`  - Transaction: ${result.hash}`);
        console.log(`  - USDC spent: ${this.formatUSDC(tradeAmount)}`);
      } else {
        console.log('❌ WETH purchase failed:', result.error);
      }
    } catch (error) {
      console.error('❌ Error buying WETH:', error);
    }
  }

  /**
   * Sell WETH for USDC
   */
  private async sellWETHForUSDC(wethBalance: bigint) {
    console.log('🔴 Selling WETH for USDC...');

    const tradeAmount = wethBalance / 2n; // Use half of WETH balance
    const minUsdcOut = this.calculateMinOutput(tradeAmount, 0.5); // 0.5% slippage

    try {
      // First approve WETH spending
      await this.approveToken(this.config.wethAddress, this.config.routerAddress, tradeAmount);

      // Execute swap
      const result = await this.config.sdk.callContract({
        userId: this.config.userId,
        contract: {
          address: this.config.routerAddress,
          abi: UNISWAP_V2_ROUTER_ABI,
          chainId: 1
        },
        functionName: 'swapExactTokensForETH',
        args: [
          tradeAmount,
          minUsdcOut,
          [this.config.wethAddress, this.config.usdcAddress],
          await this.getUserAddress(),
          Math.floor(Date.now() / 1000) + 300 // 5 minutes deadline
        ],
        gas: await this.estimateGasForSwap(tradeAmount, [this.config.wethAddress, this.config.usdcAddress])
      });

      if (result.success) {
        console.log('✅ WETH sale successful!');
        console.log(`  - Transaction: ${result.hash}`);
        console.log(`  - WETH sold: ${this.formatEther(tradeAmount)}`);
      } else {
        console.log('❌ WETH sale failed:', result.error);
      }
    } catch (error) {
      console.error('❌ Error selling WETH:', error);
    }
  }

  /**
   * Get token balance
   */
  private async getTokenBalance(tokenAddress: Address): Promise<bigint> {
    try {
      const result = await this.config.sdk.readContract({
        userId: this.config.userId,
        contract: {
          address: tokenAddress,
          abi: ERC20_ABI,
          chainId: 1
        },
        functionName: 'balanceOf',
        args: [await this.getUserAddress()]
      });

      if (result.success) {
        return result.data as bigint;
      }
      return 0n;
    } catch (error) {
      console.error('❌ Error getting token balance:', error);
      return 0n;
    }
  }

  /**
   * Approve token spending
   */
  private async approveToken(tokenAddress: Address, spender: Address, amount: bigint) {
    try {
      const result = await this.config.sdk.callContract({
        userId: this.config.userId,
        contract: {
          address: tokenAddress,
          abi: ERC20_ABI,
          chainId: 1
        },
        functionName: 'approve',
        args: [spender, amount]
      });

      if (result.success) {
        console.log(`✅ Approved ${spender} to spend ${amount} tokens`);
      } else {
        console.log('❌ Approval failed:', result.error);
      }
    } catch (error) {
      console.error('❌ Error approving token:', error);
    }
  }

  /**
   * Get user address
   */
  private async getUserAddress(): Promise<Address> {
    const accounts = await this.config.sdk.getAccounts(this.config.userId);
    return accounts[0] as Address;
  }

  /**
   * Estimate gas for swap
   */
  private async estimateGasForSwap(amount: bigint, path: Address[]): Promise<bigint> {
    try {
      const result = await this.config.sdk.estimateGas({
        userId: this.config.userId,
        contract: {
          address: this.config.routerAddress,
          abi: UNISWAP_V2_ROUTER_ABI,
          chainId: 1
        },
        functionName: 'swapExactTokensForTokens',
        args: [
          amount,
          0n, // amountOutMin
          path,
          await this.getUserAddress(),
          Math.floor(Date.now() / 1000) + 300
        ]
      });

      if (result.success && result.gas) {
        return result.gas;
      }
      return 200000n; // Default gas limit
    } catch (error) {
      console.error('❌ Error estimating gas:', error);
      return 200000n; // Default gas limit
    }
  }

  /**
   * Calculate minimum output with slippage
   */
  private calculateMinOutput(amount: bigint, slippagePercent: number): bigint {
    const slippageMultiplier = (100 - slippagePercent) / 100;
    return (amount * BigInt(Math.floor(slippageMultiplier * 1000))) / 1000n;
  }

  /**
   * Simulate price data (replace with real price feed)
   */
  private simulatePrice(token: Address): number {
    // Simulate price movement
    const basePrice = token === this.config.wethAddress ? 2000 : 1;
    const volatility = 0.02; // 2% volatility
    const randomChange = (Math.random() - 0.5) * volatility;
    return basePrice * (1 + randomChange);
  }

  /**
   * Format ETH amount
   */
  private formatEther(amount: bigint): string {
    return (Number(amount) / 1e18).toFixed(6);
  }

  /**
   * Format USDC amount
   */
  private formatUSDC(amount: bigint): string {
    return (Number(amount) / 1e6).toFixed(2);
  }

  /**
   * Get trading statistics
   */
  async getStats() {
    const ethBalance = await this.config.sdk.getBalance(this.config.userId);
    const usdcBalance = await this.getTokenBalance(this.config.usdcAddress);
    
    return {
      isRunning: this.isRunning,
      ethBalance: this.formatEther(ethBalance),
      usdcBalance: this.formatUSDC(usdcBalance),
      priceHistorySize: Array.from(this.priceHistory.values()).map(h => h.length)
    };
  }
}

/**
 * Example usage of the DEX Trading Bot
 */
async function runDexTradingBot() {
  console.log('🤖 DEX Trading Bot Example\n');

  // Initialize SDK
  const sdk = new WalletConnectSDK({
    projectId: 'YOUR_PROJECT_ID',
    timeouts: {
      connection: 60000,
      transaction: 120000,
      contractCall: 90000,
      gasEstimation: 30000
    }
  });

  await sdk.init();

  // Connect user
  const userId = 'trader-' + Date.now();
  const connection = await sdk.connect({
    userId,
    chainId: 1,
    methods: ['eth_sendTransaction', 'eth_call', 'eth_estimateGas']
  });

  if (!connection.success) {
    console.error('❌ Connection failed:', connection.error);
    return;
  }

  console.log('✅ Connected successfully!');
  console.log(`📱 URI: ${connection.uri}`);

  // Wait for user to connect
  console.log('\n⏳ Waiting for user to connect...');
  let connected = false;
  const maxAttempts = 30; // 30 attempts * 2 seconds = 60 seconds
  let attempts = 0;

  while (!connected && attempts < maxAttempts) {
    connected = await sdk.isConnected(userId);
    if (!connected) {
      console.log(`⏳ Attempt ${attempts + 1}/${maxAttempts}...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;
    }
  }

  if (!connected) {
    console.log('⏰ Connection timed out!');
    await sdk.destroy();
    return;
  }

  console.log('✅ User connected!');

  // Initialize trading bot
  const bot = new DexTradingBot({
    userId,
    sdk,
    routerAddress: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D' as Address, // Uniswap V2 Router
    wethAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' as Address, // WETH
    usdcAddress: '0xA0b86a33E6441b8C4C8C0C8C0C8C0C8C0C8C0C8C' as Address, // USDC (example)
    slippageTolerance: 0.5, // 0.5%
    maxGasPrice: 50000000000n, // 50 gwei
    minTradeAmount: 1000000n // 1 USDC minimum
  });

  // Start trading bot
  await bot.start();

  // Run for 5 minutes
  console.log('\n⏰ Running bot for 5 minutes...');
  await new Promise(resolve => setTimeout(resolve, 5 * 60 * 1000));

  // Stop bot and show stats
  await bot.stop();
  
  const stats = await bot.getStats();
  console.log('\n📊 Final Statistics:');
  console.log(`  - Bot Running: ${stats.isRunning}`);
  console.log(`  - ETH Balance: ${stats.ethBalance} ETH`);
  console.log(`  - USDC Balance: ${stats.usdcBalance} USDC`);
  console.log(`  - Price History Points: ${stats.priceHistorySize.join(', ')}`);

  // Cleanup
  await sdk.disconnect(userId);
  await sdk.destroy();
  
  console.log('\n✅ DEX Trading Bot example completed!');
}

// Run the example
if (require.main === module) {
  runDexTradingBot().catch(console.error);
}

export { DexTradingBot, runDexTradingBot }; 