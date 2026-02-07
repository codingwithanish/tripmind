import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { timelineGenerationService } from '../services/timelineGenerationService';

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

// Generate timeline from thread's plan summary
// POST /api/v1/timelines/:threadId/generate
router.post('/:threadId/generate', async (req: Request, res: Response) => {
    const { threadId } = req.params;

    try {
        const result = await timelineGenerationService.generateAndSaveTimeline(threadId);

        res.json({
            success: true,
            data: {
                timeline_id: result.timelineId,
                ...result.timeline
            }
        });
    } catch (error: any) {
        console.error('Timeline generation error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to generate timeline'
        });
    }
});

// Legacy endpoint - Generate timeline from chat (kept for backward compatibility)
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

// ===== TIMELINE CHAT ENDPOINTS =====

import messageDao from '../database/dao/messageDao';
import suggestionService from '../services/suggestionService';

// ===== ELEMENT SEARCH ENDPOINT =====

interface SearchRequest {
    category: string;
    description: string;
    context?: {
        dates?: { start?: string; end?: string };
        location?: string;
        travelers?: number;
        budget?: { min?: number; max?: number; currency?: string };
    };
}

// Dummy data functions (will be replaced with AI service call)
function getDummyFlightResults() {
    return {
        category: "flight-booking",
        featured: {
            id: crypto.randomUUID(),
            airline: "Emirates",
            airline_logo: "https://logos-world.net/wp-content/uploads/2020/03/Emirates-Logo.png",
            flight_number: "EK505",
            departure_airport: "JFK",
            arrival_airport: "DXB",
            departure_time: "2026-03-15T22:00:00",
            arrival_time: "2026-03-16T19:30:00",
            departure_date: "March 15, 2026",
            duration: "13h 30m",
            stops: 0,
            stops_description: "Direct",
            price: 1249.00,
            currency: "USD",
            booking_url: "https://www.emirates.com",
            cabin_class: "Economy"
        },
        alternatives: [
            {
                id: crypto.randomUUID(),
                airline: "Qatar Airways",
                airline_logo: "https://logos-world.net/wp-content/uploads/2020/03/Qatar-Airways-Logo.png",
                flight_number: "QR702",
                departure_airport: "JFK",
                arrival_airport: "DOH",
                departure_time: "2026-03-15T20:15:00",
                arrival_time: "2026-03-16T16:45:00",
                departure_date: "March 15, 2026",
                duration: "12h 30m",
                stops: 0,
                stops_description: "Direct",
                price: 1189.00,
                currency: "USD",
                booking_url: "https://www.qatarairways.com",
                cabin_class: "Economy"
            },
            {
                id: crypto.randomUUID(),
                airline: "Turkish Airlines",
                airline_logo: "https://logos-world.net/wp-content/uploads/2020/11/Turkish-Airlines-Logo.png",
                flight_number: "TK12",
                departure_airport: "JFK",
                arrival_airport: "IST",
                departure_time: "2026-03-15T23:30:00",
                arrival_time: "2026-03-16T17:00:00",
                departure_date: "March 15, 2026",
                duration: "10h 30m",
                stops: 1,
                stops_description: "1 stop via Istanbul",
                price: 899.00,
                currency: "USD",
                booking_url: "https://www.turkishairlines.com",
                cabin_class: "Economy"
            },
            {
                id: crypto.randomUUID(),
                airline: "Lufthansa",
                airline_logo: "https://logos-world.net/wp-content/uploads/2020/10/Lufthansa-Logo.png",
                flight_number: "LH401",
                departure_airport: "JFK",
                arrival_airport: "FRA",
                departure_time: "2026-03-15T18:00:00",
                arrival_time: "2026-03-16T07:30:00",
                departure_date: "March 15, 2026",
                duration: "7h 30m",
                stops: 0,
                stops_description: "Direct",
                price: 1099.00,
                currency: "USD",
                booking_url: "https://www.lufthansa.com",
                cabin_class: "Economy"
            }
        ]
    };
}

function getDummyHotelResults() {
    return {
        category: "hotel-booking",
        featured: {
            id: crypto.randomUUID(),
            name: "The Ritz-Carlton Tokyo",
            image_url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
            location: "Tokyo Midtown, Roppongi, Tokyo",
            rating: 5.0,
            review_score: 9.4,
            review_count: 2847,
            price_per_night: 450.00,
            currency: "USD",
            amenities: ["Free WiFi", "Spa", "Fitness Center", "Restaurant", "Pool"],
            booking_url: "https://www.ritzcarlton.com/tokyo",
            room_type: "Deluxe Room"
        },
        alternatives: [
            {
                id: crypto.randomUUID(),
                name: "Park Hyatt Tokyo",
                image_url: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
                location: "Shinjuku, Tokyo",
                rating: 5.0,
                review_score: 9.2,
                review_count: 1923,
                price_per_night: 520.00,
                currency: "USD",
                amenities: ["Free WiFi", "Spa", "Pool", "Restaurant"],
                booking_url: "https://www.hyatt.com/parkhyatt/tokyo",
                room_type: "Park Room"
            },
            {
                id: crypto.randomUUID(),
                name: "Hotel Gracery Shinjuku",
                image_url: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800",
                location: "Kabukicho, Shinjuku, Tokyo",
                rating: 4.0,
                review_score: 8.5,
                review_count: 5234,
                price_per_night: 120.00,
                currency: "USD",
                amenities: ["Free WiFi", "Restaurant", "Godzilla Statue"],
                booking_url: "https://gracery.com/shinjuku",
                room_type: "Standard Room"
            }
        ]
    };
}

function getDummyRestaurantResults() {
    return {
        category: "restaurants",
        featured: {
            id: crypto.randomUUID(),
            name: "Sukiyabashi Jiro",
            image_url: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800",
            cuisine: "Japanese Sushi",
            location: "Ginza, Tokyo",
            rating: 4.9,
            price_level: "$$$$",
            review_count: 1247,
            booking_url: "https://jiro.jp/reservation",
            opening_hours: "11:30 AM - 2:00 PM, 5:30 PM - 8:30 PM"
        },
        alternatives: [
            {
                id: crypto.randomUUID(),
                name: "Ichiran Ramen",
                image_url: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800",
                cuisine: "Ramen",
                location: "Shibuya, Tokyo",
                rating: 4.5,
                price_level: "$",
                review_count: 8234,
                booking_url: null,
                opening_hours: "24 hours"
            }
        ]
    };
}

function getDummyGeneralResults(category: string) {
    return {
        category: category,
        items: [
            {
                id: crypto.randomUUID(),
                title: "Important Travel Tips",
                description: "Remember to bring your passport, check visa requirements, and download offline maps.",
                icon: "mdi:information",
                action_url: null,
                action_label: null
            },
            {
                id: crypto.randomUUID(),
                title: "Local Currency",
                description: "The local currency is Japanese Yen (JPY). Credit cards are widely accepted in major cities.",
                icon: "mdi:currency-jpy",
                action_url: null,
                action_label: null
            }
        ]
    };
}

// POST /api/v1/timeline/search
// Search for element details based on category
router.post('/search', async (req: Request, res: Response) => {
    const { category, description, context } = req.body as SearchRequest;

    if (!category) {
        return res.status(400).json({
            success: false,
            error: 'Category is required'
        });
    }

    try {
        // For now, return dummy data based on category
        // Later this will call the AI service search_agent
        const categoryLower = category.toLowerCase().replace(/-/g, '_').replace(/ /g, '_');

        let results;
        if (categoryLower.includes('flight')) {
            results = getDummyFlightResults();
        } else if (categoryLower.includes('hotel') || categoryLower.includes('accommodation')) {
            results = getDummyHotelResults();
        } else if (categoryLower.includes('restaurant') || categoryLower.includes('dining') || categoryLower.includes('food')) {
            results = getDummyRestaurantResults();
        } else {
            results = getDummyGeneralResults(category);
        }

        res.json({
            success: true,
            data: results
        });
    } catch (error: any) {
        console.error('Search error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Search failed'
        });
    }
});

// Get timeline messages (filtered by timeline_generation stage)
// GET /api/v1/timeline/:threadId/messages
router.get('/:threadId/messages', async (req: Request, res: Response) => {
    const { threadId } = req.params;
    const { limit = '50', before } = req.query;

    try {
        const limitNum = parseInt(limit as string, 10);

        // Get messages filtered by timeline_generation stage
        const { messages, total } = await messageDao.findByThreadIdAndStage(
            threadId,
            'timeline_generation' as any, // Will work once Prisma client is regenerated
            1,
            limitNum + 1
        );

        // Filter by cursor if provided
        let filteredMessages = messages;
        if (before) {
            const beforeIndex = messages.findIndex(m => m.id === before);
            if (beforeIndex > 0) {
                filteredMessages = messages.slice(0, beforeIndex);
            }
        }

        // Apply limit
        const paginatedMessages = filteredMessages.slice(0, limitNum);

        // Determine next cursor
        const nextCursor = messages.length > limitNum ? messages[limitNum].id : null;

        res.json({
            messages: paginatedMessages.map(m => ({
                id: m.id,
                role: m.role,
                sender_id: m.senderId,
                type: m.type,
                content: m.content,
                created_at: m.createdAt.toISOString(),
                status: m.status,
                help_context: (m as any).helpContext || null,
            })),
            next_cursor: nextCursor,
            total,
        });
    } catch (error) {
        console.error('Error fetching timeline messages:', error);
        res.json({
            messages: [],
            next_cursor: null,
            total: 0,
        });
    }
});

// Timeline conversation endpoint (with message stage tracking)
// POST /api/v1/timeline/:threadId/conversations
router.post('/:threadId/conversations', async (req: Request, res: Response) => {
    const { threadId } = req.params;
    const { message, helpContext } = req.body;

    // Extract user ID from JWT token if available
    const userEmail = (req as any).user?.email as string | undefined;
    const userId = userEmail || 'anonymous';

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Transfer-Encoding', 'chunked');

    try {
        // Save user message with timeline_generation stage
        await messageDao.createUserMessage(
            threadId,
            userId,
            message,
            'markdown',
            'timeline_generation' as any, // Will work once Prisma client is regenerated
            helpContext || undefined
        );

        // Get all timeline_generation messages for context
        const { messages: dbMessages } = await messageDao.findByThreadIdAndStage(
            threadId,
            'timeline_generation' as any,
            1,
            50
        );

        // Build conversation history
        const conversationHistory = dbMessages.map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content
        }));

        // Generate AI response (simplified for now - can be enhanced with timeline-specific agent)
        const responseMessage = helpContext
            ? `I see you need help with "${helpContext?.node?.displayTitle || 'this item'}". Let me assist you with that. What specific questions do you have about this part of your timeline?`
            : `I understand. Based on your timeline, I can help you with this. Would you like me to provide more details or suggest alternatives?`;

        // Generate suggestions
        const suggestionItems = await suggestionService.generateChatSuggestions(
            conversationHistory,
            'Timeline refinement',
            responseMessage,
            100
        );

        // Save AI response with timeline_generation stage
        await messageDao.createAssistantMessage(
            threadId,
            responseMessage,
            'markdown',
            {
                suggestions: suggestionItems.length > 0 ? suggestionItems : undefined,
            },
            'timeline_generation' as any
        );

        // Stream responses
        const responses: Array<{ type: string; content: string | any[]; timeline_context_collected?: number }> = [];

        responses.push({
            type: 'chat_response',
            content: responseMessage,
            timeline_context_collected: 100,
        });

        if (suggestionItems.length > 0) {
            responses.push({
                type: 'suggestions',
                content: suggestionItems.map(s => s.label),
            });
        }

        let index = 0;
        const sendNextResponse = () => {
            if (index < responses.length) {
                res.write(JSON.stringify(responses[index]) + '\n');
                index++;
                setTimeout(sendNextResponse, 100);
            } else {
                res.end();
            }
        };

        sendNextResponse();
    } catch (error) {
        console.error('Error in timeline conversation:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process conversation',
        });
    }
});

// ===== NOTIFICATIONS ENDPOINTS =====

// In-memory notifications store
const timelineNotifications: Map<string, Array<{
    id: string;
    severity: 'severe' | 'medium' | 'low';
    title: string;
    message: string;
    created_at: string;
}>> = new Map();

// Initialize with dummy data
const initNotifications = (threadId: string) => {
    if (!timelineNotifications.has(threadId)) {
        timelineNotifications.set(threadId, [
            {
                id: 'notif_1',
                severity: 'severe',
                title: 'Visa Application Deadline',
                message: 'Your visa application deadline is in 3 days. Make sure to submit all required documents.',
                created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            },
            {
                id: 'notif_2',
                severity: 'medium',
                title: 'Flight Price Change',
                message: 'The flight prices for your selected route have increased by 15%.',
                created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            },
            {
                id: 'notif_3',
                severity: 'low',
                title: 'Weather Update',
                message: 'The weather forecast for your destination shows sunny conditions during your travel dates.',
                created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
            },
        ]);
    }
    return timelineNotifications.get(threadId)!;
};

// GET /api/v1/timeline/:userId/:threadId/notifications
router.get('/:userId/:threadId/notifications', (req: Request, res: Response) => {
    const { threadId } = req.params;
    const notifications = initNotifications(threadId);

    res.json({
        notifications,
        total: notifications.length
    });
});

// DELETE /api/v1/timeline/:userId/:threadId/notifications/:notificationId
router.delete('/:userId/:threadId/notifications/:notificationId', (req: Request, res: Response) => {
    const { threadId, notificationId } = req.params;
    const notifications = initNotifications(threadId);
    const index = notifications.findIndex(n => n.id === notificationId);

    if (index > -1) {
        notifications.splice(index, 1);
        timelineNotifications.set(threadId, notifications);
    }

    res.json({ success: true });
});

// ===== SETTINGS / VERSION ENDPOINTS =====

// In-memory versions store
const timelineVersions: Map<string, Array<{
    id: string;
    name: string;
    created_at: string;
    is_current: boolean;
}>> = new Map();

// Initialize with dummy versions
const initVersions = (threadId: string) => {
    if (!timelineVersions.has(threadId)) {
        timelineVersions.set(threadId, [
            {
                id: 'v1',
                name: 'Initial Version',
                created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                is_current: true,
            }
        ]);
    }
    return timelineVersions.get(threadId)!;
};

// GET /api/v1/timeline/:userId/:threadId/versions
router.get('/:userId/:threadId/versions', (req: Request, res: Response) => {
    const { threadId } = req.params;
    const versions = initVersions(threadId);

    res.json({ versions });
});

// POST /api/v1/timeline/:userId/:threadId/versions - Create new version
router.post('/:userId/:threadId/versions', (req: Request, res: Response) => {
    const { threadId } = req.params;
    const { name } = req.body;
    const versions = initVersions(threadId);

    // Mark all current as not current
    versions.forEach(v => v.is_current = false);

    // Create new version
    const newVersion = {
        id: `v${versions.length + 1}`,
        name: name || `Version ${versions.length + 1}`,
        created_at: new Date().toISOString(),
        is_current: true,
    };
    versions.push(newVersion);
    timelineVersions.set(threadId, versions);

    res.json({ success: true, version: newVersion });
});

// PUT /api/v1/timeline/:userId/:threadId/version - Switch version
router.put('/:userId/:threadId/version', (req: Request, res: Response) => {
    const { threadId } = req.params;
    const { version_id } = req.body;
    const versions = initVersions(threadId);

    versions.forEach(v => v.is_current = v.id === version_id);
    timelineVersions.set(threadId, versions);

    res.json({ success: true });
});

// POST /api/v1/timeline/:userId/:threadId/confirm - Confirm timeline
router.post('/:userId/:threadId/confirm', (req: Request, res: Response) => {
    const { threadId } = req.params;
    console.log(`Timeline ${threadId} confirmed`);

    res.json({ success: true, message: 'Timeline confirmed' });
});

// DELETE /api/v1/timeline/:userId/:threadId - Delete timeline
router.delete('/:userId/:threadId', (req: Request, res: Response) => {
    const { threadId } = req.params;
    console.log(`Timeline ${threadId} deleted`);

    // Clean up data
    timelineNotifications.delete(threadId);
    timelineVersions.delete(threadId);

    res.json({ success: true, message: 'Timeline deleted' });
});

export default router;

