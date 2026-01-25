import { threadDao } from '../database/dao';

// Define ThreadStatus locally (matches Prisma enum)
type ThreadStatus = 'draft' | 'planning' | 'confirmed' | 'completed' | 'cancelled' | 'dropped';

export type TravelCardStatus = 'confirmed' | 'planning' | 'completed' | 'dropped';

export interface TravelIconInfo {
    provider: 'iconify';
    name: string;
}

export interface TravelImage {
    type: 'thumbnail';
    url: string;
    description: string;
}

export interface TravelSummaryItem {
    icon: TravelIconInfo;
    title: string;
    subtitle: string;
    priority: number;
}

export interface TravelNotification {
    icon: TravelIconInfo;
    title: string;
    subtitle: string;
    priority: number;
}

export interface MyTravelCard {
    thread_id: string;
    travel_summary: string;
    status: TravelCardStatus;
    images: TravelImage[];
    summary: TravelSummaryItem[];
    notifications: TravelNotification[];
}

export interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface MyTravelsResponse {
    data: MyTravelCard[];
    pagination: PaginationInfo;
}

/**
 * Map database thread status to travel card status
 */
function mapThreadStatusToCardStatus(status: ThreadStatus): TravelCardStatus {
    switch (status) {
        case 'confirmed':
            return 'confirmed';
        case 'planning':
        case 'draft':
            return 'planning';
        case 'completed':
            return 'completed';
        case 'cancelled':
        case 'dropped':
            return 'dropped';
        default:
            return 'planning';
    }
}

/**
 * Generate default thumbnail for travel
 */
function getDefaultThumbnail(): TravelImage {
    return {
        type: 'thumbnail',
        url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400',
        description: 'Travel destination',
    };
}

class MyTravelService {
    /**
     * Get all travels for a user with pagination and optional status filter
     */
    async getMyTravels(
        userEmail: string,
        page: number = 1,
        limit: number = 10,
        status?: TravelCardStatus
    ): Promise<MyTravelsResponse> {
        // Map card status to thread statuses
        let threadStatus: ThreadStatus | undefined;
        if (status) {
            switch (status) {
                case 'confirmed':
                    threadStatus = 'confirmed';
                    break;
                case 'planning':
                    threadStatus = 'planning';
                    break;
                case 'completed':
                    threadStatus = 'completed';
                    break;
                case 'dropped':
                    threadStatus = 'dropped';
                    break;
            }
        }

        // Get threads from database
        const { threads, total } = await threadDao.findByUserEmail(
            userEmail,
            page,
            limit,
            threadStatus
        );

        // Transform threads to travel cards
        const travelCards: MyTravelCard[] = threads.map((thread) => {
            const cardStatus = mapThreadStatusToCardStatus(thread.status);

            // Build summary items
            const summaryItems: TravelSummaryItem[] = [];

            // Status indicator
            summaryItems.push({
                icon: { provider: 'iconify', name: 'mdi:progress-check' },
                title: `Status: ${thread.status.charAt(0).toUpperCase() + thread.status.slice(1)}`,
                subtitle: '',
                priority: 1,
            });

            // Progress if in planning
            if (cardStatus === 'planning' && thread.timelineReadyProgress > 0) {
                summaryItems.push({
                    icon: { provider: 'iconify', name: 'mdi:percent' },
                    title: `Progress: ${thread.timelineReadyProgress}%`,
                    subtitle: '',
                    priority: 2,
                });
            }

            // Created date
            summaryItems.push({
                icon: { provider: 'iconify', name: 'mdi:calendar' },
                title: `Created: ${thread.createdAt.toLocaleDateString()}`,
                subtitle: '',
                priority: 3,
            });

            // Build notifications
            const notifications: TravelNotification[] = [];

            // Warning if timeline not ready
            if (
                cardStatus === 'planning' &&
                !thread.timelineId &&
                thread.timelineReadyProgress < 80
            ) {
                notifications.push({
                    icon: { provider: 'iconify', name: 'mdi:information' },
                    title: 'Continue Planning',
                    subtitle: 'More details needed to generate timeline',
                    priority: 1,
                });
            }

            // Confirmation needed
            if (thread.status === 'confirmed' && !thread.isConfirmed) {
                notifications.push({
                    icon: { provider: 'iconify', name: 'mdi:alert-circle' },
                    title: 'Action Required',
                    subtitle: 'Please confirm your travel details',
                    priority: 1,
                });
            }

            return {
                thread_id: thread.id,
                travel_summary: thread.summary || `Travel Plan - ${thread.createdAt.toLocaleDateString()}`,
                status: cardStatus,
                images: [getDefaultThumbnail()],
                summary: summaryItems,
                notifications,
            };
        });

        const totalPages = Math.ceil(total / limit);

        return {
            data: travelCards,
            pagination: {
                page,
                limit,
                total,
                totalPages,
            },
        };
    }

    /**
     * Get a single travel by thread ID
     */
    async getTravelByThreadId(threadId: string): Promise<MyTravelCard | null> {
        const thread = await threadDao.findById(threadId);

        if (!thread) {
            return null;
        }

        const cardStatus = mapThreadStatusToCardStatus(thread.status);

        const summaryItems: TravelSummaryItem[] = [
            {
                icon: { provider: 'iconify', name: 'mdi:progress-check' },
                title: `Status: ${thread.status.charAt(0).toUpperCase() + thread.status.slice(1)}`,
                subtitle: '',
                priority: 1,
            },
        ];

        if (thread.timelineReadyProgress > 0) {
            summaryItems.push({
                icon: { provider: 'iconify', name: 'mdi:percent' },
                title: `Progress: ${thread.timelineReadyProgress}%`,
                subtitle: '',
                priority: 2,
            });
        }

        return {
            thread_id: thread.id,
            travel_summary: thread.summary || `Travel Plan - ${thread.createdAt.toLocaleDateString()}`,
            status: cardStatus,
            images: [getDefaultThumbnail()],
            summary: summaryItems,
            notifications: [],
        };
    }

    /**
     * Get travel counts by status for a user
     */
    async getTravelCounts(userEmail: string): Promise<Record<TravelCardStatus, number>> {
        const counts = await threadDao.countByStatus(userEmail);

        return {
            confirmed: counts.confirmed,
            planning: counts.planning + counts.draft,
            completed: counts.completed,
            dropped: counts.cancelled + counts.dropped,
        };
    }
}

export default new MyTravelService();
