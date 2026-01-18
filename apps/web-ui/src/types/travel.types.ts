export type TravelStatus = 'draft' | 'planning' | 'confirmed' | 'completed' | 'cancelled';

export type TripType = 'solo' | 'family' | 'friends' | 'business' | 'couple' | 'group';

export interface TravelerInfo {
  adults: number;
  children: number;
  ages?: number[];
}

export interface Travel {
  id: string;
  userId: string;
  title: string;
  destination?: string;
  status: TravelStatus;
  tripType: TripType;
  budget: number;
  currency: string;
  travelers: TravelerInfo;
  startDate: string;
  endDate: string;
  isConfirmed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTravelData {
  title: string;
  tripType: TripType;
  budget: number;
  currency?: string;
  travelers: TravelerInfo;
  startDate?: string;
  endDate?: string;
}

export interface UpdateTravelData extends Partial<CreateTravelData> {
  status?: TravelStatus;
  isConfirmed?: boolean;
}
