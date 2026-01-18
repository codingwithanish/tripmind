import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { env } from '@config/env';
import { IUser, JWTPayload } from '../types/user.types';

// Dummy user database
const users: IUser[] = [
  {
    id: '1',
    email: 'demo@tripmind.com',
    name: 'Demo User',
    password: bcrypt.hashSync('password123', 10), // hashed password
    authProvider: 'local',
    role: 'user',
    avatar: 'https://via.placeholder.com/150',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

class AuthService {
  /**
   * Login user with email and password
   */
  async login(email: string, password: string): Promise<{ user: Omit<IUser, 'password'>; token: string }> {
    const user = users.find((u) => u.email === email);

    if (!user || !user.password) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken(user);
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  /**
   * Register new user
   */
  async register(email: string, password: string, name: string): Promise<{ user: Omit<IUser, 'password'>; token: string }> {
    // Check if user already exists
    if (users.find((u) => u.email === email)) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser: IUser = {
      id: String(users.length + 1),
      email,
      name,
      password: hashedPassword,
      authProvider: 'local',
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    users.push(newUser);

    const token = this.generateToken(newUser);
    const { password: _, ...userWithoutPassword } = newUser;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<Omit<IUser, 'password'> | null> {
    const user = users.find((u) => u.id === userId);

    if (!user) {
      return null;
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: Partial<IUser>): Promise<Omit<IUser, 'password'>> {
    const userIndex = users.findIndex((u) => u.id === userId);

    if (userIndex === -1) {
      throw new Error('User not found');
    }

    users[userIndex] = {
      ...users[userIndex],
      ...updates,
      id: userId, // Ensure ID doesn't change
      updatedAt: new Date(),
    };

    const { password: _, ...userWithoutPassword } = users[userIndex];
    return userWithoutPassword;
  }

  /**
   * Generate JWT token
   */
  private generateToken(user: IUser): string {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRE,
    } as jwt.SignOptions);
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, env.JWT_SECRET) as JWTPayload;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}

export default new AuthService();
