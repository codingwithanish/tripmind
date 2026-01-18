/**
 * Shared Types Package
 * 
 * This package contains shared TypeScript types, API contracts,
 * and schemas used across TripMind services.
 */

// API Response Types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

// User Types
export interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    createdAt: Date;
    updatedAt: Date;
}

// Trip Types
export interface Trip {
    id: string;
    userId: string;
    title: string;
    description?: string;
    startDate?: Date;
    endDate?: Date;
    status: TripStatus;
    createdAt: Date;
    updatedAt: Date;
}

export type TripStatus = 'draft' | 'planning' | 'confirmed' | 'completed' | 'cancelled';

// Add more shared types as needed
