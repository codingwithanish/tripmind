import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '@context/AuthContext';
import AppRoutes from './routes/AppRoutes';
import '@assets/styles/variables.css';
import '@assets/styles/global.css';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
};

export default App;
