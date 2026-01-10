import { Router, Request, Response } from 'express';
import crypto from 'crypto';

const router = Router();

// Create a new chat thread
// POST /api/v1/chat/threads
router.post('/threads', (_req: Request, res: Response) => {
    // Generate a dummy thread ID for now
    const threadId = crypto.randomUUID();

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
    const { threadId: _threadId } = req.params;
    const { message } = req.body;

    // Set headers for streaming
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Transfer-Encoding', 'chunked');

    // Simulate streaming responses
    const responses = [
        {
            type: 'chat_response',
            content: `Thanks for sharing! You said: "${message}". When are you planning to travel?`,
        },
        {
            type: 'suggestions',
            content: ['This week', 'Next month', 'In 3 months', 'Not sure yet'],
        },
        {
            type: 'status_change',
            content: {
                timeline_ready: false,
            },
        },
    ];

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
