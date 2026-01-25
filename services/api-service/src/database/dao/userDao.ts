import { prisma } from '../prismaClient';
import { User, UserStatus, AuthProvider, UserRole, Prisma } from '@prisma/client';

// Type for creating a new user
export interface CreateUserInput {
    email: string;
    name: string;
    passwordHash?: string;
    authProvider: AuthProvider;
    authProviderId?: string;
    role?: UserRole;
    phoneNumber?: string;
}

// Type for updating user
export interface UpdateUserInput {
    name?: string;
    passwordHash?: string;
    status?: UserStatus;
    emailVerified?: boolean;
    phoneNumber?: string;
    phoneNumberVerified?: boolean;
}

// User without password hash for safe returns
export type SafeUser = Omit<User, 'passwordHash'>;

class UserDao {
    /**
     * Find user by email (primary key)
     */
    async findByEmail(email: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { email },
        });
    }

    /**
     * Find user by email - safe version without password
     */
    async findByEmailSafe(email: string): Promise<SafeUser | null> {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) return null;

        const { passwordHash: _, ...safeUser } = user;
        return safeUser;
    }

    /**
     * Find user by OAuth provider
     */
    async findByAuthProvider(
        provider: AuthProvider,
        providerId: string
    ): Promise<User | null> {
        return prisma.user.findFirst({
            where: {
                authProvider: provider,
                authProviderId: providerId,
            },
        });
    }

    /**
     * Create a new user
     */
    async create(data: CreateUserInput): Promise<SafeUser> {
        const user = await prisma.user.create({
            data: {
                email: data.email,
                name: data.name,
                passwordHash: data.passwordHash,
                authProvider: data.authProvider,
                authProviderId: data.authProviderId,
                role: data.role ?? 'user',
                phoneNumber: data.phoneNumber,
            },
        });

        const { passwordHash: _, ...safeUser } = user;
        return safeUser;
    }

    /**
     * Update user by email
     */
    async update(email: string, data: UpdateUserInput): Promise<SafeUser> {
        const user = await prisma.user.update({
            where: { email },
            data,
        });

        const { passwordHash: _, ...safeUser } = user;
        return safeUser;
    }

    /**
     * Update user status
     */
    async updateStatus(email: string, status: UserStatus): Promise<SafeUser> {
        return this.update(email, { status });
    }

    /**
     * Verify user email
     */
    async verifyEmail(email: string): Promise<SafeUser> {
        return this.update(email, { emailVerified: true });
    }

    /**
     * Verify user phone number
     */
    async verifyPhoneNumber(email: string): Promise<SafeUser> {
        return this.update(email, { phoneNumberVerified: true });
    }

    /**
     * Soft delete user (set status to deleted)
     */
    async softDelete(email: string): Promise<SafeUser> {
        return this.updateStatus(email, 'deleted');
    }

    /**
     * Block user
     */
    async block(email: string): Promise<SafeUser> {
        return this.updateStatus(email, 'blocked');
    }

    /**
     * Check if user exists
     */
    async exists(email: string): Promise<boolean> {
        const count = await prisma.user.count({
            where: { email },
        });
        return count > 0;
    }

    /**
     * Get all active users with pagination
     */
    async findAllActive(
        page: number = 1,
        limit: number = 10
    ): Promise<{ users: SafeUser[]; total: number }> {
        const skip = (page - 1) * limit;

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where: { status: 'active' },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.user.count({ where: { status: 'active' } }),
        ]);

        return {
            users: users.map(({ passwordHash: _, ...user }) => user),
            total,
        };
    }

    /**
     * Get user with their members
     */
    async findWithMembers(email: string): Promise<(SafeUser & { members: any[] }) | null> {
        const user = await prisma.user.findUnique({
            where: { email },
            include: { members: true },
        });

        if (!user) return null;

        const { passwordHash: _, ...safeUser } = user;
        return safeUser as SafeUser & { members: any[] };
    }
}

export const userDao = new UserDao();
export default userDao;
