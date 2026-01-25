import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { env } from '@config/env';
import { userDao, memberDao, SafeUser } from '../database/dao';
import { AuthProvider, UserStatus } from '@prisma/client';

/**
 * JWT Payload structure
 */
export interface JWTPayload {
  userEmail: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Login response structure
 */
export interface AuthResponse {
  user: SafeUser;
  token: string;
}

class AuthService {
  /**
   * Login user with email and password
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    // Find user with password hash included
    const user = await userDao.findByEmail(email);

    if (!user || !user.passwordHash) {
      throw new Error('Invalid credentials');
    }

    // Check if user is active
    if (user.status !== 'active') {
      throw new Error(`Account is ${user.status}`);
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken(user.email, user.role);

    // Return user without password
    const { passwordHash: _, ...safeUser } = user;

    return {
      user: safeUser,
      token,
    };
  }

  /**
   * Register new user
   */
  async register(
    email: string,
    password: string,
    name: string
  ): Promise<AuthResponse> {
    // Check if user already exists
    const exists = await userDao.exists(email);
    if (exists) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await userDao.create({
      email,
      name,
      passwordHash: hashedPassword,
      authProvider: 'local',
    });

    // Create primary member for the user
    await memberDao.createPrimaryMember(email, name);

    const token = this.generateToken(user.email, user.role);

    return {
      user,
      token,
    };
  }

  /**
   * Login or register with OAuth provider
   */
  async oauthLogin(
    provider: AuthProvider,
    providerId: string,
    email: string,
    name: string,
    avatar?: string
  ): Promise<AuthResponse> {
    // Try to find existing user by provider
    let user = await userDao.findByAuthProvider(provider, providerId);

    if (user) {
      // User exists, check status
      if (user.status !== 'active') {
        throw new Error(`Account is ${user.status}`);
      }

      const { passwordHash: _, ...safeUser } = user;
      const token = this.generateToken(user.email, user.role);

      return { user: safeUser, token };
    }

    // Check if email already exists with different provider
    const existingByEmail = await userDao.findByEmail(email);
    if (existingByEmail) {
      throw new Error('Email already registered with different provider');
    }

    // Create new user with OAuth
    const newUser = await userDao.create({
      email,
      name,
      authProvider: provider,
      authProviderId: providerId,
    });

    // Create primary member with avatar
    const member = await memberDao.createPrimaryMember(email, name);
    if (avatar) {
      await memberDao.update(member.id, { avatar });
    }

    const token = this.generateToken(newUser.email, newUser.role);

    return { user: newUser, token };
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<SafeUser | null> {
    return userDao.findByEmailSafe(email);
  }

  /**
   * Get user with members
   */
  async getUserWithMembers(email: string) {
    return userDao.findWithMembers(email);
  }

  /**
   * Update user profile
   */
  async updateProfile(
    email: string,
    updates: { name?: string; phoneNumber?: string }
  ): Promise<SafeUser> {
    return userDao.update(email, updates);
  }

  /**
   * Change password
   */
  async changePassword(
    email: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await userDao.findByEmail(email);

    if (!user || !user.passwordHash) {
      throw new Error('User not found or not a local account');
    }

    const isCurrentValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentValid) {
      throw new Error('Current password is incorrect');
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await userDao.update(email, { passwordHash: newHash });
  }

  /**
   * Verify email
   */
  async verifyEmail(email: string): Promise<SafeUser> {
    return userDao.verifyEmail(email);
  }

  /**
   * Verify phone number
   */
  async verifyPhoneNumber(email: string): Promise<SafeUser> {
    return userDao.verifyPhoneNumber(email);
  }

  /**
   * Block user
   */
  async blockUser(email: string): Promise<SafeUser> {
    return userDao.block(email);
  }

  /**
   * Delete user (soft delete)
   */
  async deleteUser(email: string): Promise<SafeUser> {
    return userDao.softDelete(email);
  }

  /**
   * Generate JWT token
   */
  private generateToken(email: string, role: string): string {
    const payload: JWTPayload = {
      userEmail: email,
      role,
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
    } catch {
      throw new Error('Invalid token');
    }
  }
}

export default new AuthService();
