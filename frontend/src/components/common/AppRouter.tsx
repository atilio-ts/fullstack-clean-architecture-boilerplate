import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './AppLayout';
import Dashboard from '@/pages/Dashboard';
import { ROUTES } from '@/constants/routes';

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
};

export default AppRouter;