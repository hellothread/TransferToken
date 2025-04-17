import Web3 from 'web3';
import { formatWalletAddress } from '../utils/formatters';

// ABI for ERC20 Token
const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { name: '_to', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function',
  },
];

// 连接到指定链
export const connectToChain = (rpcUrl) => {
  return new Web3(new Web3.providers.HttpProvider(rpcUrl));
};

// 获取原生代币余额
export const getNativeBalance = async (web3, address) => {
  try {
    const balance = await web3.eth.getBalance(address);
    return web3.utils.fromWei(balance, 'ether');
  } catch (error) {
    console.error('获取余额失败:', error);
    throw error;
  }
};

// 获取ERC20代币余额
export const getTokenBalance = async (web3, tokenAddress, walletAddress) => {
  try {
    const tokenContract = new web3.eth.Contract(ERC20_ABI, tokenAddress);
    
    // 获取代币精度
    const decimals = await tokenContract.methods.decimals().call();
    
    // 获取代币符号
    const symbol = await tokenContract.methods.symbol().call();
    
    // 获取代币余额
    const balance = await tokenContract.methods.balanceOf(walletAddress).call();
    
    // 根据精度转换余额
    const formattedBalance = balance / Math.pow(10, decimals);
    
    return {
      balance: formattedBalance,
      symbol,
      decimals
    };
  } catch (error) {
    console.error('获取代币余额失败:', error);
    throw error;
  }
};

// 执行原生代币转账
export const transferNativeToken = async (web3, privateKey, transferSettings, addLog) => {
  try {
    // 从私钥获取账户信息
    const account = web3.eth.accounts.privateKeyToAccount(privateKey);
    const walletAddress = account.address;
    const shortWalletAddress = formatWalletAddress(walletAddress);
    
    // 获取余额
    const balance = await web3.eth.getBalance(walletAddress);
    addLog(`[${shortWalletAddress}] 余额: ${web3.utils.fromWei(balance, 'ether')}`, 'info');
    
    if (balance === '0') {
      addLog(`[${shortWalletAddress}] 余额为零，跳过交易`, 'warning');
      return;
    }
    
    // 获取当前Gas价格
    let gasPrice;
    if (transferSettings.gasPrice === 'auto') {
      gasPrice = await web3.eth.getGasPrice();
      // 随机增加一点gas以避免相同模式
      const gasVariation = 1 + (Math.random() * 0.1); // 增加0-10%
      gasPrice = Math.floor(Number(gasPrice) * gasVariation);
    } else {
      gasPrice = web3.utils.toWei(transferSettings.gasPrice, 'gwei');
    }
    
    // 获取nonce
    const nonce = await web3.eth.getTransactionCount(walletAddress);
    
    // 计算最大可用金额
    const gasLimit = 21000; // 原生代币转账标准gas
    const maxAmount = balance - (gasLimit * gasPrice);
    
    if (maxAmount <= 0) {
      addLog(`[${shortWalletAddress}] 余额不足支付交易费，跳过交易`, 'warning');
      return;
    }
    
    // 随机生成转账金额
    const txValue = Math.floor(Math.random() * maxAmount);
    
    // 构造交易
    const txObject = {
      to: walletAddress, // 自转
      value: txValue.toString(),
      gas: gasLimit,
      gasPrice: gasPrice.toString(),
      nonce: nonce,
      chainId: transferSettings.chainId
    };
    
    addLog(`[${shortWalletAddress}] 准备发送交易`, 'info');
    
    // 签名交易
    const signedTx = await web3.eth.accounts.signTransaction(txObject, privateKey);
    
    // 发送交易
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    
    addLog(`[${shortWalletAddress}] 交易已确认，哈希: ${receipt.transactionHash}`, 'success');
    addLog(`[${shortWalletAddress}] 交易详情: ${transferSettings.explorerUrl}/tx/${receipt.transactionHash}`, 'info');
    
    return receipt;
  } catch (error) {
    addLog(`转账失败: ${error.message}`, 'error');
    console.error('转账失败:', error);
    throw error;
  }
};

// 执行ERC20代币转账
export const transferERC20Token = async (web3, tokenAddress, privateKey, transferSettings, addLog) => {
  try {
    // 从私钥获取账户信息
    const account = web3.eth.accounts.privateKeyToAccount(privateKey);
    const walletAddress = account.address;
    const shortWalletAddress = formatWalletAddress(walletAddress);
    
    // 创建代币合约实例
    const tokenContract = new web3.eth.Contract(ERC20_ABI, tokenAddress);
    
    // 获取代币信息和余额
    const decimals = await tokenContract.methods.decimals().call();
    const symbol = await tokenContract.methods.symbol().call();
    const balance = await tokenContract.methods.balanceOf(walletAddress).call();
    
    addLog(`[${shortWalletAddress}] ${symbol}余额: ${balance / Math.pow(10, decimals)}`, 'info');
    
    if (balance === '0') {
      addLog(`[${shortWalletAddress}] 余额为零，跳过交易`, 'warning');
      return;
    }
    
    // 获取当前Gas价格
    let gasPrice;
    if (transferSettings.gasPrice === 'auto') {
      gasPrice = await web3.eth.getGasPrice();
      // 随机增加一点gas以避免相同模式
      const gasVariation = 1 + (Math.random() * 0.1); // 增加0-10%
      gasPrice = Math.floor(Number(gasPrice) * gasVariation);
    } else {
      gasPrice = web3.utils.toWei(transferSettings.gasPrice, 'gwei');
    }
    
    // 获取nonce
    const nonce = await web3.eth.getTransactionCount(walletAddress);
    
    // 随机生成转账金额 (以代币最小单位)
    const maxAmount = BigInt(balance);
    const randomPercentage = Math.random() * 0.9; // 最多用90%的余额
    const txAmount = (BigInt(Math.floor(Number(maxAmount) * randomPercentage))).toString();
    
    // 构造代币转账数据
    const transferData = tokenContract.methods.transfer(walletAddress, txAmount).encodeABI();
    
    // 估算gas用量
    const gasLimit = await web3.eth.estimateGas({
      from: walletAddress,
      to: tokenAddress,
      data: transferData
    });
    
    // 检查原生代币余额是否足够支付gas
    const ethBalance = await web3.eth.getBalance(walletAddress);
    const gasCost = BigInt(gasLimit) * BigInt(gasPrice);
    
    if (BigInt(ethBalance) < gasCost) {
      addLog(`[${shortWalletAddress}] 原生代币不足支付交易费，跳过交易`, 'warning');
      return;
    }
    
    // 构造交易
    const txObject = {
      from: walletAddress,
      to: tokenAddress,
      gas: Math.floor(gasLimit * 1.2), // 增加20%的gas以防止gas不足
      gasPrice: gasPrice.toString(),
      data: transferData,
      nonce: nonce,
      chainId: transferSettings.chainId
    };
    
    addLog(`[${shortWalletAddress}] 准备发送${symbol}交易`, 'info');
    
    // 签名交易
    const signedTx = await web3.eth.accounts.signTransaction(txObject, privateKey);
    
    // 发送交易
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    
    addLog(`[${shortWalletAddress}] 交易已确认，哈希: ${receipt.transactionHash}`, 'success');
    addLog(`[${shortWalletAddress}] 交易详情: ${transferSettings.explorerUrl}/tx/${receipt.transactionHash}`, 'info');
    
    return receipt;
  } catch (error) {
    addLog(`转账失败: ${error.message}`, 'error');
    console.error('转账失败:', error);
    throw error;
  }
};

// 验证私钥格式是否正确
export const isValidPrivateKey = (privateKey) => {
  try {
    if (!privateKey.startsWith('0x')) {
      privateKey = '0x' + privateKey;
    }
    // 验证私钥长度
    if (privateKey.length !== 66) {
      return false;
    }
    // 验证是否为有效的十六进制
    if (!/^0x[0-9a-fA-F]{64}$/.test(privateKey)) {
      return false;
    }
    // 尝试从私钥生成地址
    const web3 = new Web3();
    web3.eth.accounts.privateKeyToAccount(privateKey);
    return true;
  } catch (error) {
    return false;
  }
};

// 验证助记词格式是否正确
export const isValidMnemonic = (mnemonic) => {
  try {
    return bip39.validateMnemonic(mnemonic.trim());
  } catch (error) {
    return false;
  }
};

// 从助记词派生私钥(默认派生第一个账户)
export const derivePrivateKeyFromMnemonic = (mnemonic, path = "m/44'/60'/0'/0/0") => {
  try {
    const seed = bip39.mnemonicToSeedSync(mnemonic.trim());
    const hdWallet = hdkey.fromMasterSeed(seed);
    const childWallet = hdWallet.derive(path);
    
    // 获取私钥并确保有0x前缀
    const privateKeyBuffer = childWallet.privateKey;
    const privateKeyHex = privateKeyBuffer.toString('hex');
    const privateKey = '0x' + privateKeyHex;
    
    return privateKey;
  } catch (error) {
    console.error('从助记词派生私钥失败:', error);
    throw error;
  }
};

// 从助记词生成多个私钥
export const deriveMultipleKeysFromMnemonic = (mnemonic, count = 1) => {
  const privateKeys = [];
  
  try {
    for (let i = 0; i < count; i++) {
      const path = `m/44'/60'/0'/0/${i}`;
      const privateKey = derivePrivateKeyFromMnemonic(mnemonic, path);
      privateKeys.push(privateKey);
    }
    
    return privateKeys;
  } catch (error) {
    console.error('生成多个私钥失败:', error);
    throw error;
  }
}; 