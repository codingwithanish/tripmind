import { Router, Request, Response } from 'express';
import crypto from 'crypto';

const router = Router();

// In-memory stores (temporary - will be replaced with DB)
const threadProgress: Map<string, number> = new Map();
const threadMessages: Map<string, Array<{
    id: string;
    role: 'user' | 'assistant';
    sender_id: string;
    type: 'text' | 'markdown';
    content: string;
    created_at: string;
    status: string;
}>> = new Map();
const threadSuggestions: Map<string, Array<{
    id: string;
    type: string;
    label: string;
    icon: { provider: string; name: string };
    value: string;
    payload: Record<string, string>;
}>> = new Map();

// Create a new chat with initial message
// POST /api/v1/chat/new
router.post('/new', (req: Request, res: Response) => {
    const { message } = req.body;

    // Generate thread and user IDs
    const threadId = crypto.randomUUID();
    const userId = 'anonymous'; // For now, always anonymous

    // Initialize progress and store initial message
    threadProgress.set(threadId, 0);
    threadMessages.set(threadId, [{
        id: `msg_${Date.now()}`,
        role: 'user',
        sender_id: userId,
        type: 'markdown',
        content: message || '',
        created_at: new Date().toISOString(),
        status: 'sent'
    }]);

    // Initialize suggestions
    threadSuggestions.set(threadId, []);

    res.json({
        success: true,
        data: {
            thread_id: threadId,
            user_id: userId,
            status: 'created',
        },
    });
});

// Legacy: Create a new chat thread (kept for backward compatibility)
// POST /api/v1/chat/threads
router.post('/threads', (_req: Request, res: Response) => {
    const threadId = crypto.randomUUID();
    threadProgress.set(threadId, 0);
    threadMessages.set(threadId, []);
    threadSuggestions.set(threadId, []);

    res.json({
        success: true,
        data: {
            thread_id: threadId,
        },
    });
});

// Get message history with pagination
// GET /api/v1/chat/:userId/:threadId/messages
router.get('/:userId/:threadId/messages', (req: Request, res: Response) => {
    const { threadId } = req.params;
    const { limit = '50', before, view } = req.query;

    const messages = threadMessages.get(threadId) || [];
    const limitNum = parseInt(limit as string, 10);

    // Filter by cursor if provided
    let filteredMessages = messages;
    if (before) {
        const beforeIndex = messages.findIndex(m => m.id === before);
        if (beforeIndex > 0) {
            filteredMessages = messages.slice(0, beforeIndex);
        }
    }

    // Apply limit
    const paginatedMessages = filteredMessages.slice(-limitNum);

    // Determine next cursor
    const nextCursor = paginatedMessages.length > 0 && paginatedMessages.length < filteredMessages.length
        ? paginatedMessages[0].id
        : null;

    res.json({
        messages: paginatedMessages,
        next_cursor: nextCursor,
        view: view || 'init-chat'
    });
});

// Get suggestions for a thread
// GET /api/v1/chat/:userId/:threadId/suggestions
router.get('/:userId/:threadId/suggestions', (req: Request, res: Response) => {
    const { userId, threadId } = req.params;

    // Get current progress to determine appropriate suggestions
    const progress = threadProgress.get(threadId) || 0;

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
});

// Event-based streaming chat
// POST /api/v1/chat/:userId/:threadId/stream
router.post('/:userId/:threadId/stream', (req: Request, res: Response) => {
    const { userId, threadId } = req.params;
    const { input, options } = req.body;

    // Set headers for streaming
    res.setHeader('Content-Type', 'application/x-ndjson');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Store user message
    const messages = threadMessages.get(threadId) || [];
    const userMsgId = `msg_${Date.now()}`;
    messages.push({
        id: userMsgId,
        role: 'user',
        sender_id: userId,
        type: input?.type || 'text',
        content: input?.content || '',
        created_at: new Date().toISOString(),
        status: 'sent'
    });
    threadMessages.set(threadId, messages);

    // Update progress
    let progress = threadProgress.get(threadId) || 0;
    progress = Math.min(progress + 20, 100);
    threadProgress.set(threadId, progress);

    // Generate AI response
    const aiMsgId = `msg_${Date.now() + 1}`;
    const contentId = `content_${Date.now()}`;

    // Contextual responses based on progress
    const responses = [
        `Thanks for sharing! You said: "${input?.content}". **When are you planning to travel?** I can help find the best options for your timeline.`,
        `Great choice! **What's your budget** for this trip? This helps me find accommodations and activities that fit your needs.`,
        `Perfect! **How many people** will be traveling? This affects recommendations for transportation and lodging.`,
        `*Wonderful!* **What type of activities** do you prefer? Adventure, relaxation, cultural experiences, or a mix?`,
        `Almost there! **Any specific preferences** for accommodation? Luxury hotels, cozy B&Bs, or budget-friendly options?`,
    ];

    const responseIndex = Math.min(Math.floor(progress / 20) - 1, responses.length - 1);
    const responseText = responses[Math.max(0, responseIndex)];

    // Simulate streaming with events
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

    // Add suggestions if enabled
    if (options?.enable_suggestions !== false) {
        const suggestionItems = [
            { id: 's_1', label: 'Option A', value: 'option_a' },
            { id: 's_2', label: 'Option B', value: 'option_b' },
            { id: 's_3', label: 'Option C', value: 'option_c' },
        ];
        events.push({ event: 'suggestions', items: suggestionItems });
    }

    events.push({ event: 'message.end', message_id: aiMsgId });

    // Store AI message
    messages.push({
        id: aiMsgId,
        role: 'assistant',
        sender_id: 'ai_system',
        type: 'markdown',
        content: responseText,
        created_at: new Date().toISOString(),
        status: 'delivered'
    });
    threadMessages.set(threadId, messages);

    // Stream events with delays
    let eventIndex = 0;
    const sendNextEvent = () => {
        if (eventIndex < events.length) {
            res.write(JSON.stringify(events[eventIndex]) + '\n');
            eventIndex++;
            // Faster for content tokens, slower for structural events
            const delay = events[eventIndex - 1].event === 'content.token' ? 30 : 100;
            setTimeout(sendNextEvent, delay);
        } else {
            res.end();
        }
    };

    sendNextEvent();
});

// Legacy: Send a conversation message (kept for backward compatibility)
// POST /api/v1/chat/:threadId/conversations
router.post('/:threadId/conversations', (req: Request, res: Response) => {
    const { threadId } = req.params;
    const { message } = req.body;

    let currentProgress = threadProgress.get(threadId) || 0;
    currentProgress = Math.min(currentProgress + 20, 100);
    threadProgress.set(threadId, currentProgress);

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
