import React, { useState, useEffect } from 'react';
import { Select, Avatar, Typography, Spin } from 'antd';
import { getChains } from '../services/chainService';

const { Text } = Typography;
const { Option } = Select;

const ChainSelector = ({ onChainSelected, disabled }) => {
  const [chains, setChains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChainId, setSelectedChainId] = useState(null);

  // 加载链列表
  useEffect(() => {
    const loadChains = () => {
      try {
        setLoading(true);
        const chainsData = getChains();
        setChains(chainsData);
        setLoading(false);
      } catch (error) {
        console.error('加载链失败:', error);
        setLoading(false);
      }
    };

    loadChains();
  }, []);

  // 当选择链改变时
  const handleChainChange = (chainId) => {
    setSelectedChainId(chainId);
    const selectedChain = chains.find(chain => chain.id === chainId);
    onChainSelected(selectedChain);
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex justify-between items-center mb-2">
        <Text className="text-gray-700">选择链</Text>
        {loading && <Spin size="small" />}
      </div>
      
      <Select
        placeholder="选择一个区块链网络"
        style={{ width: '100%' }}
        onChange={handleChainChange}
        value={selectedChainId}
        disabled={disabled || loading}
        optionLabelProp="label"
        optionFilterProp="label"
      >
        {chains.map(chain => (
          <Option 
            key={chain.id} 
            value={chain.id} 
            label={chain.name}
          >
            <div className="flex items-center">
              <Avatar src={chain.logo} size={20} className="mr-2" />
              <span>{chain.name}</span>
              <span className="ml-2 text-gray-400">({chain.symbol})</span>
            </div>
          </Option>
        ))}
      </Select>
      
      {selectedChainId && (
        <div className="mt-2 text-sm text-gray-500">
          <div>RPC: {chains.find(c => c.id === selectedChainId)?.rpcUrl}</div>
          <div>Explorer: {chains.find(c => c.id === selectedChainId)?.explorerUrl}</div>
        </div>
      )}
    </div>
  );
};

export default ChainSelector; 