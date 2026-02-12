import api from './api';
import {
  Timeline,
  TimelineItem,
  CreateTimelineItemData,
  UpdateTimelineItemData,
} from '@/types/timeline.types';
import { ApiResponse } from '@/types/api.types';

const timelineService = {
  // Get timeline for a travel
  getTimeline: async (travelId: string): Promise<Timeline> => {
    const response = await api.get<ApiResponse<Timeline>>(`/timelines/${travelId}`);
    return response.data.data!;
  },

  // Generate timeline for a travel
  generateTimeline: async (travelId: string): Promise<Timeline> => {
    const response = await api.post<ApiResponse<Timeline>>(`/timelines/${travelId}`);
    return response.data.data!;
  },

  // Update timeline item
  updateTimelineItem: async (
    itemId: string,
    data: UpdateTimelineItemData
  ): Promise<TimelineItem> => {
    const response = await api.put<ApiResponse<TimelineItem>>(`/timelines/items/${itemId}`, data);
    return response.data.data!;
  },

  // Delete timeline item
  deleteTimelineItem: async (itemId: string): Promise<void> => {
    await api.delete(`/timelines/items/${itemId}`);
  },

  // Add timeline item
  addTimelineItem: async (
    travelId: string,
    data: CreateTimelineItemData
  ): Promise<TimelineItem> => {
    const response = await api.post<ApiResponse<TimelineItem>>(
      `/timelines/${travelId}/items`,
      data
    );
    return response.data.data!;
  },
};

export default timelineService;
