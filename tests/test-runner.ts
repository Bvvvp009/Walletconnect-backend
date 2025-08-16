#!/usr/bin/env ts-node

import { WalletConnectSDK } from '../src/core/WalletConnectSDK';
import dotenv from 'dotenv';
import chalk from 'chalk';

// Load environment variables
dotenv.config();

interface TestResult {
  name: string;
  success: boolean;
  duration: number;
  error?: string;
  details?: any;
}

interface TestSuite {
  name: string;
  tests: (() => Promise<TestResult>)[];
}

class TestRunner {
  private sdk: WalletConnectSDK;
  private testResults: TestResult[] = [];
  private startTime: number = 0;

  constructor() {
    const TEST_PROJECT_ID = process.env.WALLETCONNECT_PROJECT_ID;
    
    if (!TEST_PROJECT_ID || TEST_PROJECT_ID === 'YOUR_PROJECT_ID') {
      console.error(chalk.red('❌ Error: WALLETCONNECT_PROJECT_ID not set in environment variables'));
      console.error(chalk.yellow('Please set your WalletConnect Project ID in .env file'));
      process.exit(1);
    }

    this.sdk = new WalletConnectSDK({
      projectId: TEST_PROJECT_ID,
      timeouts: {
        connection: 120000, // 2 minutes
        transaction: 180000, // 3 minutes
        signing: 60000, // 1 minute
        contractCall: 120000, // 2 minutes
        contractRead: 30000, // 30 seconds
        gasEstimation: 30000 // 30 seconds
      }
    });
  }

  async init() {
    console.log(chalk.blue('🧪 Initializing WalletConnect SDK for testing...'));
    await this.sdk.init();
    console.log(chalk.green('✅ SDK initialized successfully'));
  }

  async cleanup() {
    console.log(chalk.blue('🧹 Cleaning up test environment...'));
    await this.sdk.destroy();
    console.log(chalk.green('✅ Test cleanup completed'));
  }

  async runTest(testFn: () => Promise<TestResult>): Promise<TestResult> {
    const startTime = Date.now();
    try {
      const result = await testFn();
      result.duration = Date.now() - startTime;
      return result;
    } catch (error) {
      return {
        name: 'Unknown Test',
        success: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async runTestSuite(suite: TestSuite): Promise<void> {
    console.log(chalk.cyan(`\n📋 Running Test Suite: ${suite.name}`));
    console.log(chalk.gray('=' .repeat(50)));

    const suiteStartTime = Date.now();
    let passed = 0;
    let failed = 0;

    for (const test of suite.tests) {
      const result = await this.runTest(test);
      this.testResults.push(result);

      if (result.success) {
        console.log(chalk.green(`✅ ${result.name} (${result.duration}ms)`));
        passed++;
      } else {
        console.log(chalk.red(`❌ ${result.name} (${result.duration}ms)`));
        console.log(chalk.red(`   Error: ${result.error}`));
        failed++;
      }

      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const suiteDuration = Date.now() - suiteStartTime;
    console.log(chalk.gray('=' .repeat(50)));
    console.log(chalk.cyan(`📊 Suite Results: ${passed} passed, ${failed} failed (${suiteDuration}ms)`));
  }

  async runAllTests(): Promise<void> {
    this.startTime = Date.now();
    
    console.log(chalk.bold.blue('🚀 WalletConnect Backend SDK - Comprehensive Test Suite'));
    console.log(chalk.gray('=' .repeat(60)));
    console.log(chalk.yellow('📋 Test Configuration:'));
    console.log(chalk.yellow(`  - Project ID: ${process.env.WALLETCONNECT_PROJECT_ID}`));
    console.log(chalk.yellow(`  - Test User ID: test-user-${Date.now()}`));
    console.log(chalk.yellow(`  - Storage Contract: 0xab501890DAb0Bf3ab9A019cC00FB3Dd21298E1Fd`));
    console.log(chalk.yellow(`  - Chain ID: 84532 (Base Sepolia)`));
    console.log(chalk.gray('=' .repeat(60)));

    const testSuites: TestSuite[] = [
      {
        name: 'Core Functionality Tests',
        tests: [
          // 1. Wallet Connection Tests
          async (): Promise<TestResult> => {
            const userId = 'test-user-' + Date.now();
            const connection = await this.sdk.connect({
              userId,
              chainId: 84532,
              methods: ['eth_sendTransaction', 'eth_sign', 'personal_sign']
            });

            if (!connection.success) {
              return {
                name: 'Wallet Connection Creation',
                success: false,
                duration: 0,
                error: connection.error
              };
            }

            return {
              name: 'Wallet Connection Creation',
              success: true,
              duration: 0,
              details: {
                uri: connection.uri,
                deepLinks: connection.deepLinks?.length || 0,
                timeout: connection.timeout
              }
            };
          },

          // 2. QR Code Generation
          async (): Promise<TestResult> => {
            const userId = 'qr-test-' + Date.now();
            const connection = await this.sdk.connect({
              userId,
              chainId: 84532,
              methods: ['eth_sendTransaction']
            });

            if (!connection.success || !connection.qrCode) {
              return {
                name: 'QR Code Generation',
                success: false,
                duration: 0,
                error: 'Failed to generate QR code'
              };
            }

            return {
              name: 'QR Code Generation',
              success: true,
              duration: 0,
              details: {
                qrCodeLength: connection.qrCode.length,
                qrCode: connection.qrCode // For manual scanning
              }
            };
          },

          // 3. Deep Links Generation
          async (): Promise<TestResult> => {
            const userId = 'deep-links-test-' + Date.now();
            const connection = await this.sdk.connect({
              userId,
              chainId: 84532,
              methods: ['eth_sendTransaction']
            });

            if (!connection.success || !connection.deepLinks) {
              return {
                name: 'Deep Links Generation',
                success: false,
                duration: 0,
                error: 'Failed to generate deep links'
              };
            }

            const walletCount = connection.deepLinks.length;
            const popularWallets = ['metamask', 'trustwallet', 'coinbasewallet'];
            const hasPopularWallets = popularWallets.every(wallet => 
              connection.deepLinks!.some(dl => dl.wallet === wallet)
            );

            return {
              name: 'Deep Links Generation',
              success: walletCount >= 15 && hasPopularWallets,
              duration: 0,
              details: {
                walletCount,
                hasPopularWallets,
                deepLinks: connection.deepLinks
              }
            };
          }
        ]
      },
      {
        name: 'Contract Interaction Tests',
        tests: [
          // 4. Contract Read Test
          async (): Promise<TestResult> => {
            const storageContract = {
              address: '0xab501890DAb0Bf3ab9A019cC00FB3Dd21298E1Fd' as any,
              chainId: 84532,
              abi: [
                {
                  "inputs": [],
                  "name": "retrieve",
                  "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                  "stateMutability": "view",
                  "type": "function"
                }
              ]
            };

            try {
              const result = await this.sdk.readContract({
                userId: 'contract-test-' + Date.now(),
                contract: storageContract,
                functionName: 'retrieve',
                args: []
              });

              return {
                name: 'Contract Read Operation',
                success: result.success,
                duration: 0,
                details: result.success ? { data: result.data } : { error: result.error }
              };
            } catch (error) {
              return {
                name: 'Contract Read Operation',
                success: false,
                duration: 0,
                error: error instanceof Error ? error.message : 'Unknown error'
              };
            }
          },

          // 5. Gas Estimation Test
          async (): Promise<TestResult> => {
            const storageContract = {
              address: '0xab501890DAb0Bf3ab9A019cC00FB3Dd21298E1Fd' as any,
              chainId: 84532,
              abi: [
                {
                  "inputs": [{"internalType": "uint256", "name": "num", "type": "uint256"}],
                  "name": "store",
                  "outputs": [],
                  "stateMutability": "nonpayable",
                  "type": "function"
                }
              ]
            };

            try {
              const result = await this.sdk.estimateGas({
                userId: 'gas-test-' + Date.now(),
                contract: storageContract,
                functionName: 'store',
                args: [42]
              });

                           return {
               name: 'Gas Estimation',
               success: Boolean(result.success && result.gas && Number(result.gas) > 0),
               duration: 0,
               details: result.success ? { gas: result.gas?.toString() } : { error: result.error }
             };
            } catch (error) {
              return {
                name: 'Gas Estimation',
                success: false,
                duration: 0,
                error: error instanceof Error ? error.message : 'Unknown error'
              };
            }
          }
        ]
      },
      {
        name: 'Multi-Chain Support Tests',
        tests: [
          // 6. Ethereum Mainnet Test
          async (): Promise<TestResult> => {
            const connection = await this.sdk.connect({
              userId: 'eth-mainnet-' + Date.now(),
              chainId: 1,
              methods: ['eth_sendTransaction']
            });

            return {
              name: 'Ethereum Mainnet Support',
              success: connection.success,
              duration: 0,
              details: { uri: connection.uri }
            };
          },

          // 7. Polygon Test
          async (): Promise<TestResult> => {
            const connection = await this.sdk.connect({
              userId: 'polygon-' + Date.now(),
              chainId: 137,
              methods: ['eth_sendTransaction']
            });

            return {
              name: 'Polygon Support',
              success: connection.success,
              duration: 0,
              details: { uri: connection.uri }
            };
          },

          // 8. Base Sepolia Test
          async (): Promise<TestResult> => {
            const connection = await this.sdk.connect({
              userId: 'base-sepolia-' + Date.now(),
              chainId: 84532,
              methods: ['eth_sendTransaction']
            });

            return {
              name: 'Base Sepolia Support',
              success: connection.success,
              duration: 0,
              details: { uri: connection.uri }
            };
          }
        ]
      },
      {
        name: 'Wallet Registry Tests',
        tests: [
          // 9. Get All Wallets
          async (): Promise<TestResult> => {
            const wallets = await this.sdk.getSupportedWallets();
            
            return {
              name: 'Wallet Registry - All Wallets',
              success: wallets.length >= 20,
              duration: 0,
              details: { walletCount: wallets.length }
            };
          },

          // 10. Get Recommended Wallets
          async (): Promise<TestResult> => {
            const wallets = await this.sdk.getRecommendedWallets('eip155:1');
            
            return {
              name: 'Wallet Registry - Recommended Wallets',
              success: wallets.length > 0,
              duration: 0,
              details: { recommendedCount: wallets.length }
            };
          },

          // 11. Get Specific Wallet Info
          async (): Promise<TestResult> => {
            const wallet = await this.sdk.getWalletInfo('metamask');
            
            return {
              name: 'Wallet Registry - Specific Wallet Info',
              success: wallet !== undefined && wallet.name === 'MetaMask',
              duration: 0,
              details: wallet ? { name: wallet.name, description: wallet.description } : null
            };
          }
        ]
      },
      {
        name: 'Timeout Management Tests',
        tests: [
          // 12. Get Timeout Config
          async (): Promise<TestResult> => {
            const timeouts = await this.sdk.getTimeoutConfig();
            
            return {
              name: 'Timeout Management - Get Config',
              success: timeouts && timeouts.connection > 0,
              duration: 0,
              details: timeouts
            };
          },

          // 13. Update Timeout Config
          async (): Promise<TestResult> => {
            const originalTimeouts = await this.sdk.getTimeoutConfig();
            
            await this.sdk.updateTimeoutConfig({
              connection: 90000,
              transaction: 180000
            });
            
            const updatedTimeouts = await this.sdk.getTimeoutConfig();
            
            // Restore original
            await this.sdk.updateTimeoutConfig({
              connection: originalTimeouts.connection,
              transaction: originalTimeouts.transaction
            });
            
            return {
              name: 'Timeout Management - Update Config',
              success: updatedTimeouts.connection === 90000 && updatedTimeouts.transaction === 180000,
              duration: 0,
              details: { updated: updatedTimeouts }
            };
          }
        ]
      }
    ];

    for (const suite of testSuites) {
      await this.runTestSuite(suite);
    }

    this.printFinalReport();
  }

  private printFinalReport(): void {
    const totalDuration = Date.now() - this.startTime;
    const passed = this.testResults.filter(r => r.success).length;
    const failed = this.testResults.filter(r => !r.success).length;
    const total = this.testResults.length;

    console.log(chalk.bold.blue('\n📊 Final Test Report'));
    console.log(chalk.gray('=' .repeat(60)));
    console.log(chalk.green(`✅ Passed: ${passed}`));
    console.log(chalk.red(`❌ Failed: ${failed}`));
    console.log(chalk.blue(`📈 Total: ${total}`));
    console.log(chalk.yellow(`⏱️ Duration: ${totalDuration}ms`));
    console.log(chalk.cyan(`📊 Success Rate: ${((passed / total) * 100).toFixed(1)}%`));

    if (failed > 0) {
      console.log(chalk.red('\n❌ Failed Tests:'));
      this.testResults
        .filter(r => !r.success)
        .forEach(result => {
          console.log(chalk.red(`  - ${result.name}: ${result.error}`));
        });
    }

    console.log(chalk.gray('=' .repeat(60)));
    
    if (failed === 0) {
      console.log(chalk.bold.green('🎉 All tests passed successfully!'));
    } else {
      console.log(chalk.bold.red(`⚠️ ${failed} test(s) failed. Please review the errors above.`));
    }
  }
}

// Main execution
async function main() {
  const runner = new TestRunner();
  
  try {
    await runner.init();
    await runner.runAllTests();
  } catch (error) {
    console.error(chalk.red('❌ Test runner failed:'), error);
    process.exit(1);
  } finally {
    await runner.cleanup();
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { TestRunner }; 