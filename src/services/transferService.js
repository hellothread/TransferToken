import Web3 from 'web3';
import { connectToChain, transferNativeToken, transferERC20Token } from './web3Service';

// 延迟工具函数
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 随机延迟函数
const randomSleep = async (minDelay, maxDelay) => {
  const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
  return sleep(delay * 1000); // 转换为毫秒
};

// 启动转账任务
export const startTransferTasks = async (
  chain, 
  token, 
  privateKeys, 
  transferSettings, 
  addLog,
  isRunning
) => {
  // 连接到区块链网络
  const web3 = connectToChain(chain.rpcUrl);
  
  if (!web3) {
    addLog(`连接${chain.name}网络失败`, 'error');
    return;
  }
  
  addLog(`成功连接到${chain.name}网络`, 'success');
  
  // 配置转账设置
  const settings = {
    ...transferSettings,
    chainId: chain.chainId,
    explorerUrl: chain.explorerUrl,
  };

  // 创建转账任务
  const tasks = [];
  
  for (const privateKey of privateKeys) {
    // 闭包以保存每个私钥的上下文
    const task = async () => {
      try {
        // 随机等待一段时间
        const waitTime = Math.floor(Math.random() * (settings.maxDelay - settings.minDelay + 1)) + settings.minDelay;
        addLog(`等待 ${waitTime} 秒后执行...`, 'info');
        await sleep(waitTime * 1000);
        
        // 检查是否已停止运行
        if (!isRunning()) {
          return;
        }
        
        // 执行转账
        if (token.type === 'native') {
          await transferNativeToken(web3, privateKey, settings, addLog);
        } else {
          await transferERC20Token(web3, token.address, privateKey, settings, addLog);
        }
      } catch (error) {
        addLog(`执行转账任务时出错: ${error.message}`, 'error');
        console.error('转账任务执行错误:', error);
      }
    };
    
    tasks.push(task());
  }
  
  // 并行执行所有任务
  try {
    await Promise.all(tasks);
    addLog('所有转账任务已完成', 'success');
  } catch (error) {
    addLog(`任务执行过程中发生错误: ${error.message}`, 'error');
    console.error('批量任务执行错误:', error);
  }
}; 