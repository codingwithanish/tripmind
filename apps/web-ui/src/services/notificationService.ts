import api from './api';
import { Notification } from '@types/notification.types';
import { ApiResponse } from '@types/api.types';

const notificationService = {
  // Get all notifications for current user
  getNotifications: async (): Promise<Notification[]> => {
    const response = await api.get<ApiResponse<Notification[]>>('/notifications');
    return response.data.data!;
  },

  // Mark notification as read
  markAsRead: async (id: string): Promise<Notification> => {
    const response = await api.put<ApiResponse<Notification>>(`/notifications/${id}/read`);
    return response.data.data!;
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<void> => {
    await api.put('/notifications/read-all');
  },

  // Delete notification
  deleteNotification: async (id: string): Promise<void> => {
    await api.delete(`/notifications/${id}`);
  },

  // Get unread notification count
  getUnreadCount: async (): Promise<number> => {
    const response = await api.get<ApiResponse<{ count: number }>>('/notifications/unread-count');
    return response.data.data!.count;
  },
};

export default notificationService;
