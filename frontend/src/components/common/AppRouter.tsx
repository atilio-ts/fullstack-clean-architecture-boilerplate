import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './AppLayout';
import Home from '@/pages/Home';
import Dashboard from '@/pages/Dashboard';
import Settings from '@/pages/Settings';
import { ROUTES } from '@/constants/routes';

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path={ROUTES.HOME} element={<Home />} />
          <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
          <Route path={ROUTES.SETTINGS} element={<Settings />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
};

export default AppRouter;