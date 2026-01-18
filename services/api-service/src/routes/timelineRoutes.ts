import { Router, Request, Response } from 'express';
import crypto from 'crypto';

const router = Router();

// Get timeline for a travel
// GET /api/v1/timelines/:travelId
router.get('/:travelId', (req: Request, res: Response) => {
    const { travelId } = req.params;

    // Generate dummy timeline data
    const timeline = {
        id: crypto.randomUUID(),
        travelId,
        generatedAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        items: [
            {
                id: crypto.randomUUID(),
                type: 'preparation',
                title: 'Apply for Visa',
                description: 'Submit visa application with required documents',
                date: '2025-02-01',
                time: '10:00',
                cost: 160,
                currency: 'USD',
                status: 'pending',
                order: 1,
                details: {
                    location: 'Embassy',
                    notes: 'Bring passport photos'
                }
            },
            {
                id: crypto.randomUUID(),
                type: 'flight',
                title: 'Book Flight Tickets',
                description: 'Round trip flight booking',
                date: '2025-02-15',
                time: '08:00',
                cost: 850,
                currency: 'USD',
                status: 'pending',
                order: 2,
                details: {
                    location: 'JFK → Destination',
                    bookingReference: 'TBD'
                }
            },
            {
                id: crypto.randomUUID(),
                type: 'hotel',
                title: 'Book Accommodation',
                description: 'Hotel reservation for 7 nights',
                date: '2025-02-20',
                time: '14:00',
                cost: 700,
                currency: 'USD',
                status: 'pending',
                order: 3,
                details: {
                    location: 'City Center Hotel',
                    confirmationNumber: 'TBD'
                }
            },
            {
                id: crypto.randomUUID(),
                type: 'activity',
                title: 'City Tour',
                description: 'Guided tour of major attractions',
                date: '2025-03-01',
                time: '09:00',
                cost: 75,
                currency: 'USD',
                status: 'pending',
                order: 4,
                details: {
                    location: 'Downtown',
                    notes: 'Wear comfortable shoes'
                }
            },
            {
                id: crypto.randomUUID(),
                type: 'restaurant',
                title: 'Welcome Dinner',
                description: 'Traditional cuisine experience',
                date: '2025-03-01',
                time: '19:00',
                cost: 50,
                currency: 'USD',
                status: 'pending',
                order: 5,
                details: {
                    location: 'Local Restaurant',
                    notes: 'Try the local specialties'
                }
            },
            {
                id: crypto.randomUUID(),
                type: 'activity',
                title: 'Museum Visit',
                description: 'National Museum guided tour',
                date: '2025-03-02',
                time: '10:00',
                cost: 25,
                currency: 'USD',
                status: 'pending',
                order: 6,
                details: {
                    location: 'National Museum'
                }
            },
            {
                id: crypto.randomUUID(),
                type: 'transport',
                title: 'Airport Transfer',
                description: 'Return transfer to airport',
                date: '2025-03-07',
                time: '06:00',
                cost: 40,
                currency: 'USD',
                status: 'pending',
                order: 7,
                details: {
                    location: 'Hotel to Airport'
                }
            }
        ]
    };

    res.json({
        success: true,
        data: timeline
    });
});

// Generate timeline from chat
// POST /api/v1/timelines/:travelId
router.post('/:travelId', (req: Request, res: Response) => {
    const { travelId } = req.params;

    // Return same dummy data for now
    res.json({
        success: true,
        data: {
            id: crypto.randomUUID(),
            travelId,
            generatedAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            items: []
        }
    });
});

export default router;
