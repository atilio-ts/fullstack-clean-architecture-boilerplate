import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography, Alert, Spin } from 'antd';
import { UserOutlined, ShoppingCartOutlined, DollarOutlined, TrophyOutlined, ApiOutlined, DatabaseOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { checkHealth, type HealthResponse } from '@/api';

const { Title } = Typography;

const Dashboard: React.FC = () => {
  const [healthData, setHealthData] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealthData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await checkHealth();
        setHealthData(data);
      } catch (err) {
        setError('Failed to fetch health data from backend');
        console.error('Health check error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHealthData();
  }, []);

  return (
    <div>
      <Title level={2}>Dashboard</Title>
      
      {error && (
        <Alert
          message="Backend Connection Error"
          description={error}
          type="error"
          style={{ marginBottom: 16 }}
          showIcon
        />
      )}
      
      {/* API Health Status Section */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card title="API Health Status">
            {loading ? (
              <div style={{ textAlign: 'center', padding: 20 }}>
                <Spin size="large" />
                <p style={{ marginTop: 16 }}>Checking API health...</p>
              </div>
            ) : healthData ? (
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={8} lg={6}>
                  <Statistic
                    title="Status"
                    value={healthData.status}
                    prefix={<ApiOutlined />}
                    valueStyle={{ color: healthData.status === 'OK' ? '#3f8600' : '#cf1322' }}
                  />
                </Col>
                <Col xs={24} sm={8} lg={6}>
                  <Statistic
                    title="Uptime"
                    value={Math.floor(healthData.uptime / 60)}
                    suffix="min"
                    prefix={<ClockCircleOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Col>
                <Col xs={24} sm={8} lg={6}>
                  <Statistic
                    title="Memory Used"
                    value={healthData.memory.used}
                    precision={1}
                    suffix="MB"
                    prefix={<DatabaseOutlined />}
                    valueStyle={{ color: '#722ed1' }}
                  />
                </Col>
                <Col xs={24} sm={8} lg={6}>
                  <Statistic
                    title="Environment"
                    value={healthData.environment}
                    valueStyle={{ color: '#fa8c16' }}
                  />
                </Col>
              </Row>
            ) : (
              <p>Unable to load health data</p>
            )}
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={1128}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Orders"
              value={93}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Revenue"
              value={11280}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Performance"
              value={93}
              suffix="/ 100"
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="Welcome to your Dashboard">
            <p>This is your main dashboard where you can view key metrics and manage your application.</p>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;