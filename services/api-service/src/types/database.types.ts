/**
 * Database Types
 *
 * Extended types and interfaces for database operations.
 * These types complement the auto-generated Prisma types.
 * 
 * Note: Enums are defined locally to avoid Prisma 7 export issues.
 */

// Re-export Prisma model types
export type {
    User,
    Member,
    Thread,
    ThreadContext,
    Message,
    Timeline,
    TimelineNode,
    TimelineNodeElement,
    Notification,
    NotificationPreference,
    SuggestionTemplate,
    RefreshToken,
} from '@prisma/client';

// ============================================================================
// Enum Type Definitions (Local definitions matching Prisma schema)
// ============================================================================

export type AuthProvider = 'local' | 'google' | 'facebook';
export type UserRole = 'user' | 'admin';
export type UserStatus = 'active' | 'blocked' | 'deleted' | 'expired' | 'pending_verification';
export type ThreadStatus = 'draft' | 'planning' | 'confirmed' | 'completed' | 'cancelled' | 'dropped';
export type ThreadSubStatus = 'understanding' | 'timeline_preparation' | 'timeline_finalized';
export type MessageRole = 'user' | 'assistant';
export type MessageType = 'text' | 'markdown' | 'image' | 'card' | 'json' | 'error';
export type MessageStatus = 'sent' | 'delivered' | 'read' | 'failed';
export type TimelineStatus = 'draft' | 'in_progress' | 'ready' | 'confirmed' | 'archived';
export type BudgetType = 'confirmed' | 'approx';
export type NodeType = 'start' | 'end' | 'task_node' | 'representation_node' | 'action' | 'representation' | 'additional_input';
export type NodeStatus = 'active' | 'inactive' | 'in_progress';
export type DisplayDateType = 'date' | 'date_range' | 'time' | 'time_range';
export type TasksStatus = 'pending' | 'in_progress' | 'completed';
export type RecommendationStatus = 'pending' | 'reviewed' | 'accepted';
export type ElementType = 'task' | 'recommendation';
export type ElementStatus = 'confirmed' | 'pending' | 'completed' | 'cancelled';
export type NotificationType = 'flight_delay' | 'flight_change' | 'weather_alert' | 'booking_confirmation' | 'reminder' | 'travel_update' | 'system';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';
export type DisplayType = 'mobile' | 'desktop' | 'all';
export type SuggestionCategory = 'long_time_plan' | 'short_time_plan' | 'weekend_plan' | 'quick_trip';

// ============================================================================
// JSONB Type Definitions
// ============================================================================

export interface InterestProfile {
    travel_interest?: string[];
    food_interest?: string[];
    activity_preferences?: string[];
}

export interface LocationCoordinates {
    lat: number;
    lng: number;
}

export interface LocationInfo {
    coordinates?: LocationCoordinates;
    location_name?: string;
    address?: string;
}

export interface LocationDetails {
    primary_location?: LocationInfo;
    office_location?: LocationInfo;
    other_locations?: LocationInfo[];
}

export interface PassportInfo {
    available: boolean;
    country?: string;
    expiry_date?: string;
}

export interface VisaInfo {
    country: string;
    type: string;
    expiry_date?: string;
    status: 'valid' | 'expired' | 'pending';
}

export interface TravelProfile {
    passport?: PassportInfo;
    visas?: VisaInfo[];
}

export interface TravelInstructions {
    food_restrictions?: string[];
    medical_conditions?: string[];
    accessibility_needs?: string[];
    preferences?: string[];
    special_requirements?: string[];
}

export interface VersionInfo {
    version_id: string;
    timeline_id: string;
    status: 'active' | 'archived' | 'draft';
}

export interface VersionDetails {
    versions: VersionInfo[];
    current_version: string;
}

export interface TravellerDetail {
    member_id: string;
    name: string;
    travel_history_context?: string;
    special_notes?: string;
}

export interface DisplayIcon {
    provider: string;
    name: string;
}

export interface NodeSummary {
    summary: string;
    elements_summary?: string[];
    keywords?: string[];
}

export interface PriceRange {
    type: 'range' | 'constant' | 'confirmed';
    currency: string;
    min?: number;
    max?: number;
    confirmed?: number;
}

export interface PlaceholderOption {
    type: 'select' | 'text' | 'number';
    options?: string[];
    default?: string;
}

export interface PlaceholderOptions {
    [key: string]: PlaceholderOption;
}

// ============================================================================
// Pagination Types
// ============================================================================

export interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: PaginationInfo;
}

// ============================================================================
// Database Health Types
// ============================================================================

export interface DatabaseHealth {
    connected: boolean;
    latencyMs?: number;
    error?: string;
}
