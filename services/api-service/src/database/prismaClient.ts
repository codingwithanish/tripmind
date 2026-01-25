import { PrismaClient } from '@prisma/client';
import { env } from '../config/env';

// Singleton pattern for Prisma Client
// In development, we store the client on global to prevent hot-reload issues
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

// Create Prisma client
const createPrismaClient = () => {
    const isDevelopment = env.NODE_ENV === 'development';

    return new PrismaClient({
        log: isDevelopment
            ? [
                { emit: 'stdout', level: 'query' },
                { emit: 'stdout', level: 'info' },
                { emit: 'stdout', level: 'warn' },
                { emit: 'stdout', level: 'error' },
            ]
            : [
                { emit: 'stdout', level: 'warn' },
                { emit: 'stdout', level: 'error' },
            ],
    });
};

// Export singleton instance
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}

/**
 * Connect to database
 * Call this on server startup
 */
export async function connectDatabase(): Promise<void> {
    try {
        // Test connection with a simple query
        await prisma.$queryRaw`SELECT 1`;
        console.log('✅ Database connected successfully');
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        throw error;
    }
}

/**
 * Disconnect from database
 * Call this on graceful shutdown
 */
export async function disconnectDatabase(): Promise<void> {
    try {
        await prisma.$disconnect();
        console.log('📤 Database disconnected');
    } catch (error) {
        console.error('❌ Database disconnect error:', error);
        throw error;
    }
}

/**
 * Health check for database connection
 */
export async function checkDatabaseHealth(): Promise<boolean> {
    try {
        await prisma.$queryRaw`SELECT 1`;
        return true;
    } catch {
        return false;
    }
}

export default prisma;
