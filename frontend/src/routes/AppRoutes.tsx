import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import Home from '@pages/Home';
import Chat from '@pages/Chat';
import Timeline from '@pages/Timeline';
import { ROUTES } from '@utils/constants';

// Placeholder components (to be implemented later)
const MyTravels = () => <div style={{ padding: '2rem' }}>My Travels Page - Coming Soon</div>;
const Notifications = () => <div style={{ padding: '2rem' }}>Notifications Page - Coming Soon</div>;
const Login = () => <div style={{ padding: '2rem' }}>Login Page - Coming Soon</div>;
const Profile = () => <div style={{ padding: '2rem' }}>Profile Page - Coming Soon</div>;

const AppRoutes: React.FC = () => {
  return (
    <MainLayout>
      <Routes>
        <Route path={ROUTES.HOME} element={<Home />} />
        <Route path={ROUTES.CHAT} element={<Chat />} />
        <Route path={ROUTES.TIMELINE} element={<Timeline />} />
        <Route path={ROUTES.MY_TRAVELS} element={<MyTravels />} />
        <Route path={ROUTES.NOTIFICATIONS} element={<Notifications />} />
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.PROFILE} element={<Profile />} />
        <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
      </Routes>
    </MainLayout>
  );
};

export default AppRoutes;
