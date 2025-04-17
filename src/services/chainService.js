// 链配置
export const chains = [
  {
    id: 313313,
    name: 'Sahara Testnet',
    symbol: 'SAHARA',
    rpcUrl: 'https://testnet.saharalabs.ai',
    chainId: 313313,
    explorerUrl: 'https://testnet-explorer.saharalabs.ai',
    logo: 'https://i.imgur.com/7VL4Mdk.png',
    nativeToken: {
      symbol: 'SAHARA',
      name: 'Sahara',
      decimals: 18,
    },
    popularTokens: [],
  },
  {
    id: 1,
    name: 'Ethereum',
    symbol: 'ETH',
    rpcUrl: 'https://ethereum.publicnode.com',
    chainId: 1,
    explorerUrl: 'https://etherscan.io',
    logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
    nativeToken: {
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
    },
    popularTokens: [
      {
        address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        symbol: 'USDT',
        name: 'Tether USD',
        decimals: 6,
      },
      {
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
      },
      {
        address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        symbol: 'DAI',
        name: 'Dai Stablecoin',
        decimals: 18,
      },
    ],
  },
  {
    id: 56,
    name: 'BSC',
    symbol: 'BNB',
    rpcUrl: 'https://bsc-dataseed.binance.org',
    chainId: 56,
    explorerUrl: 'https://bscscan.com',
    logo: 'https://cryptologos.cc/logos/bnb-bnb-logo.png',
    nativeToken: {
      symbol: 'BNB',
      name: 'Binance Coin',
      decimals: 18,
    },
    popularTokens: [
      {
        address: '0x55d398326f99059fF775485246999027B3197955',
        symbol: 'USDT',
        name: 'Tether USD',
        decimals: 18,
      },
      {
        address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 18,
      },
      {
        address: '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3',
        symbol: 'DAI',
        name: 'Dai Stablecoin',
        decimals: 18,
      },
    ],
  },
  {
    id: 137,
    name: 'Polygon',
    symbol: 'MATIC',
    rpcUrl: 'https://polygon-rpc.com',
    chainId: 137,
    explorerUrl: 'https://polygonscan.com',
    logo: 'https://cryptologos.cc/logos/polygon-matic-logo.png',
    nativeToken: {
      symbol: 'MATIC',
      name: 'Polygon',
      decimals: 18,
    },
    popularTokens: [
      {
        address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
        symbol: 'USDT',
        name: 'Tether USD',
        decimals: 6,
      },
      {
        address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
      },
      {
        address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
        symbol: 'DAI',
        name: 'Dai Stablecoin',
        decimals: 18,
      },
    ],
  },
  {
    id: 43114,
    name: 'Avalanche',
    symbol: 'AVAX',
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    chainId: 43114,
    explorerUrl: 'https://snowtrace.io',
    logo: 'https://cryptologos.cc/logos/avalanche-avax-logo.png',
    nativeToken: {
      symbol: 'AVAX',
      name: 'Avalanche',
      decimals: 18,
    },
    popularTokens: [
      {
        address: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7',
        symbol: 'USDT',
        name: 'Tether USD',
        decimals: 6,
      },
      {
        address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
      },
      {
        address: '0xd586E7F844cEa2F87f50152665BCbc2C279D8d70',
        symbol: 'DAI',
        name: 'Dai Stablecoin',
        decimals: 18,
      },
    ],
  },
  
];

// 获取链列表
export const getChains = () => {
  return chains;
};

// 根据ID获取链信息
export const getChainById = (chainId) => {
  return chains.find(chain => chain.id === chainId);
};

// 验证Token地址是否合法
export const isValidTokenAddress = (address) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}; 