import React, { useRef, useEffect, useState } from 'react';
import { List, Typography, Tag, Space, Button, Radio, Input, Badge, Tooltip, Empty, Popconfirm, DatePicker, Select, Dropdown, Menu } from 'antd';
import { 
  LinkOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  WarningOutlined,
  InfoCircleOutlined,
  DownloadOutlined,
  DeleteOutlined, 
  SearchOutlined,
  ClearOutlined,
  FilterOutlined,
  CalendarOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined
} from '@ant-design/icons';
import { formatTimestamp } from '../utils/formatters';
import moment from 'moment';

const { Text, Link } = Typography;
const { Search } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;

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
  const [filter, setFilter] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState(null);
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' 或 'asc'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  
  // 从日志中提取所有可能的类别
  const categories = [...new Set(logs.filter(log => log.category).map(log => log.category))];
  
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
    // 首先按类型筛选
    const typeMatches = filter === 'all' || log.type === filter;
    
    // 按类别筛选
    const categoryMatches = categoryFilter === 'all' || log.category === categoryFilter;
    
    // 按日期范围筛选
    let dateMatches = true;
    if (dateRange && dateRange[0] && dateRange[1]) {
      const logDate = moment(log.timestamp || log.time, "YYYY-MM-DD HH:mm:ss");
      dateMatches = logDate.isBetween(dateRange[0], dateRange[1], null, '[]');
    }
    
    // 按搜索文本筛选
    const textMatches = !searchText || 
      log.message.toLowerCase().includes(searchText.toLowerCase()) ||
      (log.time && log.time.toLowerCase().includes(searchText.toLowerCase())) ||
      (log.category && log.category.toLowerCase().includes(searchText.toLowerCase()));
      
    return typeMatches && categoryMatches && dateMatches && textMatches;
  });
  
  // 排序日志
  const sortedLogs = [...filteredLogs].sort((a, b) => {
    const dateA = moment(a.timestamp || a.time, "YYYY-MM-DD HH:mm:ss");
    const dateB = moment(b.timestamp || b.time, "YYYY-MM-DD HH:mm:ss");
    
    return sortOrder === 'desc' 
      ? dateB.valueOf() - dateA.valueOf() 
      : dateA.valueOf() - dateB.valueOf();
  });
  
  // 自动滚动到最新日志
  useEffect(() => {
    if (logs.length > 0 && (!searchText && filter === 'all' && !dateRange && categoryFilter === 'all')) {
      logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, searchText, filter, dateRange, categoryFilter]);
  
  // 导出日志
  const exportLogs = () => {
    if (logs.length === 0) return;
    
    const logContent = sortedLogs.map(log => 
      `[${log.time}] [${log.type.toUpperCase()}]${log.category ? ` [${log.category}]` : ''} ${log.message}`
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
  
  // 导出为CSV
  const exportAsCSV = () => {
    if (logs.length === 0) return;
    
    // CSV 表头
    const headers = ['时间', '类型', '类别', '消息'];
    
    // 准备CSV数据
    const csvContent = [
      headers.join(','),
      ...sortedLogs.map(log => {
        return [
          `"${log.time}"`,
          `"${log.type.toUpperCase()}"`,
          `"${log.category || ''}"`,
          `"${log.message.replace(/"/g, '""')}"`
        ].join(',');
      })
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transaction_logs_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`;
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
  
  // 重置所有筛选条件
  const resetFilters = () => {
    setFilter('all');
    setSearchText('');
    setDateRange(null);
    setCategoryFilter('all');
    setSortOrder('desc');
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
      
      {isFilterVisible && (
        <div className="advanced-filters flex flex-wrap gap-2 mt-2 p-2 bg-gray-100 rounded">
          {categories.length > 0 && (
            <Select
              placeholder="选择类别"
              value={categoryFilter}
              onChange={value => setCategoryFilter(value)}
              style={{ width: 120 }}
              size="small"
            >
              <Option value="all">所有类别</Option>
              {categories.map(category => (
                <Option key={category} value={category}>{category}</Option>
              ))}
            </Select>
          )}
          
          <RangePicker 
            size="small"
            value={dateRange}
            onChange={(dates) => setDateRange(dates)}
            format="YYYY-MM-DD"
            placeholder={['开始日期', '结束日期']}
            allowClear
          />
          
          <Button 
            size="small" 
            onClick={resetFilters}
            icon={<ClearOutlined />}
          >
            重置筛选
          </Button>
        </div>
      )}
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
        
        <Tooltip title="高级筛选">
          <Button 
            size="small" 
            type={isFilterVisible ? "primary" : "default"}
            icon={<FilterOutlined />}
            onClick={() => setIsFilterVisible(!isFilterVisible)}
          />
        </Tooltip>
        
        <Dropdown overlay={
          <Menu>
            <Menu.Item key="export-txt" onClick={exportLogs} icon={<DownloadOutlined />}>
              导出为文本文件
            </Menu.Item>
            <Menu.Item key="export-csv" onClick={exportAsCSV} icon={<DownloadOutlined />}>
              导出为CSV
            </Menu.Item>
          </Menu>
        } disabled={logs.length === 0}>
          <Button 
            size="small" 
            icon={<DownloadOutlined />}
            disabled={logs.length === 0}
          >
            导出
          </Button>
        </Dropdown>
        
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
      
      <div className="overflow-y-auto flex-grow border border-gray-200 rounded p-2 bg-gray-50">
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
            renderItem={(log) => (
              <List.Item 
                key={log.id}
                className={`py-1 border-b border-dashed last:border-0 hover:bg-gray-100`}
              >
                <Space className="w-full" direction="vertical" size={1}>
                  <div className="flex justify-between items-center w-full">
                    <Space>
                      <Text className="text-gray-500">[{log.time}]</Text>
                      <Tag 
                        icon={getTagIcon(log.type)} 
                        color={getTagType(log.type)}
                      >
                        {log.type.toUpperCase()}
                      </Tag>
                      {log.category && (
                        <Tag color="blue">{log.category}</Tag>
                      )}
                    </Space>
                  </div>
                  <div className="text-sm break-all">
                    {parseMessageWithLinks(log.message)}
                  </div>
                </Space>
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