export type TimelineItemType =
  | 'visa'
  | 'flight'
  | 'hotel'
  | 'activity'
  | 'transport'
  | 'restaurant'
  | 'shopping'
  | 'preparation'
  | 'other';

export type TimelineItemStatus = 'pending' | 'booked' | 'confirmed' | 'completed' | 'cancelled';

export interface TimelineItemDetails {
  [key: string]: any;
  // Flexible structure for different item types
  location?: string;
  bookingReference?: string;
  confirmationNumber?: string;
  notes?: string;
}

export interface TimelineItem {
  id: string;
  timelineId: string;
  type: TimelineItemType;
  title: string;
  description: string;
  date: string;
  time?: string;
  cost: number;
  currency: string;
  status: TimelineItemStatus;
  details: TimelineItemDetails;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Timeline {
  id: string;
  travelId: string;
  items: TimelineItem[];
  generatedAt: string;
  lastModified: string;
}

export interface CreateTimelineItemData {
  type: TimelineItemType;
  title: string;
  description: string;
  date: string;
  time?: string;
  cost: number;
  currency?: string;
  details?: TimelineItemDetails;
}

export interface UpdateTimelineItemData extends Partial<CreateTimelineItemData> {
  status?: TimelineItemStatus;
  order?: number;
}
