// 格式化钱包地址，显示前几位和后几位
export const formatWalletAddress = (address) => {
  if (!address) return '';
  if (address.startsWith('0x')) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

// 格式化数字，保留指定位数小数
export const formatNumber = (num, decimals = 4) => {
  if (num === undefined || num === null) return '';
  
  const parsedNum = parseFloat(num);
  if (isNaN(parsedNum)) return '0';
  
  // 根据数字大小决定是否使用科学计数法
  if (parsedNum < 0.00001 && parsedNum > 0) {
    return parsedNum.toExponential(decimals);
  }
  
  return parsedNum.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
};

// 格式化交易哈希
export const formatTxHash = (hash) => {
  if (!hash) return '';
  return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
};

// 生成日志唯一ID
export const generateLogId = () => {
  return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// 格式化时间戳
export const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  
  return `${hours}:${minutes}:${seconds}`;
}; 