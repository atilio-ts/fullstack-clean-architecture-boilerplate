import React from 'react';
import { ConfigProvider } from 'antd';
import AppRouter from '@/components/common/AppRouter';
import { customTheme } from '@/styles/theme';
import '@/styles/global.css';

const App: React.FC = () => {
  return (
    <ConfigProvider theme={customTheme}>
      <AppRouter />
    </ConfigProvider>
  );
};

export default App;
