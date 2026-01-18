/**
 * Shared Utils Package
 * 
 * This package contains shared utilities for logging,
 * error handling, and tracing across TripMind services.
 */

// Logger
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface Logger {
    debug(message: string, meta?: Record<string, unknown>): void;
    info(message: string, meta?: Record<string, unknown>): void;
    warn(message: string, meta?: Record<string, unknown>): void;
    error(message: string, meta?: Record<string, unknown>): void;
}

export function createLogger(name: string): Logger {
    const log = (level: LogLevel, message: string, meta?: Record<string, unknown>) => {
        const timestamp = new Date().toISOString();
        console.log(JSON.stringify({ timestamp, level, name, message, ...meta }));
    };

    return {
        debug: (msg, meta) => log('debug', msg, meta),
        info: (msg, meta) => log('info', msg, meta),
        warn: (msg, meta) => log('warn', msg, meta),
        error: (msg, meta) => log('error', msg, meta),
    };
}

// Error Classes
export class AppError extends Error {
    constructor(
        message: string,
        public code: string,
        public statusCode: number = 500
    ) {
        super(message);
        this.name = 'AppError';
    }
}

export class ValidationError extends AppError {
    constructor(message: string) {
        super(message, 'VALIDATION_ERROR', 400);
        this.name = 'ValidationError';
    }
}

export class NotFoundError extends AppError {
    constructor(resource: string) {
        super(`${resource} not found`, 'NOT_FOUND', 404);
        this.name = 'NotFoundError';
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized') {
        super(message, 'UNAUTHORIZED', 401);
        this.name = 'UnauthorizedError';
    }
}
