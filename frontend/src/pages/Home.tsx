import React from 'react';
import { Typography, Card, Row, Col, Button } from 'antd';
import { RocketOutlined, SafetyOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

const { Title, Paragraph } = Typography;

const Home: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <RocketOutlined style={{ fontSize: '2rem', color: '#1890ff' }} />,
      title: 'Fast Development',
      description: 'Built with modern React, TypeScript, and Vite for lightning-fast development experience.',
    },
    {
      icon: <SafetyOutlined style={{ fontSize: '2rem', color: '#52c41a' }} />,
      title: 'Type Safety',
      description: 'Full TypeScript support ensures type safety and better developer experience.',
    },
    {
      icon: <ThunderboltOutlined style={{ fontSize: '2rem', color: '#faad14' }} />,
      title: 'Performance',
      description: 'Optimized build process and modern tooling for exceptional performance.',
    },
  ];

  return (
    <div style={{ textAlign: 'center', padding: '2rem 0' }}>
      <Title level={1}>Welcome to Your Application</Title>
      <Paragraph style={{ fontSize: '1.2rem', marginBottom: '3rem' }}>
        A modern React application built with TypeScript, Vite, and Ant Design
      </Paragraph>

      <Row gutter={[24, 24]} style={{ marginBottom: '3rem' }}>
        {features.map((feature, index) => (
          <Col xs={24} md={8} key={index}>
            <Card hoverable style={{ height: '100%' }}>
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                {feature.icon}
              </div>
              <Title level={4}>{feature.title}</Title>
              <Paragraph>{feature.description}</Paragraph>
            </Card>
          </Col>
        ))}
      </Row>

      <div>
        <Button 
          type="primary" 
          size="large" 
          onClick={() => navigate(ROUTES.DASHBOARD)}
          style={{ marginRight: '1rem' }}
        >
          Go to Dashboard
        </Button>
        <Button 
          size="large" 
          onClick={() => navigate(ROUTES.SETTINGS)}
        >
          Settings
        </Button>
      </div>
    </div>
  );
};

export default Home;