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
    success: boolean;
    data: MyTravelCard[];
    pagination: PaginationInfo;
}
