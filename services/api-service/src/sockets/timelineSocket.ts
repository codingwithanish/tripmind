import { Server, Socket } from 'socket.io';
import crypto from 'crypto';
import env from '../config/env';

// Timeline node types matching frontend websocket.types.ts
interface TimelineNode {
    id: string;
    node_version: number;
    order: number;
    type: 'start' | 'end' | 'task_node' | 'representation_node';
    subtype: string | null;
    display_date: {
        type: 'date' | 'date_range' | 'time' | 'time_range';
        label: string;
        start?: string;
        end?: string;
    } | null;
    tasks?: any[];
    recommendations?: any[];
    representations?: any[];
}

interface TimelineData {
    timeline_id: string;
    version: number;
    style: string;
    configs: {
        display_price_unit: string;
        timezone: string;
    };
    nodes: TimelineNode[];
}

interface AIServiceResponse {
    status: 'success' | 'error';
    output?: {
        style: string;
        configs: {
            display_price_unit: string;
            timezone: string;
        };
        nodes: TimelineNode[];
    };
    reason?: string;
}

// Delay utility for streaming nodes
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Fetch timeline from AI service
async function fetchTimelineFromAI(timelineId: string): Promise<TimelineData> {
    try {
        console.log(`Fetching timeline from AI service for: ${timelineId}`);

        const response = await fetch(`${env.AI_SERVICE_URL}/execute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                agent_name: 'timeline_generation_agent',
                input_payload: {
                    plan_summary: {
                        travel_summary: 'Sample travel plan',
                        user_variables: [
                            { field_name: 'destination', value: 'Tokyo, Japan', type: 'mandatory' },
                            { field_name: 'travel_dates', value: 'March 2026', type: 'mandatory' },
                            { field_name: 'number_of_travelers', value: '2 (couple)', type: 'mandatory' },
                            { field_name: 'budget', value: 'Mid-range (~$8000)', type: 'mandatory' },
                        ]
                    }
                }
            })
        });

        if (!response.ok) {
            throw new Error(`AI Service error: ${response.statusText}`);
        }

        const result = await response.json() as AIServiceResponse;

        if (result.status === 'success' && result.output) {
            return {
                timeline_id: timelineId,
                version: 1,
                style: result.output.style,
                configs: result.output.configs,
                nodes: result.output.nodes.map((node) => ({
                    ...node,
                    id: node.id || crypto.randomUUID(),
                    node_version: node.node_version || 1,
                })),
            };
        }

        throw new Error(result.reason || 'Unknown error from AI Service');
    } catch (error) {
        console.error('Error fetching timeline from AI:', error);
        throw error;
    }
}

// Stream timeline nodes with delay for loading effect
async function streamTimelineToSocket(
    socket: Socket,
    timelineId: string,
    nodes: TimelineNode[],
    configs: { display_price_unit: string; timezone: string },
    style: string
): Promise<void> {
    let version = 1;

    // Sort nodes by order
    const sortedNodes = [...nodes].sort((a, b) => a.order - b.order);

    // Emit loading indicator
    socket.emit('loading');

    // Small delay before starting
    await delay(300);

    // Stream each node with a delay
    for (const node of sortedNodes) {
        version++;

        socket.emit('new-node', {
            type: 'new-node',
            data: {
                timeline_id: timelineId,
                version,
                node: {
                    ...node,
                    position: {
                        after_node_id: sortedNodes[sortedNodes.indexOf(node) - 1]?.id,
                    },
                },
            },
        });

        // Add delay between nodes for loading effect (200-400ms)
        await delay(200 + Math.random() * 200);
    }

    // Small delay before complete
    await delay(200);

    // Finally send complete timeline
    socket.emit('complete-timeline', {
        type: 'complete-timeline',
        data: {
            timeline_id: timelineId,
            version,
            style,
            configs,
            nodes: sortedNodes,
        },
    });
}

export const setupTimelineSocket = (io: Server) => {
    const timelineNamespace = io.of('/timeline');

    timelineNamespace.on('connection', (socket: Socket) => {
        console.log(`Timeline socket connected: ${socket.id}`);

        // Handle join timeline room
        socket.on('join-timeline', async (data: { timeline_id: string }) => {
            const { timeline_id } = data;
            socket.join(timeline_id);
            console.log(`Socket ${socket.id} joined timeline: ${timeline_id}`);

            try {
                // Fetch timeline from AI service
                const timelineData = await fetchTimelineFromAI(timeline_id);

                // Stream nodes with loading effect
                await streamTimelineToSocket(
                    socket,
                    timeline_id,
                    timelineData.nodes,
                    timelineData.configs,
                    timelineData.style
                );
            } catch (error) {
                console.error('Error loading timeline:', error);
                // Emit error to client
                socket.emit('error', {
                    type: 'error',
                    message: 'Failed to load timeline. Please try again.',
                });
            }
        });

        // Handle request for timeline refresh
        socket.on('request-timeline', async (data: { timeline_id: string }) => {
            const { timeline_id } = data;

            try {
                const timelineData = await fetchTimelineFromAI(timeline_id);

                // Stream with loading effect on refresh too
                await streamTimelineToSocket(
                    socket,
                    timeline_id,
                    timelineData.nodes,
                    timelineData.configs,
                    timelineData.style
                );
            } catch (error) {
                console.error('Error refreshing timeline:', error);
                socket.emit('error', {
                    type: 'error',
                    message: 'Failed to refresh timeline. Please try again.',
                });
            }
        });

        // Handle disconnect
        socket.on('disconnect', () => {
            console.log(`Timeline socket disconnected: ${socket.id}`);
        });
    });

    console.log('Timeline WebSocket namespace initialized');
};

