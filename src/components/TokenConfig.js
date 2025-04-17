import React, { useState, useEffect } from 'react';
import { Select, Input, Typography, Divider, Alert, Space } from 'antd';
import { isValidTokenAddress } from '../services/chainService';

const { Option } = Select;
const { Text } = Typography;

const TokenConfig = ({ selectedChain, onTokenSelected, disabled }) => {
  const [tokenType, setTokenType] = useState('native'); // 'native' 或 'custom'
  const [customTokenAddress, setCustomTokenAddress] = useState('');
  const [addressError, setAddressError] = useState('');
  const [selectedPopularToken, setSelectedPopularToken] = useState(null);

  // 当链改变时重置状态
  useEffect(() => {
    if (selectedChain) {
      setTokenType('native');
      setCustomTokenAddress('');
      setAddressError('');
      setSelectedPopularToken(null);
      
      // 默认选择原生代币
      onTokenSelected({
        type: 'native',
        ...selectedChain.nativeToken,
      });
    } else {
      onTokenSelected(null);
    }
  }, [selectedChain, onTokenSelected]);

  // 处理代币类型更改
  const handleTokenTypeChange = (type) => {
    setTokenType(type);
    
    if (type === 'native' && selectedChain) {
      onTokenSelected({
        type: 'native',
        ...selectedChain.nativeToken,
      });
    } else if (type === 'popular' && selectedPopularToken) {
      onTokenSelected({
        type: 'token',
        address: selectedPopularToken,
        ...selectedChain.popularTokens.find(token => token.address === selectedPopularToken),
      });
    } else if (type === 'custom' && customTokenAddress && !addressError) {
      onTokenSelected({
        type: 'token',
        address: customTokenAddress,
      });
    } else {
      onTokenSelected(null);
    }
  };
  
  // 处理常用代币选择
  const handlePopularTokenChange = (tokenAddress) => {
    setSelectedPopularToken(tokenAddress);
    
    if (tokenAddress) {
      const tokenInfo = selectedChain.popularTokens.find(token => token.address === tokenAddress);
      onTokenSelected({
        type: 'token',
        address: tokenAddress,
        ...tokenInfo,
      });
    } else {
      onTokenSelected(null);
    }
  };
  
  // 处理自定义代币地址变更
  const handleCustomAddressChange = (e) => {
    const address = e.target.value.trim();
    setCustomTokenAddress(address);
    
    if (address && !isValidTokenAddress(address)) {
      setAddressError('代币地址格式不正确');
      onTokenSelected(null);
    } else {
      setAddressError('');
      
      if (address) {
        onTokenSelected({
          type: 'token',
          address: address,
        });
      } else {
        onTokenSelected(null);
      }
    }
  };

  if (!selectedChain) {
    return <Alert message="请先选择一个链" type="info" />;
  }

  return (
    <div className="flex flex-col space-y-4">
      <div>
        <Text className="text-gray-700 mb-2 block">代币类型</Text>
        <Select
          style={{ width: '100%' }}
          value={tokenType}
          onChange={handleTokenTypeChange}
          disabled={disabled}
        >
          <Option value="native">原生代币 ({selectedChain.nativeToken.symbol})</Option>
          {selectedChain.popularTokens.length > 0 && (
            <Option value="popular">常用代币</Option>
          )}
          <Option value="custom">自定义代币</Option>
        </Select>
      </div>
      
      {tokenType === 'popular' && selectedChain.popularTokens.length > 0 && (
        <div>
          <Text className="text-gray-700 mb-2 block">选择常用代币</Text>
          <Select
            style={{ width: '100%' }}
            placeholder="选择一个常用代币"
            value={selectedPopularToken}
            onChange={handlePopularTokenChange}
            disabled={disabled}
          >
            {selectedChain.popularTokens.map(token => (
              <Option key={token.address} value={token.address}>
                {token.symbol} - {token.name}
              </Option>
            ))}
          </Select>
        </div>
      )}
      
      {tokenType === 'custom' && (
        <div>
          <Text className="text-gray-700 mb-2 block">代币合约地址</Text>
          <Input
            placeholder="输入ERC20代币合约地址 (0x...)"
            value={customTokenAddress}
            onChange={handleCustomAddressChange}
            status={addressError ? 'error' : ''}
            disabled={disabled}
          />
          {addressError && (
            <Text type="danger" className="mt-1 block">{addressError}</Text>
          )}
        </div>
      )}
      
      <div className="bg-gray-100 p-3 rounded-md mt-4">
        <Space direction="vertical" size="small">
          <Text className="text-gray-700">已选代币：</Text>
          <Text className="font-medium">
            {tokenType === 'native' 
              ? `${selectedChain.nativeToken.name} (${selectedChain.nativeToken.symbol})` 
              : tokenType === 'popular' && selectedPopularToken
                ? `${selectedChain.popularTokens.find(t => t.address === selectedPopularToken)?.name} (${selectedChain.popularTokens.find(t => t.address === selectedPopularToken)?.symbol})`
                : tokenType === 'custom' && customTokenAddress && !addressError
                  ? `自定义代币 (${customTokenAddress.substring(0, 8)}...)`
                  : '未选择'
            }
          </Text>
        </Space>
      </div>
    </div>
  );
};

export default TokenConfig; 