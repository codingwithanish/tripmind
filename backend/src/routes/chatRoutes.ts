import { Router, Request, Response } from 'express';
import crypto from 'crypto';

const router = Router();

// In-memory store for thread progress (temporary - will be replaced with DB)
const threadProgress: Map<string, number> = new Map();

// Create a new chat thread
// POST /api/v1/chat/threads
router.post('/threads', (_req: Request, res: Response) => {
    // Generate a dummy thread ID for now
    const threadId = crypto.randomUUID();

    // Initialize progress for this thread
    threadProgress.set(threadId, 0);

    res.json({
        success: true,
        data: {
            thread_id: threadId,
        },
    });
});

// Send a conversation message (with streaming response)
// POST /api/v1/chat/:threadId/conversations
router.post('/:threadId/conversations', (req: Request, res: Response) => {
    const { threadId } = req.params;
    const { message } = req.body;

    // Get current progress and increment by 20% (max 100%)
    let currentProgress = threadProgress.get(threadId) || 0;
    currentProgress = Math.min(currentProgress + 20, 100);
    threadProgress.set(threadId, currentProgress);

    // Set headers for streaming
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Transfer-Encoding', 'chunked');

    // Build responses based on progress
    const responses: Array<{ type: string; content: string | string[]; timeline_context_collected?: number }> = [];

    // Different follow-up questions based on progress
    const questions = [
        `Thanks for sharing! You said: "${message}". When are you planning to travel?`,
        `Great! What's your budget for this trip?`,
        `How many people will be traveling?`,
        `What type of activities do you prefer? (Adventure, Relaxation, Cultural, etc.)`,
        `Any specific preferences for accommodation? (Luxury, Budget, Mid-range)`
    ];

    // Select question based on call count (progress / 20 - 1)
    const callCount = currentProgress / 20;
    const questionIndex = Math.min(callCount - 1, questions.length - 1);

    // Add chat response with timeline_context_collected
    responses.push({
        type: 'chat_response',
        content: questions[questionIndex],
        timeline_context_collected: currentProgress,
    });

    // Add suggestions based on the question
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

    // If progress is 100%, add the readiness message
    if (currentProgress >= 100) {
        responses.push({
            type: 'chat_response',
            content: 'We have collected the required information to create your primary travel plan. Click the planning button to view your timeline. You can also continue chatting to provide additional details, and the plan will be refined based on that information.',
            timeline_context_collected: 100,
        });
    }

    // Send responses with small delays to simulate streaming
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

    // Return dummy IDs for now
    res.json({
        success: true,
        data: {
            travelId: crypto.randomUUID(),
            timelineId: crypto.randomUUID(),
        },
    });
});

export default router;

