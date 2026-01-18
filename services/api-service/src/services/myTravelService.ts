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

// Dummy travel data for development
const myTravels: MyTravelCard[] = [
    {
        thread_id: 'travel-001',
        travel_summary: '5 Days Family Adventurous Trip to Goa',
        status: 'confirmed',
        images: [
            {
                type: 'thumbnail',
                url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400',
                description: 'Goa Beach View',
            },
        ],
        summary: [
            {
                icon: { provider: 'iconify', name: 'mdi:calendar-range' },
                title: 'Jan 15 - Jan 20 (5 Days)',
                subtitle: '',
                priority: 1,
            },
            {
                icon: { provider: 'iconify', name: 'mdi:currency-usd' },
                title: 'Est Cost: 4000 USD',
                subtitle: '',
                priority: 2,
            },
            {
                icon: { provider: 'iconify', name: 'mdi:account-group' },
                title: 'Family Trip',
                subtitle: '',
                priority: 3,
            },
        ],
        notifications: [
            {
                icon: { provider: 'iconify', name: 'mdi:alert-circle' },
                title: 'Attention Needed',
                subtitle: 'One of your family member passport not Upgraded',
                priority: 1,
            },
        ],
    },
    {
        thread_id: 'travel-002',
        travel_summary: 'Weekend Getaway to Manali',
        status: 'planning',
        images: [
            {
                type: 'thumbnail',
                url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400',
                description: 'Manali Mountains',
            },
        ],
        summary: [
            {
                icon: { provider: 'iconify', name: 'mdi:calendar-range' },
                title: 'Feb 10 - Feb 12 (3 Days)',
                subtitle: '',
                priority: 1,
            },
            {
                icon: { provider: 'iconify', name: 'mdi:currency-usd' },
                title: 'Est Cost: 1500 USD',
                subtitle: '',
                priority: 2,
            },
            {
                icon: { provider: 'iconify', name: 'mdi:account-heart' },
                title: 'Couple Trip',
                subtitle: '',
                priority: 3,
            },
        ],
        notifications: [
            {
                icon: { provider: 'iconify', name: 'mdi:information' },
                title: 'Booking Reminder',
                subtitle: 'Hotel booking pending for this trip',
                priority: 1,
            },
        ],
    },
    {
        thread_id: 'travel-003',
        travel_summary: 'Business Conference in Singapore',
        status: 'completed',
        images: [
            {
                type: 'thumbnail',
                url: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400',
                description: 'Singapore Skyline',
            },
        ],
        summary: [
            {
                icon: { provider: 'iconify', name: 'mdi:calendar-range' },
                title: 'Dec 5 - Dec 8 (4 Days)',
                subtitle: '',
                priority: 1,
            },
            {
                icon: { provider: 'iconify', name: 'mdi:currency-usd' },
                title: 'Total Spent: 3200 USD',
                subtitle: '',
                priority: 2,
            },
            {
                icon: { provider: 'iconify', name: 'mdi:briefcase' },
                title: 'Business Trip',
                subtitle: '',
                priority: 3,
            },
        ],
        notifications: [],
    },
    {
        thread_id: 'travel-004',
        travel_summary: 'Cancelled Trip to Thailand',
        status: 'dropped',
        images: [
            {
                type: 'thumbnail',
                url: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=400',
                description: 'Thailand Temple',
            },
        ],
        summary: [
            {
                icon: { provider: 'iconify', name: 'mdi:calendar-range' },
                title: 'Mar 1 - Mar 7 (7 Days)',
                subtitle: '',
                priority: 1,
            },
            {
                icon: { provider: 'iconify', name: 'mdi:currency-usd' },
                title: 'Est Cost: 2500 USD',
                subtitle: '',
                priority: 2,
            },
            {
                icon: { provider: 'iconify', name: 'mdi:account-multiple' },
                title: 'Friends Trip',
                subtitle: '',
                priority: 3,
            },
        ],
        notifications: [
            {
                icon: { provider: 'iconify', name: 'mdi:cancel' },
                title: 'Trip Cancelled',
                subtitle: 'This trip was cancelled due to schedule conflicts',
                priority: 1,
            },
        ],
    },
];

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

class MyTravelService {
    /**
     * Get all travels for a user with pagination and optional status filter
     */
    async getMyTravels(
        _userId: string,
        page: number = 1,
        limit: number = 10,
        status?: TravelCardStatus
    ): Promise<MyTravelsResponse> {
        // Filter by status if provided
        let filteredTravels = myTravels;
        if (status) {
            filteredTravels = myTravels.filter((t) => t.status === status);
        }

        // Calculate pagination
        const total = filteredTravels.length;
        const totalPages = Math.ceil(total / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;

        // Get paginated data
        const paginatedData = filteredTravels.slice(startIndex, endIndex);

        return {
            data: paginatedData,
            pagination: {
                page,
                limit,
                total,
                totalPages,
            },
        };
    }
}

export default new MyTravelService();
