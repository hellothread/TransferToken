import React from 'react';
import { Button, Space, Typography, Card, Popconfirm, Alert } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, StopOutlined } from '@ant-design/icons';

const { Text } = Typography;

const ControlPanel = ({ isRunning, onStart, onStop, disabled }) => {
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between bg-gray-100 p-3 rounded-md">
        <Text 
          className="font-medium"
          type={isRunning ? 'success' : 'secondary'}
        >
          状态: {isRunning ? '运行中' : '已停止'}
        </Text>
        <Space>
          {!isRunning ? (
            <Popconfirm
              title="确认开始转账"
              description="确定要开始执行转账操作吗？"
              onConfirm={onStart}
              okText="确定"
              cancelText="取消"
              disabled={disabled}
            >
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                disabled={disabled}
              >
                开始转账
              </Button>
            </Popconfirm>
          ) : (
            <Popconfirm
              title="确认停止转账"
              description="确定要停止转账操作吗？当前正在执行的转账将会继续完成。"
              onConfirm={onStop}
              okText="确定"
              cancelText="取消"
            >
              <Button
                danger
                type="primary"
                icon={<StopOutlined />}
              >
                停止转账
              </Button>
            </Popconfirm>
          )}
        </Space>
      </div>
      
      {disabled && !isRunning && (
        <Alert
          type="warning"
          message="无法开始转账"
          description="请确保已选择链、代币，并添加至少一个有效私钥。"
          showIcon
        />
      )}
      
      <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
        <Text className="block mb-2 font-medium">操作说明：</Text>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
          <li>点击"开始转账"按钮开始执行转账操作</li>
          <li>系统将随机选择私钥，并按照设置的延迟时间随机等待后执行</li>
          <li>转账金额将随机从余额中选择，确保留有足够的Gas费</li>
          <li>您可以随时点击"停止转账"按钮来终止未开始的转账操作</li>
          <li>所有转账记录将在下方日志区域显示</li>
        </ul>
      </div>
    </div>
  );
};

export default ControlPanel; 