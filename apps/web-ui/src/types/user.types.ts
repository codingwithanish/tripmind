export type AuthProvider = 'google' | 'facebook' | 'local';

export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  authProvider: AuthProvider;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
