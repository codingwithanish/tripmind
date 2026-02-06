import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import chatService from '../services/chatService';
import threadDao from '../database/dao/threadDao';
import messageDao from '../database/dao/messageDao';
import threadContextDao, { PlanSummary } from '../database/dao/threadContextDao';

const router = Router();

// Create a new chat with initial message
// POST /api/v1/chat/new
router.post('/new', async (req: Request, res: Response) => {
    const { message } = req.body;

    // Extract user email from JWT token if available (from auth middleware)
    const userEmail = (req as any).user?.email as string | undefined;

    try {
        // Initialize new chat with database persistence and AI agent
        const result = await chatService.initializeNewChat(message || '', userEmail);

        res.json({
            success: true,
            data: {
                thread_id: result.threadId,
                user_id: result.userId,
                status: 'created',
                initial_response: {
                    message_id: result.initialMessage.id,
                    content: result.initialMessage.content,
                    type: result.initialMessage.type,
                },
            },
        });
    } catch (error) {
        console.error('Error creating new chat:', error);

        // Fallback: create thread in DB without AI agent
        try {
            const thread = await threadDao.create({
                userEmail,
                status: 'draft',
                view: 'init-chat',
            });
            const userId = userEmail || 'anonymous';

            // Store initial message
            await messageDao.createUserMessage(thread.id, userId, message || '', 'markdown');

            res.json({
                success: true,
                data: {
                    thread_id: thread.id,
                    user_id: userId,
                    status: 'created',
                },
            });
        } catch (dbError) {
            console.error('Error creating thread in database:', dbError);
            res.status(500).json({
                success: false,
                error: 'Failed to create chat thread',
            });
        }
    }
});

// Legacy: Create a new chat thread (kept for backward compatibility)
// POST /api/v1/chat/threads
router.post('/threads', async (_req: Request, res: Response) => {
    try {
        const thread = await threadDao.create({
            status: 'draft',
            view: 'init-chat',
        });

        res.json({
            success: true,
            data: {
                thread_id: thread.id,
            },
        });
    } catch (error) {
        console.error('Error creating thread:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create thread',
        });
    }
});

// Get message history with pagination
// GET /api/v1/chat/:userId/:threadId/messages
router.get('/:userId/:threadId/messages', async (req: Request, res: Response) => {
    const { threadId } = req.params;
    const { limit = '50', before, view } = req.query;

    try {
        const limitNum = parseInt(limit as string, 10);

        // Get messages from database
        const { messages } = await messageDao.findByThreadId(threadId, 1, limitNum + 1);

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

        // Get thread view
        const thread = await threadDao.findById(threadId);

        res.json({
            messages: paginatedMessages.map(m => ({
                id: m.id,
                role: m.role,
                sender_id: m.senderId,
                type: m.type,
                content: m.content,
                created_at: m.createdAt.toISOString(),
                status: m.status,
            })),
            next_cursor: nextCursor,
            view: view || thread?.view || 'init-chat'
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.json({
            messages: [],
            next_cursor: null,
            view: view || 'init-chat'
        });
    }
});

// Get suggestions for a thread
// GET /api/v1/chat/:userId/:threadId/suggestions
router.get('/:userId/:threadId/suggestions', async (req: Request, res: Response) => {
    const { userId, threadId } = req.params;

    try {
        // Get current progress from thread
        const thread = await threadDao.findById(threadId);
        const progress = thread?.timelineReadyProgress || 0;

        // Generate contextual suggestions based on progress
        const suggestionSets = [
            // Initial suggestions (0% progress)
            [
                { id: 's_1', type: 'chip', label: 'This week', icon: { provider: 'iconify', name: 'mdi:calendar' }, value: 'this_week', payload: { time: 'this_week' } },
                { id: 's_2', type: 'chip', label: 'Next month', icon: { provider: 'iconify', name: 'mdi:calendar-clock' }, value: 'next_month', payload: { time: 'next_month' } },
                { id: 's_3', type: 'chip', label: 'Flexible', icon: { provider: 'iconify', name: 'mdi:calendar-question' }, value: 'flexible', payload: { time: 'flexible' } },
            ],
            // 20% progress - budget
            [
                { id: 's_1', type: 'chip', label: 'Budget', icon: { provider: 'iconify', name: 'mdi:cash' }, value: 'budget', payload: { budget_type: 'budget' } },
                { id: 's_2', type: 'chip', label: 'Mid-range', icon: { provider: 'iconify', name: 'mdi:cash-multiple' }, value: 'midrange', payload: { budget_type: 'midrange' } },
                { id: 's_3', type: 'chip', label: 'Luxury', icon: { provider: 'iconify', name: 'mdi:star' }, value: 'luxury', payload: { budget_type: 'luxury' } },
            ],
            // 40% progress - travelers
            [
                { id: 's_1', type: 'chip', label: 'Solo', icon: { provider: 'iconify', name: 'mdi:account' }, value: 'solo', payload: { travelers: 'solo' } },
                { id: 's_2', type: 'chip', label: 'Couple', icon: { provider: 'iconify', name: 'mdi:account-multiple' }, value: 'couple', payload: { travelers: 'couple' } },
                { id: 's_3', type: 'chip', label: 'Family', icon: { provider: 'iconify', name: 'mdi:account-group' }, value: 'family', payload: { travelers: 'family' } },
            ],
            // 60% progress - activities
            [
                { id: 's_1', type: 'chip', label: 'Adventure', icon: { provider: 'iconify', name: 'mdi:hiking' }, value: 'adventure', payload: { activity: 'adventure' } },
                { id: 's_2', type: 'chip', label: 'Relaxation', icon: { provider: 'iconify', name: 'mdi:beach' }, value: 'relaxation', payload: { activity: 'relaxation' } },
                { id: 's_3', type: 'chip', label: 'Cultural', icon: { provider: 'iconify', name: 'mdi:museum' }, value: 'cultural', payload: { activity: 'cultural' } },
            ],
        ];

        const suggestionIndex = Math.min(Math.floor(progress / 20), suggestionSets.length - 1);
        const suggestions = suggestionSets[suggestionIndex];

        res.json({
            thread_id: threadId,
            user_id: userId,
            suggestions,
            expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
        });
    } catch (error) {
        console.error('Error fetching suggestions:', error);
        res.json({
            thread_id: threadId,
            user_id: userId,
            suggestions: [],
            expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        });
    }
});

// Event-based streaming chat
// POST /api/v1/chat/:userId/:threadId/stream
router.post('/:userId/:threadId/stream', async (req: Request, res: Response) => {
    const { userId, threadId } = req.params;
    const { input, options } = req.body;

    // Set headers for streaming
    res.setHeader('Content-Type', 'application/x-ndjson');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
        // Store user message in database
        await messageDao.createUserMessage(
            threadId,
            userId,
            input?.content || '',
            input?.type || 'text'
        );

        // Get all messages from database for conversation history
        const { messages: dbMessages } = await messageDao.findByThreadId(threadId, 1, 100);

        // Get current plan summary from thread context
        const threadContext = await threadContextDao.findByThreadId(threadId);
        const currentPlanSummary = threadContext?.planSummary as PlanSummary | null;

        // Build conversation history for the agent
        const conversationHistory = dbMessages.map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content
        }));

        // Call the travel planning agent
        const { travelPlanningService } = await import('../services/travelPlanningService');
        const agentResponse = await travelPlanningService.processMessage({
            conversationHistory,
            currentPlanSummary,
            latestUserMessage: input?.content || ''
        });

        // Update plan summary in thread context
        if (agentResponse.planUpdated) {
            await threadContextDao.upsert(threadId, {
                planSummary: agentResponse.planSummary,
            });
        }

        // Calculate and update progress
        let progress = 0;
        if (agentResponse.planReady) {
            progress = 100;
        } else {
            const mandatoryFields = agentResponse.planSummary.user_variables.filter(
                v => v.type === 'mandatory'
            );
            const filledFields = mandatoryFields.filter(
                v => v.value && v.value !== 'NOT_AVAILABLE'
            );
            progress = mandatoryFields.length > 0
                ? Math.round((filledFields.length / mandatoryFields.length) * 100)
                : 0;
        }
        await threadDao.updateProgress(threadId, progress);

        // Store AI response in database
        const aiMessage = await messageDao.createAssistantMessage(
            threadId,
            agentResponse.responseMessage,
            'markdown'
        );

        // Build streaming events
        const aiMsgId = aiMessage.id;
        const contentId = `content_${Date.now()}`;
        const responseText = agentResponse.responseMessage;

        const events: Array<{ event: string;[key: string]: unknown }> = [
            { event: 'message.start', message_id: aiMsgId, role: 'assistant' },
            { event: 'content.start', content_id: contentId, content_type: 'markdown' },
        ];

        // Split response into tokens for typing effect
        const words = responseText.split(' ');
        words.forEach(word => {
            events.push({
                event: 'content.token',
                content_id: contentId,
                content_type: 'markdown',
                value: word + ' '
            });
        });

        events.push({ event: 'content.end', content_id: contentId });

        // Add plan status metadata
        events.push({
            event: 'plan_status',
            plan_ready: agentResponse.planReady,
            progress: progress,
            plan_summary: agentResponse.planSummary.travel_summary
        });

        // Add suggestions if enabled and plan is not ready
        if (options?.enable_suggestions !== false && !agentResponse.planReady) {
            const suggestionItems = generateSuggestions(agentResponse.nextQuestion);
            if (suggestionItems.length > 0) {
                events.push({ event: 'suggestions', items: suggestionItems });
            }
        }

        events.push({ event: 'message.end', message_id: aiMsgId });

        // Stream events with delays
        let eventIndex = 0;
        const sendNextEvent = () => {
            if (eventIndex < events.length) {
                res.write(JSON.stringify(events[eventIndex]) + '\n');
                eventIndex++;
                const delay = events[eventIndex - 1].event === 'content.token' ? 30 : 100;
                setTimeout(sendNextEvent, delay);
            } else {
                res.end();
            }
        };

        sendNextEvent();
    } catch (error) {
        console.error('Error in chat stream:', error);

        const errorEvent = {
            event: 'error',
            message: error instanceof Error ? error.message : 'An error occurred'
        };
        res.write(JSON.stringify(errorEvent) + '\n');
        res.end();
    }
});

// Helper function to generate contextual suggestions based on agent's next question
function generateSuggestions(nextQuestion: string): Array<{ id: string; label: string; value: string }> {
    const questionLower = nextQuestion.toLowerCase();

    if (questionLower.includes('when') || questionLower.includes('date') || questionLower.includes('travel')) {
        return [
            { id: 's_1', label: 'This week', value: 'this week' },
            { id: 's_2', label: 'Next month', value: 'next month' },
            { id: 's_3', label: 'In 3 months', value: 'in about 3 months' },
            { id: 's_4', label: 'Flexible', value: 'I am flexible with dates' },
        ];
    }

    if (questionLower.includes('budget') || questionLower.includes('spend')) {
        return [
            { id: 's_1', label: 'Budget', value: 'budget-friendly, under $1000' },
            { id: 's_2', label: 'Mid-range', value: 'mid-range, around $2000-5000' },
            { id: 's_3', label: 'Luxury', value: 'luxury, no budget limit' },
        ];
    }

    if (questionLower.includes('how many') || questionLower.includes('people') || questionLower.includes('travelers')) {
        return [
            { id: 's_1', label: 'Solo', value: 'just me, solo travel' },
            { id: 's_2', label: '2 people', value: '2 people' },
            { id: 's_3', label: 'Family', value: 'family with kids' },
            { id: 's_4', label: 'Group', value: 'a group of friends' },
        ];
    }

    if (questionLower.includes('activities') || questionLower.includes('prefer') || questionLower.includes('type')) {
        return [
            { id: 's_1', label: 'Adventure', value: 'adventure and outdoor activities' },
            { id: 's_2', label: 'Relaxation', value: 'relaxation and beaches' },
            { id: 's_3', label: 'Cultural', value: 'cultural experiences and history' },
            { id: 's_4', label: 'Mix', value: 'a mix of everything' },
        ];
    }

    if (questionLower.includes('duration') || questionLower.includes('how long') || questionLower.includes('days')) {
        return [
            { id: 's_1', label: 'Weekend', value: '2-3 days, a weekend trip' },
            { id: 's_2', label: 'Week', value: 'about a week' },
            { id: 's_3', label: '2 Weeks', value: 'two weeks' },
            { id: 's_4', label: 'Longer', value: 'more than 2 weeks' },
        ];
    }

    return [];
}

// Legacy: Send a conversation message (kept for backward compatibility)
// POST /api/v1/chat/:threadId/conversations
router.post('/:threadId/conversations', async (req: Request, res: Response) => {
    const { threadId } = req.params;
    const { message } = req.body;

    try {
        // Get current progress from database
        const thread = await threadDao.findById(threadId);
        let currentProgress = thread?.timelineReadyProgress || 0;
        currentProgress = Math.min(currentProgress + 20, 100);
        await threadDao.updateProgress(threadId, currentProgress);

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Transfer-Encoding', 'chunked');

        const responses: Array<{ type: string; content: string | string[]; timeline_context_collected?: number }> = [];

        const questions = [
            `Thanks for sharing! You said: "${message}". When are you planning to travel?`,
            `Great! What's your budget for this trip?`,
            `How many people will be traveling?`,
            `What type of activities do you prefer? (Adventure, Relaxation, Cultural, etc.)`,
            `Any specific preferences for accommodation? (Luxury, Budget, Mid-range)`
        ];

        const callCount = currentProgress / 20;
        const questionIndex = Math.min(callCount - 1, questions.length - 1);

        responses.push({
            type: 'chat_response',
            content: questions[questionIndex],
            timeline_context_collected: currentProgress,
        });

        const suggestionOptions = [
            ['This week', 'Next month', 'In 3 months', 'Not sure yet'],
            ['< 10k', '10k - 50k', '50k - 100k', 'No budget limit'],
            ['Solo', '2 people', '3-5 people', 'More than 5'],
            ['Adventure', 'Relaxation', 'Cultural', 'Mix of all'],
            ['Luxury', 'Mid-range', 'Budget', 'No preference']
        ];

        responses.push({
            type: 'suggestions',
            content: suggestionOptions[questionIndex] || suggestionOptions[0],
        });

        if (currentProgress >= 100) {
            responses.push({
                type: 'chat_response',
                content: 'We have collected the required information to create your primary travel plan. Click the planning button to view your timeline.',
                timeline_context_collected: 100,
            });
        }

        let index = 0;
        const sendNextResponse = () => {
            if (index < responses.length) {
                res.write(JSON.stringify(responses[index]) + '\n');
                index++;
                setTimeout(sendNextResponse, 300);
            } else {
                res.end();
            }
        };

        sendNextResponse();
    } catch (error) {
        console.error('Error in conversation:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process conversation',
        });
    }
});

// Complete chat and generate timeline
// POST /api/v1/chat/:sessionId/complete
router.post('/:sessionId/complete', (req: Request, res: Response) => {
    const { sessionId: _sessionId } = req.params;

    res.json({
        success: true,
        data: {
            travelId: crypto.randomUUID(),
            timelineId: crypto.randomUUID(),
        },
    });
});

export default router;
