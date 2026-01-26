import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { STORAGE_KEYS } from '@utils/constants';
import { appConfig } from '@/config/app.config';

import authService from '@services/authService';
import { User } from '@types/user.types';

// Hardcoded credentials for demo mode (fallback)
const VALID_CREDENTIALS = {
  email: 'user@tripmind.com',
  password: 'tripmind123',
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => void;
  handleOAuthCallback: (token: string, email: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session in localStorage
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem(STORAGE_KEYS.USER);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    try {
      const { user: loggedInUser, token } = await authService.login({ email, password });

      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      setIsLoading(false);
      return { success: true };
    } catch (error: any) {
      console.error('Login failed:', error);

      // Fallback to demo credentials if API fails or for demo purposes
      if (email === VALID_CREDENTIALS.email && password === VALID_CREDENTIALS.password) {
        const demoUser: User = {
          id: '1',
          email: VALID_CREDENTIALS.email,
          name: 'TripMind User',
          authProvider: 'local',
          role: 'user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const mockToken = 'demo-token-' + Date.now();
        localStorage.setItem(STORAGE_KEYS.TOKEN, mockToken);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(demoUser));
        setUser(demoUser);
        setIsLoading(false);
        return { success: true };
      }

      setIsLoading(false);
      return { success: false, error: error.response?.data?.message || error.message || 'Invalid email or password' };
    }
  };

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const { user: newUser, token } = await authService.register({ name, email, password });

      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
      setUser(newUser);
      setIsLoading(false);
      return { success: true };
    } catch (error: any) {
      setIsLoading(false);
      return { success: false, error: error.response?.data?.message || error.message || 'Registration failed' };
    }
  };

  /**
   * Redirect to Google OAuth login
   */
  const loginWithGoogle = useCallback(() => {
    // Redirect to backend Google OAuth endpoint
    const googleAuthUrl = `${appConfig.apiBaseUrl}/auth/google`;
    window.location.href = googleAuthUrl;
  }, []);

  /**
   * Handle OAuth callback - process token and user info from URL
   */
  const handleOAuthCallback = useCallback(async (
    token: string,
    email: string,
    name: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);

      const loggedInUser: User = {
        id: email, // Use email as ID for now
        email,
        name: decodeURIComponent(name),
        authProvider: 'google',
        role: 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Store token and user
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      setIsLoading(false);

      return { success: true };
    } catch (error: any) {
      setIsLoading(false);
      return { success: false, error: error.message || 'Authentication failed' };
    }
  }, []);

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        loginWithGoogle,
        handleOAuthCallback,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

