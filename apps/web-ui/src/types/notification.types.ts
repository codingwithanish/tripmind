export type NotificationType =
  | 'flight_delay'
  | 'flight_change'
  | 'weather_alert'
  | 'booking_confirmation'
  | 'reminder'
  | 'travel_update'
  | 'system';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Notification {
  id: string;
  userId: string;
  travelId?: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  metadata?: {
    [key: string]: any;
  };
  createdAt: string;
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  flightUpdates: boolean;
  weatherAlerts: boolean;
  bookingReminders: boolean;
}
