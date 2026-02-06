import { Server, Socket } from 'socket.io';
import crypto from 'crypto';
import env from '../config/env';
import { timelineDao } from '../database/dao/timelineDao';
import { threadDao } from '../database/dao/threadDao';
import { threadContextDao, PlanSummary } from '../database/dao/threadContextDao';
import { NodeType } from '@prisma/client';

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

// Map database node type to frontend type
function mapNodeTypeToFrontend(type: NodeType): 'start' | 'end' | 'task_node' | 'representation_node' {
    switch (type) {
        case 'start': return 'start';
        case 'end': return 'end';
        case 'action': return 'task_node';
        case 'representation': return 'representation_node';
        case 'task_node': return 'task_node';
        case 'representation_node': return 'representation_node';
        case 'additional_input': return 'task_node';
        default: return 'task_node';
    }
}

// Convert database timeline to frontend format
function convertDbTimelineToData(dbTimeline: any, timelineId: string): TimelineData {
    return {
        timeline_id: timelineId,
        version: 1,
        style: dbTimeline.renderingStyle || 'default',
        configs: {
            display_price_unit: 'USD',
            timezone: 'UTC',
        },
        nodes: dbTimeline.nodes.map((node: any) => ({
            id: node.id,
            node_version: node.nodeVersion || 1,
            order: node.order,
            type: mapNodeTypeToFrontend(node.type),
            subtype: node.subtype,
            display_date: node.displayDateType ? {
                type: node.displayDateType,
                label: node.displayDateLabel || '',
                start: node.displayDateStart?.toISOString(),
                end: node.displayDateEnd?.toISOString(),
            } : null,
            tasks: node.elements
                ?.filter((e: any) => e.elementType === 'task')
                .map((e: any) => ({
                    id: e.id,
                    priority: e.priority,
                    title: e.title,
                    title_image: e.elementIcon?.name,
                    description: e.description,
                    price: e.priceRange ? {
                        type: e.priceRange.type,
                        unit: e.priceRange.currency || 'USD',
                        confirmed_price: e.priceRange.confirmed,
                        min: e.priceRange.min,
                        max: e.priceRange.max,
                        range: e.priceRange.min && e.priceRange.max ? {
                            min: e.priceRange.min,
                            max: e.priceRange.max,
                        } : undefined,
                    } : undefined,
                })) || [],
            recommendations: node.elements
                ?.filter((e: any) => e.elementType === 'recommendation')
                .map((e: any) => ({
                    id: e.id,
                    type: e.elementCategory,
                    priority: e.priority,
                    title: e.title,
                    title_image: e.elementIcon?.name,
                    description: e.description,
                    price_included: !!e.priceRange,
                    price_info: e.priceRange ? {
                        type: e.priceRange.type,
                        unit: e.priceRange.currency || 'USD',
                        confirmed_price: e.priceRange.confirmed,
                        min: e.priceRange.min,
                        max: e.priceRange.max,
                        range: e.priceRange.min && e.priceRange.max ? {
                            min: e.priceRange.min,
                            max: e.priceRange.max,
                        } : undefined,
                    } : undefined,
                })) || [],
            representations: node.type === 'representation' || node.type === 'representation_node' ? [{
                title: node.displayTitle || '',
                description: node.displaySubtitle,
                icon: node.displayIcon?.name,
            }] : undefined,
        })),
    };
}

// Load timeline from database
async function loadTimelineFromDatabase(threadId: string): Promise<TimelineData | null> {
    try {
        console.log(`Checking database for timeline (thread: ${threadId})`);

        // Get thread to check if timeline exists
        const thread = await threadDao.findById(threadId);
        if (!thread?.timelineId) {
            console.log('No timeline associated with thread');
            return null;
        }

        // Load timeline with nodes and elements
        const dbTimeline = await timelineDao.findByIdWithNodesAndElements(thread.timelineId);
        if (!dbTimeline || dbTimeline.nodes.length === 0) {
            console.log('Timeline exists but has no nodes');
            return null;
        }

        console.log(`Loaded timeline from database: ${dbTimeline.id} with ${dbTimeline.nodes.length} nodes`);
        return convertDbTimelineToData(dbTimeline, threadId);
    } catch (error) {
        console.error('Error loading timeline from database:', error);
        return null;
    }
}

// Fetch timeline from AI service and save to database
async function fetchTimelineFromAIAndSave(threadId: string): Promise<TimelineData> {
    try {
        console.log(`Fetching timeline from AI service for thread: ${threadId}`);

        // Get plan summary from thread context
        const threadContext = await threadContextDao.findByThreadId(threadId);
        const planSummary = threadContext?.planSummary as PlanSummary | null;

        // Use default if no plan summary
        const requestPayload = planSummary ? {
            travel_summary: planSummary.travel_summary,
            user_variables: planSummary.user_variables,
        } : {
            travel_summary: 'Sample travel plan',
            user_variables: [
                { field_name: 'destination', value: 'Tokyo, Japan', type: 'mandatory' },
                { field_name: 'travel_dates', value: 'March 2026', type: 'mandatory' },
                { field_name: 'number_of_travelers', value: '2 (couple)', type: 'mandatory' },
                { field_name: 'budget', value: 'Mid-range (~$8000)', type: 'mandatory' },
            ]
        };

        const response = await fetch(`${env.AI_SERVICE_URL}/execute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                agent_name: 'timeline_generation_agent',
                input_payload: { plan_summary: requestPayload }
            })
        });

        if (!response.ok) {
            throw new Error(`AI Service error: ${response.statusText}`);
        }

        const result = await response.json() as AIServiceResponse;

        if (result.status !== 'success' || !result.output) {
            throw new Error(result.reason || 'Unknown error from AI Service');
        }

        // Convert AI response to timeline data format
        const timelineData: TimelineData = {
            timeline_id: threadId,
            version: 1,
            style: result.output.style,
            configs: result.output.configs,
            nodes: result.output.nodes.map((node) => ({
                ...node,
                id: node.id || crypto.randomUUID(),
                node_version: node.node_version || 1,
            })),
        };

        // Save timeline to database
        await saveTimelineToDatabase(threadId, timelineData);

        return timelineData;
    } catch (error) {
        console.error('Error fetching timeline from AI:', error);
        throw error;
    }
}

// Save timeline to database
async function saveTimelineToDatabase(threadId: string, timelineData: TimelineData): Promise<void> {
    try {
        console.log(`Saving timeline to database for thread: ${threadId}`);

        // Create timeline record
        const timeline = await timelineDao.create({
            renderingStyle: timelineData.style,
            status: 'draft',
        });

        // Save nodes and elements
        for (const node of timelineData.nodes) {
            const nodeType = mapNodeTypeToDb(node.type);

            const createdNode = await timelineDao.createNode({
                timelineId: timeline.id,
                order: node.order,
                type: nodeType,
                subtype: node.subtype || undefined,
                displayDateType: node.display_date?.type as any,
                displayDateLabel: node.display_date?.label,
                displayDateStart: node.display_date?.start ? new Date(node.display_date.start) : undefined,
                displayDateEnd: node.display_date?.end ? new Date(node.display_date.end) : undefined,
                displayTitle: node.representations?.[0]?.title,
                displaySubtitle: node.representations?.[0]?.description,
                displayIcon: node.representations?.[0]?.icon ? { provider: 'iconify', name: node.representations[0].icon } : undefined,
            });

            // Save tasks as elements
            if (node.tasks) {
                for (let i = 0; i < node.tasks.length; i++) {
                    const task = node.tasks[i];
                    await timelineDao.createElement({
                        timelineNodeId: createdNode.id,
                        timelineId: timeline.id,
                        elementType: 'task',
                        elementCategory: 'task',
                        title: task.title,
                        description: task.description,
                        elementIcon: task.title_image ? { provider: 'iconify', name: task.title_image } : undefined,
                        priceRange: task.price ? {
                            type: task.price.type,
                            currency: task.price.unit,
                            min: task.price.min || task.price.range?.min,
                            max: task.price.max || task.price.range?.max,
                            confirmed: task.price.confirmed_price,
                        } : undefined,
                        priority: task.priority || 1,
                        order: i,
                        status: 'pending',
                    });
                }
            }

            // Save recommendations as elements
            if (node.recommendations) {
                for (let i = 0; i < node.recommendations.length; i++) {
                    const rec = node.recommendations[i];
                    await timelineDao.createElement({
                        timelineNodeId: createdNode.id,
                        timelineId: timeline.id,
                        elementType: 'recommendation',
                        elementCategory: rec.type || 'general',
                        title: rec.title,
                        description: rec.description,
                        elementIcon: rec.title_image ? { provider: 'iconify', name: rec.title_image } : undefined,
                        priceRange: rec.price_info ? {
                            type: rec.price_info.type,
                            currency: rec.price_info.unit,
                            min: rec.price_info.min || rec.price_info.range?.min,
                            max: rec.price_info.max || rec.price_info.range?.max,
                            confirmed: rec.price_info.confirmed_price,
                        } : undefined,
                        priority: rec.priority || 1,
                        order: i,
                        status: 'pending',
                    });
                }
            }
        }

        // Update thread with timeline ID
        await threadDao.update(threadId, { timelineId: timeline.id });

        console.log(`Timeline saved to database: ${timeline.id}`);
    } catch (error) {
        console.error('Error saving timeline to database:', error);
        throw error;
    }
}

// Map frontend node type to database NodeType
function mapNodeTypeToDb(type: string): NodeType {
    switch (type) {
        case 'start': return 'start';
        case 'end': return 'end';
        case 'task_node': return 'action';
        case 'representation_node': return 'representation';
        case 'action': return 'action';
        case 'representation': return 'representation';
        default: return 'action';
    }
}

// Stream timeline nodes with delay for loading effect
async function streamTimelineToSocket(
    socket: Socket,
    timelineId: string,
    nodes: TimelineNode[],
    configs: { display_price_unit: string; timezone: string },
    style: string,
    skipLoadingDelay: boolean = false
): Promise<void> {
    let version = 1;

    // Sort nodes by order
    const sortedNodes = [...nodes].sort((a, b) => a.order - b.order);

    // Emit loading indicator
    socket.emit('loading');

    // Small delay before starting (skip if loading from DB for faster response)
    if (!skipLoadingDelay) {
        await delay(300);
    } else {
        await delay(50);
    }

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

        // Add delay between nodes (shorter if loading from DB)
        const delayMs = skipLoadingDelay ? (50 + Math.random() * 50) : (200 + Math.random() * 200);
        await delay(delayMs);
    }

    // Small delay before complete
    await delay(skipLoadingDelay ? 50 : 200);

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
                // First, try to load timeline from database
                const dbTimelineData = await loadTimelineFromDatabase(timeline_id);

                if (dbTimelineData && dbTimelineData.nodes.length > 0) {
                    // Timeline exists in database - stream from DB (faster)
                    console.log('Streaming timeline from database');
                    await streamTimelineToSocket(
                        socket,
                        timeline_id,
                        dbTimelineData.nodes,
                        dbTimelineData.configs,
                        dbTimelineData.style,
                        true // Skip loading delay for faster DB response
                    );
                } else {
                    // No timeline in database - fetch from AI service and save
                    console.log('No timeline in database, fetching from AI service');
                    const timelineData = await fetchTimelineFromAIAndSave(timeline_id);

                    // Stream nodes with loading effect
                    await streamTimelineToSocket(
                        socket,
                        timeline_id,
                        timelineData.nodes,
                        timelineData.configs,
                        timelineData.style,
                        false // Full loading animation for new timeline
                    );
                }
            } catch (error) {
                console.error('Error loading timeline:', error);
                // Emit error to client
                socket.emit('error', {
                    type: 'error',
                    message: 'Failed to load timeline. Please try again.',
                });
            }
        });

        // Handle request for timeline regeneration (explicit user action)
        socket.on('request-timeline', async (data: { timeline_id: string; force_regenerate?: boolean }) => {
            const { timeline_id, force_regenerate } = data;

            try {
                if (force_regenerate) {
                    // Delete existing timeline nodes and regenerate from AI
                    const thread = await threadDao.findById(timeline_id);
                    if (thread?.timelineId) {
                        await timelineDao.deleteNodesByTimelineId(thread.timelineId);
                        await timelineDao.delete(thread.timelineId);
                        await threadDao.update(timeline_id, { timelineId: undefined });
                    }

                    // Fetch fresh from AI and save
                    const timelineData = await fetchTimelineFromAIAndSave(timeline_id);
                    await streamTimelineToSocket(
                        socket,
                        timeline_id,
                        timelineData.nodes,
                        timelineData.configs,
                        timelineData.style,
                        false
                    );
                } else {
                    // Just reload from database or AI if not exists
                    const dbTimelineData = await loadTimelineFromDatabase(timeline_id);

                    if (dbTimelineData && dbTimelineData.nodes.length > 0) {
                        await streamTimelineToSocket(
                            socket,
                            timeline_id,
                            dbTimelineData.nodes,
                            dbTimelineData.configs,
                            dbTimelineData.style,
                            true
                        );
                    } else {
                        const timelineData = await fetchTimelineFromAIAndSave(timeline_id);
                        await streamTimelineToSocket(
                            socket,
                            timeline_id,
                            timelineData.nodes,
                            timelineData.configs,
                            timelineData.style,
                            false
                        );
                    }
                }
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
