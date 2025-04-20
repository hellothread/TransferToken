import React, { useRef, useEffect, useState } from 'react';
import { List, Typography, Tag, Space, Button, Radio, Input, Badge, Tooltip, Empty, Popconfirm } from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  WarningOutlined,
  InfoCircleOutlined,
  DownloadOutlined,
  DeleteOutlined, 
  SortAscendingOutlined,
  SortDescendingOutlined
} from '@ant-design/icons';

const { Text } = Typography;
const { Search } = Input;

const LOG_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

const getTagType = (type) => {
  switch (type) {
    case LOG_TYPES.SUCCESS:
      return 'success';
    case LOG_TYPES.ERROR:
      return 'error';
    case LOG_TYPES.WARNING:
      return 'warning';
    case LOG_TYPES.INFO:
      return 'default';
    default:
      return 'default';
  }
};

const getTagIcon = (type) => {
  switch (type) {
    case LOG_TYPES.SUCCESS:
      return <CheckCircleOutlined />;
    case LOG_TYPES.ERROR:
      return <CloseCircleOutlined />;
    case LOG_TYPES.WARNING:
      return <WarningOutlined />;
    case LOG_TYPES.INFO:
      return <InfoCircleOutlined />;
    default:
      return null;
  }
};

// 解析消息内容以获取交易哈希链接
const parseMessageWithLinks = (message, explorerUrl) => {
  if (!message) return message;
  
  // 匹配包含交易哈希的部分
  const txHashRegex = /0x[a-fA-F0-9]{64}/g;
  const matches = message.match(txHashRegex);
  
  if (!matches || !explorerUrl) return message;
  
  let result = message;
  matches.forEach(txHash => {
    result = result.replace(
      txHash,
      `<a href="${explorerUrl}/tx/${txHash}" target="_blank" rel="noopener noreferrer">${txHash.substring(0, 10)}...${txHash.substring(txHash.length - 8)}</a>`
    );
  });
  
  return <span dangerouslySetInnerHTML={{ __html: result }} />;
};

const TransactionLogs = ({ logs, onClear }) => {
  const logEndRef = useRef(null);
  const logContainerRef = useRef(null);
  const [filter, setFilter] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' 或 'asc'
  
  // 日志统计
  const logCounts = {
    all: logs.length,
    success: logs.filter(log => log.type === LOG_TYPES.SUCCESS).length,
    error: logs.filter(log => log.type === LOG_TYPES.ERROR).length,
    warning: logs.filter(log => log.type === LOG_TYPES.WARNING).length,
    info: logs.filter(log => log.type === LOG_TYPES.INFO).length
  };
  
  // 筛选日志
  const filteredLogs = logs.filter(log => {
    // 按类型筛选
    const typeMatches = filter === 'all' || log.type === filter;
    
    // 按搜索文本筛选
    const textMatches = !searchText || 
      log.message.toLowerCase().includes(searchText.toLowerCase()) ||
      (log.time && log.time.toLowerCase().includes(searchText.toLowerCase()));
      
    return typeMatches && textMatches;
  });
  
  // 排序日志
  const sortedLogs = [...filteredLogs].sort((a, b) => {
    const dateA = new Date(a.time);
    const dateB = new Date(b.time);
    
    return sortOrder === 'desc' 
      ? dateB - dateA 
      : dateA - dateB;
  });
  
  // 自动滚动到最新日志
  useEffect(() => {
    if (logs.length > 0) {
      if (sortOrder === 'desc') {
        // 当最新的日志在顶部时（降序排列），滚动到顶部
        logContainerRef.current?.scrollTo(0, 0);
      } else {
        // 当最新的日志在底部时（升序排列），滚动到底部
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [logs, sortOrder]);
  
  // 导出日志
  const exportLogs = () => {
    if (logs.length === 0) return;
    
    const logContent = sortedLogs.map(log => 
      `[${log.time}] [${log.type.toUpperCase()}] ${log.message}`
    ).join('\n');
    
    const blob = new Blob([logContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transaction_logs_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // 清空日志
  const handleClearLogs = () => {
    if (typeof onClear === 'function') {
      onClear();
    }
  };
  
  // 处理搜索
  const handleSearch = (value) => {
    setSearchText(value);
  };
  
  // 渲染筛选器
  const renderFilter = () => (
    <div className="filter-section mb-2">
      <div className="flex justify-between items-center mb-2">
        <Radio.Group 
          value={filter} 
          onChange={e => setFilter(e.target.value)}
          size="small"
          buttonStyle="solid"
        >
          <Radio.Button value="all">
            全部 
            <Badge count={logCounts.all} style={{ backgroundColor: '#999', marginLeft: 5 }} />
          </Radio.Button>
          <Radio.Button value={LOG_TYPES.INFO}>
            信息
            <Badge count={logCounts.info} style={{ backgroundColor: '#1890ff', marginLeft: 5 }} />
          </Radio.Button>
          <Radio.Button value={LOG_TYPES.SUCCESS}>
            成功
            <Badge count={logCounts.success} style={{ backgroundColor: '#52c41a', marginLeft: 5 }} />
          </Radio.Button>
          <Radio.Button value={LOG_TYPES.WARNING}>
            警告
            <Badge count={logCounts.warning} style={{ backgroundColor: '#faad14', marginLeft: 5 }} />
          </Radio.Button>
          <Radio.Button value={LOG_TYPES.ERROR}>
            错误
            <Badge count={logCounts.error} style={{ backgroundColor: '#f5222d', marginLeft: 5 }} />
          </Radio.Button>
        </Radio.Group>
        
        <Tooltip title={sortOrder === 'desc' ? '最新在前' : '最早在前'}>
          <Button 
            size="small" 
            icon={sortOrder === 'desc' ? <SortDescendingOutlined /> : <SortAscendingOutlined />}
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
          />
        </Tooltip>
      </div>
    </div>
  );
  
  // 渲染工具栏
  const renderToolbar = () => (
    <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
      <div>
        <Text className="text-gray-700 mr-2">操作日志</Text>
        {logs.length > 0 && (
          <Text type="secondary" className="text-xs">
            共 {logs.length} 条记录
            {filteredLogs.length !== logs.length && `, 显示 ${filteredLogs.length} 条`}
          </Text>
        )}
      </div>
      
      <Space>
        <Search
          placeholder="搜索日志..."
          onSearch={handleSearch}
          onChange={(e) => setSearchText(e.target.value)}
          value={searchText}
          style={{ width: 180 }}
          size="small"
          allowClear
        />
        
        <Button 
          size="small" 
          icon={<DownloadOutlined />}
          onClick={exportLogs}
          disabled={logs.length === 0}
        >
          导出
        </Button>
        
        <Tooltip title="清空日志">
          <Popconfirm
            title="确定要清空所有日志吗？"
            onConfirm={handleClearLogs}
            okText="确定"
            cancelText="取消"
            disabled={logs.length === 0}
          >
            <Button 
              size="small" 
              type="text"
              danger
              icon={<DeleteOutlined />}
              disabled={logs.length === 0}
            />
          </Popconfirm>
        </Tooltip>
      </Space>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {renderToolbar()}
      
      {logs.length > 0 && renderFilter()}
      
      <div 
        ref={logContainerRef}
        className="overflow-y-auto flex-grow bg-white rounded"
        style={{ maxHeight: '400px', height: '400px' }}
      >
        {logs.length === 0 ? (
          <Empty 
            description="暂无日志记录" 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
            className="py-10"
          />
        ) : filteredLogs.length === 0 ? (
          <Empty 
            description="没有匹配的日志记录" 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
            className="py-10"
          />
        ) : (
          <List
            size="small"
            dataSource={sortedLogs}
            split={false}
            renderItem={(log) => (
              <List.Item 
                key={log.id}
                className="py-2 px-3 hover:bg-gray-50 border-b border-gray-100 last:border-0"
              >
                <div className="flex items-center w-full">
                  <div className="w-20 flex-shrink-0">
                    <Text className="text-gray-500 text-xs">{log.time}</Text>
                  </div>
                  <div className="w-20 flex-shrink-0 flex justify-center">
                    <Tag 
                      icon={getTagIcon(log.type)} 
                      color={getTagType(log.type)}
                      style={{ margin: 0, width: '64px', textAlign: 'center', fontSize: '11px' }}
                    >
                      {log.type.toUpperCase()}
                    </Tag>
                  </div>
                  {log.category && (
                    <div className="w-16 flex-shrink-0 flex justify-center mr-2">
                      <Tag color="blue" style={{ margin: 0, fontSize: '11px' }}>{log.category}</Tag>
                    </div>
                  )}
                  <div className="text-sm break-all flex-1">
                    {parseMessageWithLinks(log.message)}
                  </div>
                </div>
              </List.Item>
            )}
          />
        )}
        <div ref={logEndRef} />
      </div>
    </div>
  );
};

export default TransactionLogs; 