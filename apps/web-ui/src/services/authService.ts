import api from './api';
import { AuthResponse, LoginCredentials, RegisterData, User } from '@/types/user.types';
import { ApiResponse } from '@/types/api.types';

const authService = {
  // Login with email and password
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    return response.data.data!;
  },

  // Register new user
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return response.data.data!;
  },

  // Logout
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  // Get current user profile
  getProfile: async (): Promise<User> => {
    const response = await api.get<ApiResponse<User>>('/users/profile');
    return response.data.data!;
  },

  // Update user profile
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.put<ApiResponse<User>>('/users/profile', data);
    return response.data.data!;
  },

  // Social auth - redirect to OAuth provider
  loginWithGoogle: () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/google`;
  },

  loginWithFacebook: () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/facebook`;
  },

  // Handle OAuth callback
  handleOAuthCallback: async (provider: string, code: string): Promise<AuthResponse> => {
    const response = await api.get<ApiResponse<AuthResponse>>(
      `/auth/${provider}/callback?code=${code}`
    );
    return response.data.data!;
  },
};

export default authService;
