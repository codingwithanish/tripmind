/**
 * Shared Config Package
 * 
 * This package provides environment configuration loading
 * and validation for TripMind services.
 */

export interface ConfigSchema {
    NODE_ENV: 'development' | 'staging' | 'production';
    PORT: number;
    API_URL: string;
    DATABASE_URL?: string;
    REDIS_URL?: string;
    JWT_SECRET?: string;
    [key: string]: string | number | undefined;
}

export function loadConfig<T extends Partial<ConfigSchema>>(
    schema: { [K in keyof T]: { required?: boolean; default?: T[K] } }
): T {
    const config: Partial<T> = {};

    for (const [key, options] of Object.entries(schema)) {
        const value = process.env[key];

        if (value !== undefined) {
            config[key as keyof T] = value as T[keyof T];
        } else if (options.default !== undefined) {
            config[key as keyof T] = options.default;
        } else if (options.required) {
            throw new Error(`Missing required environment variable: ${key}`);
        }
    }

    return config as T;
}

export function getEnv(key: string, defaultValue?: string): string {
    const value = process.env[key];
    if (value === undefined) {
        if (defaultValue !== undefined) return defaultValue;
        throw new Error(`Missing environment variable: ${key}`);
    }
    return value;
}

export function getEnvNumber(key: string, defaultValue?: number): number {
    const value = process.env[key];
    if (value === undefined) {
        if (defaultValue !== undefined) return defaultValue;
        throw new Error(`Missing environment variable: ${key}`);
    }
    const num = parseInt(value, 10);
    if (isNaN(num)) {
        throw new Error(`Environment variable ${key} must be a number`);
    }
    return num;
}

export function getEnvBoolean(key: string, defaultValue?: boolean): boolean {
    const value = process.env[key];
    if (value === undefined) {
        if (defaultValue !== undefined) return defaultValue;
        throw new Error(`Missing environment variable: ${key}`);
    }
    return value.toLowerCase() === 'true' || value === '1';
}
