interface Travel {
  id: string;
  userId: string;
  title: string;
  destination?: string;
  status: string;
  tripType: string;
  budget: number;
  currency: string;
  travelers: {
    adults: number;
    children: number;
    ages?: number[];
  };
  startDate: string;
  endDate: string;
  isConfirmed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Dummy travel data
const travels: Travel[] = [
  {
    id: '1',
    userId: '1',
    title: 'Tokyo Adventure',
    destination: 'Tokyo, Japan',
    status: 'confirmed',
    tripType: 'solo',
    budget: 3000,
    currency: 'USD',
    travelers: { adults: 1, children: 0 },
    startDate: '2024-06-01',
    endDate: '2024-06-10',
    isConfirmed: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
];

class TravelService {
  /**
   * Get all travels for a user
   */
  async getAllTravels(userId: string): Promise<Travel[]> {
    return travels.filter((t) => t.userId === userId);
  }

  /**
   * Get travel by ID
   */
  async getTravelById(id: string, userId: string): Promise<Travel | null> {
    const travel = travels.find((t) => t.id === id && t.userId === userId);
    return travel || null;
  }

  /**
   * Create new travel
   */
  async createTravel(userId: string, data: Partial<Travel>): Promise<Travel> {
    const newTravel: Travel = {
      id: String(travels.length + 1),
      userId,
      title: data.title || 'New Travel Plan',
      destination: data.destination,
      status: 'draft',
      tripType: data.tripType || 'solo',
      budget: data.budget || 0,
      currency: data.currency || 'USD',
      travelers: data.travelers || { adults: 1, children: 0 },
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      endDate: data.endDate || new Date().toISOString().split('T')[0],
      isConfirmed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    travels.push(newTravel);
    return newTravel;
  }

  /**
   * Update travel
   */
  async updateTravel(id: string, userId: string, updates: Partial<Travel>): Promise<Travel> {
    const travelIndex = travels.findIndex((t) => t.id === id && t.userId === userId);

    if (travelIndex === -1) {
      throw new Error('Travel not found');
    }

    travels[travelIndex] = {
      ...travels[travelIndex],
      ...updates,
      id,
      userId,
      updatedAt: new Date(),
    };

    return travels[travelIndex];
  }

  /**
   * Delete travel
   */
  async deleteTravel(id: string, userId: string): Promise<void> {
    const travelIndex = travels.findIndex((t) => t.id === id && t.userId === userId);

    if (travelIndex === -1) {
      throw new Error('Travel not found');
    }

    travels.splice(travelIndex, 1);
  }

  /**
   * Confirm travel
   */
  async confirmTravel(id: string, userId: string): Promise<Travel> {
    const travelIndex = travels.findIndex((t) => t.id === id && t.userId === userId);

    if (travelIndex === -1) {
      throw new Error('Travel not found');
    }

    travels[travelIndex].isConfirmed = true;
    travels[travelIndex].status = 'confirmed';
    travels[travelIndex].updatedAt = new Date();

    return travels[travelIndex];
  }
}

export default new TravelService();
