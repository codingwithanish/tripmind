import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@types/user.types';
import { IAuthContext } from '@/interfaces/IUser';
import authService from '@services/authService';
import { getLocalStorage, setLocalStorage, removeLocalStorage } from '@utils/helpers';
import { STORAGE_KEYS } from '@utils/constants';

const AuthContext = createContext<IAuthContext | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      const storedToken = getLocalStorage<string>(STORAGE_KEYS.TOKEN);
      const storedUser = getLocalStorage<User>(STORAGE_KEYS.USER);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      setToken(response.token);
      setUser(response.user);
      setLocalStorage(STORAGE_KEYS.TOKEN, response.token);
      setLocalStorage(STORAGE_KEYS.USER, response.user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await authService.register({ email, password, name });
      setToken(response.token);
      setUser(response.user);
      setLocalStorage(STORAGE_KEYS.TOKEN, response.token);
      setLocalStorage(STORAGE_KEYS.USER, response.user);
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    authService.loginWithGoogle();
  };

  const loginWithFacebook = async () => {
    authService.loginWithFacebook();
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    removeLocalStorage(STORAGE_KEYS.TOKEN);
    removeLocalStorage(STORAGE_KEYS.USER);
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const updatedUser = await authService.updateProfile(data);
      setUser(updatedUser);
      setLocalStorage(STORAGE_KEYS.USER, updatedUser);
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const value: IAuthContext = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    register,
    loginWithGoogle,
    loginWithFacebook,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
