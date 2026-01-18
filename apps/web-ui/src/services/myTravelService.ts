import api from './api';
import { MyTravelsResponse, TravelCardStatus } from '@/types/myTravel.types';

export interface GetMyTravelsParams {
    page?: number;
    limit?: number;
    status?: TravelCardStatus;
}

const myTravelService = {
    /**
     * Get all travels for current user with pagination and optional status filter
     */
    getMyTravels: async (params: GetMyTravelsParams = {}): Promise<MyTravelsResponse> => {
        const { page = 1, limit = 10, status } = params;

        const queryParams = new URLSearchParams();
        queryParams.set('page', String(page));
        queryParams.set('limit', String(limit));
        if (status) {
            queryParams.set('status', status);
        }

        const response = await api.get<MyTravelsResponse>(`/my-travel?${queryParams.toString()}`);
        return response.data;
    },
};

export default myTravelService;
