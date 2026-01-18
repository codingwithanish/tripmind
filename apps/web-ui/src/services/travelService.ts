import api from './api';
import { Travel, CreateTravelData, UpdateTravelData } from '@types/travel.types';
import { ApiResponse } from '@types/api.types';

const travelService = {
  // Get all travels for current user
  getAllTravels: async (): Promise<Travel[]> => {
    const response = await api.get<ApiResponse<Travel[]>>('/travels');
    return response.data.data!;
  },

  // Get single travel by ID
  getTravelById: async (id: string): Promise<Travel> => {
    const response = await api.get<ApiResponse<Travel>>(`/travels/${id}`);
    return response.data.data!;
  },

  // Create new travel plan
  createTravel: async (data: CreateTravelData): Promise<Travel> => {
    const response = await api.post<ApiResponse<Travel>>('/travels', data);
    return response.data.data!;
  },

  // Update travel plan
  updateTravel: async (id: string, data: UpdateTravelData): Promise<Travel> => {
    const response = await api.put<ApiResponse<Travel>>(`/travels/${id}`, data);
    return response.data.data!;
  },

  // Delete travel plan
  deleteTravel: async (id: string): Promise<void> => {
    await api.delete(`/travels/${id}`);
  },

  // Confirm travel plan
  confirmTravel: async (id: string): Promise<Travel> => {
    const response = await api.post<ApiResponse<Travel>>(`/travels/${id}/confirm`);
    return response.data.data!;
  },
};

export default travelService;
