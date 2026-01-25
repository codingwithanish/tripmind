import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { STORAGE_KEYS } from '@utils/constants';
import { appConfig } from '@/config/app.config';

// Hardcoded credentials for demo mode
const VALID_CREDENTIALS = {
  email: 'user@tripmind.com',
  password: 'tripmind123',
};

interface User {
  id: string;
  email: string;
  name: string;
  authProvider?: 'local' | 'google' | 'facebook';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
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

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (email === VALID_CREDENTIALS.email && password === VALID_CREDENTIALS.password) {
      const loggedInUser: User = {
        id: '1',
        email: VALID_CREDENTIALS.email,
        name: 'TripMind User',
        authProvider: 'local',
      };
      // Store a mock token for API requests
      const mockToken = 'demo-token-' + Date.now();
      localStorage.setItem(STORAGE_KEYS.TOKEN, mockToken);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      setIsLoading(false);
      return { success: true };
    }

    setIsLoading(false);
    return { success: false, error: 'Invalid email or password' };
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

