import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography, Alert, Spin } from 'antd';
import { FileOutlined, ApiOutlined, DatabaseOutlined, ClockCircleOutlined, CloudServerOutlined } from '@ant-design/icons';
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
      <Title level={2}>File Management Dashboard</Title>
      
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
          <Card title="Backend API Status">
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
                    prefix={<CloudServerOutlined />}
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
      
      {/* File Management Section - Placeholder for future implementation */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Total Files"
              value={0}
              prefix={<FileOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Storage Used"
              value="0"
              suffix="MB"
              prefix={<DatabaseOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="File Types"
              value="txt, md, json"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="File Management System">
            <p>
              Welcome to the Atilio File Management Dashboard. This system allows you to:
            </p>
            <ul>
              <li>Upload and manage .txt, .md, and .json files (up to 1MB each)</li>
              <li>View, edit, and download your files</li>
              <li>Monitor backend API health and system status</li>
              <li>Track file storage usage and statistics</li>
            </ul>
            <p>
              <strong>Backend Status:</strong> {healthData?.status === 'OK' ? '✅ Connected' : '❌ Disconnected'}
            </p>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;