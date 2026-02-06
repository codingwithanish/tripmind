import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import Home from '@pages/Home';
import Chat from '@pages/Chat';
import Timeline from '@pages/Timeline';
import MyTravels from '@pages/MyTravels';
import Login, { AuthCallback, Signup } from '@pages/Auth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { ROUTES } from '@utils/constants';
import Profile from '@pages/Profile';

// Placeholder components (to be implemented later)
const Notifications = () => <div style={{ padding: '2rem' }}>Notifications Page - Coming Soon</div>;

const AppRoutes: React.FC = () => {
  return (
    <MainLayout>
      <Routes>
        <Route path={ROUTES.HOME} element={<Home />} />
        <Route path={ROUTES.CHAT} element={<Chat />} />
        <Route path={ROUTES.CHAT_ROOM} element={<Chat />} />
        <Route path={ROUTES.TIMELINE} element={<Timeline />} />
        <Route path={ROUTES.TIMELINE_ROOM} element={<Timeline />} />
        <Route path={ROUTES.MY_TRAVELS} element={
          <ProtectedRoute>
            <MyTravels />
          </ProtectedRoute>
        } />
        <Route path={ROUTES.NOTIFICATIONS} element={<Notifications />} />
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.REGISTER} element={<Signup />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path={ROUTES.PROFILE} element={<Profile />} />
        <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
      </Routes>
    </MainLayout>
  );
};

export default AppRoutes;

