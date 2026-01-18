export type AuthProvider = 'google' | 'facebook' | 'local';
export type UserRole = 'user' | 'admin';

export interface IUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  authProvider: AuthProvider;
  authProviderId?: string;
  password?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}
