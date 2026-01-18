/**
 * Auth Library Package
 * 
 * This package provides JWT token handling and RBAC helpers
 * for authentication across TripMind services.
 */

export interface JwtPayload {
    userId: string;
    email: string;
    roles: string[];
    iat?: number;
    exp?: number;
}

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

// Role definitions
export const Roles = {
    USER: 'user',
    ADMIN: 'admin',
    MODERATOR: 'moderator',
} as const;

export type Role = typeof Roles[keyof typeof Roles];

// Permission checking
export function hasRole(userRoles: string[], requiredRole: Role): boolean {
    return userRoles.includes(requiredRole);
}

export function hasAnyRole(userRoles: string[], requiredRoles: Role[]): boolean {
    return requiredRoles.some(role => userRoles.includes(role));
}

export function hasAllRoles(userRoles: string[], requiredRoles: Role[]): boolean {
    return requiredRoles.every(role => userRoles.includes(role));
}

// Token utilities (implement with jsonwebtoken in actual usage)
export interface TokenOptions {
    secret: string;
    accessTokenExpiresIn?: string;
    refreshTokenExpiresIn?: string;
}

// Placeholder for actual JWT implementation
export function createTokenUtils(options: TokenOptions) {
    return {
        generateAccessToken: (payload: JwtPayload): string => {
            // Implement with jsonwebtoken
            throw new Error('Not implemented - use jsonwebtoken.sign()');
        },
        generateRefreshToken: (payload: JwtPayload): string => {
            // Implement with jsonwebtoken
            throw new Error('Not implemented - use jsonwebtoken.sign()');
        },
        verifyToken: (token: string): JwtPayload => {
            // Implement with jsonwebtoken
            throw new Error('Not implemented - use jsonwebtoken.verify()');
        },
    };
}
