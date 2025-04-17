import React, { useState, useRef } from 'react';
import { Layout, Typography, Card, Space, Divider } from 'antd';
import ChainSelector from './components/ChainSelector';
import TokenConfig from './components/TokenConfig';
import PrivateKeyInput from './components/PrivateKeyInput';
import TransferSettings from './components/TransferSettings';
import TransactionLogs from './components/TransactionLogs';
import ControlPanel from './components/ControlPanel';
import { generateLogId } from './utils/formatters';
import { startTransferTasks } from './services/transferService';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

const App = () => {
  // 全局状态
  const [selectedChain, setSelectedChain] = useState(null);
  const [selectedToken, setSelectedToken] = useState(null);
  const [privateKeys, setPrivateKeys] = useState([]);
  const [transferSettings, setTransferSettings] = useState({
    minDelay: 10,
    maxDelay: 3600,
    gasPrice: 'auto',
  });
  const [logs, setLogs] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const runningRef = useRef(false);

  // 处理转账操作
  const handleStartTransfer = async () => {
    if (!selectedChain || !selectedToken || privateKeys.length === 0) {
      addLog('转账条件不满足，请检查配置', 'error');
      return;
    }
    
    setIsRunning(true);
    runningRef.current = true;
    
    addLog('开始执行转账操作', 'info');
    
    try {
      // 启动转账任务
      await startTransferTasks(
        selectedChain,
        selectedToken,
        privateKeys,
        transferSettings,
        addLog,
        () => runningRef.current
      );
    } catch (error) {
      addLog(`转账过程中发生错误: ${error.message}`, 'error');
    } finally {
      // 如果任务完成但状态还是运行中，则停止
      if (runningRef.current) {
        handleStopTransfer();
      }
    }
  };

  // 处理停止转账
  const handleStopTransfer = () => {
    runningRef.current = false;
    setIsRunning(false);
    addLog('转账操作已停止', 'warning');
  };

  // 添加日志
  const addLog = (message, type = 'info') => {
    const newLog = {
      id: generateLogId(),
      time: new Date().toLocaleTimeString(),
      message,
      type,
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // 处理从私钥输入获取的私钥
  const handlePrivateKeysChanged = (keys) => {
    setPrivateKeys(keys);
  };

  // 添加清除日志功能
  const clearLogs = () => {
    setLogs([]);
  };

  // 渲染日志组件
  const renderLogs = () => {
    return (
      <Card title="操作日志" className="mb-4" bodyStyle={{ padding: '12px' }}>
        <TransactionLogs logs={logs} onClear={clearLogs} />
      </Card>
    );
  };

  return (
    <Layout className="min-h-screen">
      <Header className="flex items-center bg-white shadow-md">
        <Title level={3} className="text-black m-0">Token自转工具</Title>
      </Header>
      
      <Content className="px-8 py-6">
        <Space direction="vertical" size="large" className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="链选择" bordered={false}>
              <ChainSelector 
                onChainSelected={setSelectedChain} 
                disabled={isRunning}
              />
            </Card>
            
            <Card title="Token配置" bordered={false}>
              <TokenConfig 
                selectedChain={selectedChain}
                onTokenSelected={setSelectedToken}
                disabled={isRunning || !selectedChain}
              />
            </Card>
          </div>
          
          <Card title="私钥输入" bordered={false}>
            <PrivateKeyInput 
              onKeysChanged={handlePrivateKeysChanged}
              disabled={isRunning}
            />
            
            <div className="mt-4 text-right text-sm">
              <Text type={privateKeys.length > 0 ? 'success' : 'secondary'}>
                已加载私钥数量: {privateKeys.length}
              </Text>
            </div>
          </Card>
          
          <Card title="转账设置" bordered={false}>
            <TransferSettings 
              settings={transferSettings}
              onSettingsChanged={setTransferSettings}
              disabled={isRunning}
            />
          </Card>
          
          <Card title="控制面板" bordered={false}>
            <ControlPanel 
              isRunning={isRunning}
              onStart={handleStartTransfer}
              onStop={handleStopTransfer}
              disabled={!selectedChain || !selectedToken || privateKeys.length === 0}
            />
          </Card>
          
          {renderLogs()}
        </Space>
      </Content>
      
      <Footer className="text-center">Token自转工具 ©{new Date().getFullYear()}</Footer>
    </Layout>
  );
};

export default App; 