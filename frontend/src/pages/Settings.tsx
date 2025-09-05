import React from 'react';
import { Card, Form, Input, Button, Switch, Typography, Divider } from 'antd';

const { Title } = Typography;

const Settings: React.FC = () => {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log('Settings updated:', values);
  };

  return (
    <div>
      <Title level={2}>Settings</Title>
      
      <Card title="Application Settings">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            notifications: true,
            darkMode: false,
            autoSave: true,
          }}
        >
          <Form.Item
            label="Application Name"
            name="appName"
            rules={[{ required: true, message: 'Please enter application name' }]}
          >
            <Input placeholder="Enter application name" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
          >
            <Input.TextArea 
              rows={4} 
              placeholder="Enter application description" 
            />
          </Form.Item>

          <Divider />

          <Form.Item
            label="Enable Notifications"
            name="notifications"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            label="Dark Mode"
            name="darkMode"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            label="Auto Save"
            name="autoSave"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Save Settings
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Settings;