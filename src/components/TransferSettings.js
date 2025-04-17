import React, { useState, useEffect } from 'react';
import { Form, InputNumber, Slider, Radio, Row, Col, Divider, Typography, Input } from 'antd';

const { Text } = Typography;

const TransferSettings = ({ settings, onSettingsChanged, disabled }) => {
  const [form] = Form.useForm();
  const [gasMode, setGasMode] = useState('auto');
  const [customGasPrice, setCustomGasPrice] = useState('');

  // 初始化表单
  useEffect(() => {
    form.setFieldsValue({
      minDelay: settings.minDelay,
      maxDelay: settings.maxDelay,
      gasMode: settings.gasPrice === 'auto' ? 'auto' : 'custom',
      gasPrice: settings.gasPrice !== 'auto' ? settings.gasPrice : '',
    });

    setGasMode(settings.gasPrice === 'auto' ? 'auto' : 'custom');
    setCustomGasPrice(settings.gasPrice !== 'auto' ? settings.gasPrice : '');
  }, [settings, form]);

  // 表单值变化时更新设置
  const handleValuesChange = (changedValues, allValues) => {
    const newSettings = { ...settings };

    if ('minDelay' in changedValues) {
      newSettings.minDelay = changedValues.minDelay;
      // 确保最小延迟不大于最大延迟
      if (changedValues.minDelay > allValues.maxDelay) {
        form.setFieldsValue({ maxDelay: changedValues.minDelay });
        newSettings.maxDelay = changedValues.minDelay;
      }
    }

    if ('maxDelay' in changedValues) {
      newSettings.maxDelay = changedValues.maxDelay;
      // 确保最大延迟不小于最小延迟
      if (changedValues.maxDelay < allValues.minDelay) {
        form.setFieldsValue({ minDelay: changedValues.maxDelay });
        newSettings.minDelay = changedValues.maxDelay;
      }
    }

    if ('gasMode' in changedValues) {
      setGasMode(changedValues.gasMode);
      newSettings.gasPrice = changedValues.gasMode === 'auto' ? 'auto' : customGasPrice || '5';
    }

    if ('gasPrice' in changedValues && changedValues.gasPrice !== undefined) {
      setCustomGasPrice(changedValues.gasPrice);
      if (allValues.gasMode === 'custom') {
        newSettings.gasPrice = changedValues.gasPrice;
      }
    }

    onSettingsChanged(newSettings);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      disabled={disabled}
      onValuesChange={handleValuesChange}
      initialValues={{
        minDelay: settings.minDelay,
        maxDelay: settings.maxDelay,
        gasMode: settings.gasPrice === 'auto' ? 'auto' : 'custom',
        gasPrice: settings.gasPrice !== 'auto' ? settings.gasPrice : '',
      }}
    >
      <Row gutter={16}>
        <Col span={24}>
          <Form.Item label="交易延迟范围（秒）">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="minDelay" noStyle>
                  <InputNumber
                    min={1}
                    max={3600}
                    placeholder="最小延迟"
                    style={{ width: '100%' }}
                    addonAfter="秒"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="maxDelay" noStyle>
                  <InputNumber
                    min={1}
                    max={3600}
                    placeholder="最大延迟"
                    style={{ width: '100%' }}
                    addonAfter="秒"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Text type="secondary" className="text-xs block mt-1">
              每笔交易将在此范围内随机等待，避免规律性操作
            </Text>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item name="gasMode" label="Gas价格设置">
        <Radio.Group>
          <Radio value="auto">自动 (根据网络状况)</Radio>
          <Radio value="custom">自定义</Radio>
        </Radio.Group>
      </Form.Item>

      {gasMode === 'custom' && (
        <Form.Item name="gasPrice" label="自定义Gas价格 (Gwei)">
          <InputNumber
            min={1}
            placeholder="Gas价格"
            style={{ width: '100%' }}
            addonAfter="Gwei"
          />
        </Form.Item>
      )}

      <Divider />

      <Form.Item label="转账金额设置">
        <Text className="block">
          随机金额：系统将随机使用账户中部分余额进行转账，保留部分用于支付Gas费用。
        </Text>
        <Text type="secondary" className="text-xs block mt-1">
          Note: 为增加随机性，转账金额范围将自动设置为余额的0-90%
        </Text>
      </Form.Item>
    </Form>
  );
};

export default TransferSettings; 