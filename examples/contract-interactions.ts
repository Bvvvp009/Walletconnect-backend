import { WalletConnectSDK } from '../src/core/WalletConnectSDK';
import { Address } from 'viem';

// Example ERC20 ABI (simplified)
const ERC20_ABI = [
  {
    "constant": false,
    "inputs": [
      {
        "name": "_to",
        "type": "address"
      },
      {
        "name": "_value",
        "type": "uint256"
      }
    ],
    "name": "transfer",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "_owner",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "name": "balance",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "name",
    "outputs": [
      {
        "name": "",
        "type": "string"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "symbol",
    "outputs": [
      {
        "name": "",
        "type": "string"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [
      {
        "name": "",
        "type": "uint8"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }
];

// Example NFT ABI (simplified)
const NFT_ABI = [
  {
    "constant": false,
    "inputs": [
      {
        "name": "to",
        "type": "address"
      },
      {
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "mint",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "ownerOf",
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }
];

async function demonstrateContractInteractions() {
  // Initialize SDK
  const sdk = new WalletConnectSDK({
    projectId: 'd135d60071032d4c35b867a5420a0d32' // Get from WalletConnect Cloud
  });

  await sdk.init();

  const userId = 'user123';
  const recipientAddress = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6' as Address;

  // 1. Connect user
  console.log('🔗 Connecting user...');
  const connection = await sdk.connect({
    userId,
    chainId: 1, // Ethereum mainnet
    methods: [
      'eth_sendTransaction',
      'eth_call',
      'eth_estimateGas',
      'eth_sign',
      'personal_sign'
    ]
  });

  if (!connection.success) {
    console.error('❌ Connection failed:', connection.error);
    return;
  }

  console.log('✅ Connected! QR Code:', connection.qrCode);
  console.log('📱 URI:', connection.uri);

  // Wait for user to scan and connect
  console.log('⏳ Waiting for user to connect...');
  await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds

  // 2. Check connection status
  const isConnected = await sdk.isConnected(userId);
  if (!isConnected) {
    console.error('❌ User not connected');
    return;
  }

  console.log('✅ User connected successfully!');

  // 3. Get user accounts
  const accounts = await sdk.getAccounts(userId);
  if (accounts.length === 0) {
    console.error('❌ No accounts found');
    return;
  }

  const userAddress = accounts[0];
  console.log('👤 User address:', userAddress);

  // 4. Check ETH balance
  const ethBalance = await sdk.getBalance(userId);
  console.log('💰 ETH Balance:', ethBalance.toString());

  // 5. Contract Configuration
  const usdcContract = {
    address: '0xA0b86a33E6441b8C4C8C0C8C0C8C0C8C0C8C0C8C' as Address, // Example USDC address
    abi: ERC20_ABI,
    chainId: 1
  };

  const nftContract = {
    address: '0xB0b86a33E6441b8C4C8C0C8C0C8C0C8C0C8C0C8C' as Address, // Example NFT address
    abi: NFT_ABI,
    chainId: 1
  };

  // 6. Function Encoding Examples
  console.log('\n🔧 Function Encoding Examples:');

  // Encode ERC20 transfer function
  const transferEncoded = await sdk.encodeFunction({
    contract: usdcContract,
    functionName: 'transfer',
    args: [recipientAddress, 1000000n] // 1 USDC (6 decimals)
  });

  if (transferEncoded.success) {
    console.log('📤 Transfer encoded:', transferEncoded.data);
  }

  // Encode balanceOf function
  const balanceEncoded = await sdk.encodeFunction({
    contract: usdcContract,
    functionName: 'balanceOf',
    args: [userAddress]
  });

  if (balanceEncoded.success) {
    console.log('💰 Balance encoded:', balanceEncoded.data);
  }

  // Encode NFT mint function
  const mintEncoded = await sdk.encodeFunction({
    contract: nftContract,
    functionName: 'mint',
    args: [userAddress, 123n] // Token ID 123
  });

  if (mintEncoded.success) {
    console.log('🎨 Mint encoded:', mintEncoded.data);
  }

  // 7. Contract Read Examples
  console.log('\n📖 Contract Read Examples:');

  // Read ERC20 balance
  const balanceRead = await sdk.readContract({
    userId,
    contract: usdcContract,
    functionName: 'balanceOf',
    args: [userAddress]
  });

  if (balanceRead.success) {
    console.log('💰 USDC Balance:', balanceRead.data);
  }

  // Read ERC20 name
  const nameRead = await sdk.readContract({
    userId,
    contract: usdcContract,
    functionName: 'name',
    args: []
  });

  if (nameRead.success) {
    console.log('📝 Token Name:', nameRead.data);
  }

  // Read NFT owner
  const ownerRead = await sdk.readContract({
    userId,
    contract: nftContract,
    functionName: 'ownerOf',
    args: [123n]
  });

  if (ownerRead.success) {
    console.log('👑 NFT Owner:', ownerRead.data);
  }

  // 8. Gas Estimation Examples
  console.log('\n⛽ Gas Estimation Examples:');

  // Estimate gas for ERC20 transfer
  const transferGasEstimate = await sdk.estimateGas({
    userId,
    contract: usdcContract,
    functionName: 'transfer',
    args: [recipientAddress, 1000000n]
  });

  if (transferGasEstimate.success) {
    console.log('⛽ Transfer gas estimate:', transferGasEstimate.gas?.toString());
  }

  // Estimate gas for NFT mint
  const mintGasEstimate = await sdk.estimateGas({
    userId,
    contract: nftContract,
    functionName: 'mint',
    args: [userAddress, 123n]
  });

  if (mintGasEstimate.success) {
    console.log('⛽ Mint gas estimate:', mintGasEstimate.gas?.toString());
  }

  // 9. Contract Call Examples (Write Operations)
  console.log('\n✍️ Contract Call Examples:');

  // Call ERC20 transfer (this will prompt user for approval)
  console.log('📤 Initiating USDC transfer...');
  const transferCall = await sdk.callContract({
    userId,
    contract: usdcContract,
    functionName: 'transfer',
    args: [recipientAddress, 1000000n], // 1 USDC
    gas: transferGasEstimate.success ? transferGasEstimate.gas : undefined
  });

  if (transferCall.success) {
    console.log('✅ Transfer transaction hash:', transferCall.hash);
  } else {
    console.log('❌ Transfer failed:', transferCall.error);
  }

  // Call NFT mint (this will prompt user for approval)
  console.log('🎨 Initiating NFT mint...');
  const mintCall = await sdk.callContract({
    userId,
    contract: nftContract,
    functionName: 'mint',
    args: [userAddress, 123n], // Token ID 123
    gas: mintGasEstimate.success ? mintGasEstimate.gas : undefined
  });

  if (mintCall.success) {
    console.log('✅ Mint transaction hash:', mintCall.hash);
  } else {
    console.log('❌ Mint failed:', mintCall.error);
  }

  // 10. Function Decoding Examples
  console.log('\n🔍 Function Decoding Examples:');

  // Decode a transfer function call
  if (transferEncoded.success) {
    const transferDecoded = await sdk.decodeFunction({
      contract: usdcContract,
      functionName: 'transfer',
      data: transferEncoded.data!
    });

    if (transferDecoded.success) {
      console.log('🔍 Decoded transfer args:', transferDecoded.args);
    }
  }

  // 11. Event Handling
  console.log('\n📡 Setting up event listeners...');

  sdk.on('transaction_response', (event) => {
    if (event.data?.success) {
      console.log('✅ Transaction successful:', event.data.hash);
      console.log('📋 Function:', event.data.functionName);
      console.log('🏗️ Contract:', event.data.contractAddress);
    } else {
      console.log('❌ Transaction failed:', event.data?.error);
    }
  });

  sdk.on('session_connect', (event) => {
    console.log('🔗 Session connected:', event.userId);
  });

  sdk.on('session_disconnect', (event) => {
    console.log('🔌 Session disconnected:', event.userId);
  });

  // 12. Advanced Contract Interactions
  console.log('\n🚀 Advanced Contract Interactions:');

  // Batch multiple operations
  const operations = [
    {
      contract: usdcContract,
      functionName: 'balanceOf',
      args: [userAddress]
    },
    {
      contract: usdcContract,
      functionName: 'name',
      args: []
    },
    {
      contract: usdcContract,
      functionName: 'symbol',
      args: []
    }
  ];

  console.log('📦 Batch reading contract data...');
  for (const op of operations) {
    const result = await sdk.readContract({
      userId,
      contract: op.contract,
      functionName: op.functionName,
      args: op.args
    });

    if (result.success) {
      console.log(`✅ ${op.functionName}:`, result.data);
    } else {
      console.log(`❌ ${op.functionName}:`, result.error);
    }
  }

  // 13. Cleanup
  console.log('\n🧹 Cleaning up...');
  
  // Wait a bit to see any pending events
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Disconnect user
  const disconnected = await sdk.disconnect(userId);
  if (disconnected) {
    console.log('✅ User disconnected successfully');
  }

  // Destroy SDK
  await sdk.destroy();
  console.log('✅ SDK destroyed');
}

// Error handling wrapper
async function main() {
  try {
    await demonstrateContractInteractions();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the example
if (require.main === module) {
  main();
}

export { demonstrateContractInteractions }; 