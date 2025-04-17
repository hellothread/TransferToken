import React, { useState, useEffect } from 'react';
import { Input, Button, Typography, Space, Alert } from 'antd';
import { DeleteOutlined, EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { isValidPrivateKey } from '../services/web3Service';

const { TextArea } = Input;
const { Text } = Typography;

const PrivateKeyInput = ({ onKeysChanged, disabled }) => {
  const [privateKeys, setPrivateKeys] = useState('');
  const [showKeys, setShowKeys] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [validKeyCount, setValidKeyCount] = useState(0);

  // 当私钥输入改变时验证私钥
  useEffect(() => {
    validatePrivateKeys(privateKeys);
  }, [privateKeys]);

  // 验证私钥格式
  const validatePrivateKeys = (keys) => {
    if (!keys.trim()) {
      setErrorMessage('');
      setValidKeyCount(0);
      onKeysChanged([]);
      return;
    }

    const keyLines = keys.split('\n').filter(line => line.trim());
    const invalidKeys = [];
    const validKeys = [];

    keyLines.forEach((key, index) => {
      const trimmedKey = key.trim();
      if (trimmedKey && !isValidPrivateKey(trimmedKey)) {
        invalidKeys.push({ index: index + 1, key: trimmedKey });
      } else if (trimmedKey) {
        validKeys.push(trimmedKey);
      }
    });

    if (invalidKeys.length > 0) {
      const errorLines = invalidKeys.map(k => `第${k.index}行`).join(', ');
      setErrorMessage(`发现无效的私钥格式: ${errorLines}`);
    } else {
      setErrorMessage('');
    }

    setValidKeyCount(validKeys.length);
    onKeysChanged(validKeys);
  };

  // 处理输入改变
  const handleInputChange = (e) => {
    setPrivateKeys(e.target.value);
  };

  // 清空输入
  const handleClear = () => {
    setPrivateKeys('');
    setErrorMessage('');
    setValidKeyCount(0);
    onKeysChanged([]);
  };

  return (
    <div className="flex flex-col space-y-3">
      <div className="flex justify-between items-center">
        <Text className="text-gray-700">私钥 (每行一个)</Text>
        <Space>
          <Button
            type="text"
            icon={showKeys ? <EyeOutlined /> : <EyeInvisibleOutlined />}
            onClick={() => setShowKeys(!showKeys)}
            disabled={disabled}
          >
            {showKeys ? '隐藏' : '显示'}
          </Button>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={handleClear}
            disabled={disabled || !privateKeys}
          >
            清空
          </Button>
        </Space>
      </div>

      <TextArea
        placeholder="请输入私钥，每行一个。私钥将仅保留在浏览器内存中，不会上传服务器。"
        autoSize={{ minRows: 4, maxRows: 8 }}
        value={privateKeys}
        onChange={handleInputChange}
        disabled={disabled}
        className="font-mono"
        status={errorMessage ? 'error' : ''}
        type={showKeys ? 'text' : 'password'}
      />

      {errorMessage && (
        <Alert message={errorMessage} type="error" showIcon />
      )}

      <div className="text-right text-sm">
        <Text type={validKeyCount > 0 ? 'success' : 'secondary'}>
          有效私钥数量: {validKeyCount}
        </Text>
      </div>
    </div>
  );
};

export default PrivateKeyInput; 