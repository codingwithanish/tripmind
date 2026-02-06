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

