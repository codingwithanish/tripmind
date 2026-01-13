import { Server, Socket } from 'socket.io';
import crypto from 'crypto';

// Generate dummy timeline data with updated structure
// Node types: start, end, action, representation, additional_input
// - action: contains tasks and/or recommendations arrays
// - representation: contains single representation object (contextual info)
// - additional_input: contains single additional_input object (blocking)
const generateDummyTimeline = (timelineId: string) => {
    const startNodeId = crypto.randomUUID();
    const endNodeId = crypto.randomUUID();

    return {
        timeline_id: timelineId,
        version: 1,
        style: 'default',
        configs: {
            display_price_unit: 'USD',
            timezone: 'America/New_York',
        },
        nodes: [
            // Start node
            {
                id: startNodeId,
                node_version: 1,
                order: 0,
                type: 'start',
                subtype: null,
                display_date: null,
            },
            // Representation node - contextual info (weather)
            {
                id: crypto.randomUUID(),
                node_version: 1,
                order: 1,
                type: 'representation',
                subtype: 'weather',
                display_date: {
                    type: 'date',
                    label: 'Jan 17',
                    start: '2026-01-17T00:00:00Z',
                },
                representation: {
                    id: crypto.randomUUID(),
                    title: 'Weather Update',
                    description: 'Expected sunny weather with temperatures around 75°F. Perfect for outdoor activities!',
                    image: 'https://images.unsplash.com/photo-1601297183305-6df142704ea2?w=200',
                    icon: 'sun',
                },
            },
            // Action node with tasks and recommendations
            {
                id: crypto.randomUUID(),
                node_version: 1,
                order: 2,
                type: 'action',
                subtype: 'default',
                display_date: {
                    type: 'date',
                    label: 'Jan 17',
                    start: '2026-01-17T00:00:00Z',
                },
                tasks: [
                    {
                        id: crypto.randomUUID(),
                        execution_state: 'pending',
                        visit_status: null,
                        priority: 1,
                        title: 'Book Flight Tickets',
                        title_image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=200',
                        description: 'Round-trip flight from NYC to destination',
                        price: {
                            type: 'range',
                            unit: 'USD',
                            price_range: { min: 450, max: 650 },
                        },
                    },
                ],
                recommendations: [
                    {
                        id: crypto.randomUUID(),
                        action_state: 'suggested',
                        type: 'flight',
                        priority: 1,
                        title: 'Delta Airlines - Direct Flight',
                        title_image: 'https://images.unsplash.com/photo-1569629743817-70d8db6c323b?w=200',
                        description: 'Non-stop flight, 4h 30m duration. Includes 1 checked bag.',
                        price_included: true,
                        price_info: {
                            type: 'constant',
                            unit: 'USD',
                            value: 520,
                        },
                    },
                    {
                        id: crypto.randomUUID(),
                        action_state: 'suggested',
                        type: 'flight',
                        priority: 2,
                        title: 'United Airlines - 1 Stop',
                        title_image: 'https://images.unsplash.com/photo-1540339832862-474599807836?w=200',
                        description: '6h 15m with layover in Chicago. Budget-friendly option.',
                        price_included: true,
                        price_info: {
                            type: 'constant',
                            unit: 'USD',
                            value: 380,
                        },
                    },
                ],
            },
            // Action node with multiple tasks
            {
                id: crypto.randomUUID(),
                node_version: 1,
                order: 3,
                type: 'action',
                subtype: 'default',
                display_date: {
                    type: 'date_range',
                    label: 'Jan 17 - Jan 24',
                    start: '2026-01-17T00:00:00Z',
                    end: '2026-01-24T00:00:00Z',
                },
                tasks: [
                    {
                        id: crypto.randomUUID(),
                        execution_state: 'pending',
                        visit_status: null,
                        priority: 1,
                        title: 'Book Accommodation',
                        title_image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200',
                        description: 'Hotel in city center, 7 nights',
                        price: {
                            type: 'range',
                            unit: 'USD',
                            price_range: { min: 700, max: 1200 },
                        },
                    },
                    {
                        id: crypto.randomUUID(),
                        execution_state: 'completed',
                        visit_status: 'confirmed',
                        priority: 2,
                        title: 'Travel Insurance',
                        title_image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=200',
                        description: 'Comprehensive coverage for international travel',
                        price: {
                            type: 'confirmed',
                            unit: 'USD',
                            confirmed_price: 85,
                        },
                    },
                ],
                recommendations: [
                    {
                        id: crypto.randomUUID(),
                        action_state: 'suggested',
                        type: 'hotel',
                        priority: 1,
                        title: 'Grand Plaza Hotel',
                        title_image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=200',
                        description: '4-star hotel, breakfast included, city center location',
                        price_included: true,
                        price_info: {
                            type: 'range',
                            unit: 'USD',
                            range: { min: 120, max: 180 },
                        },
                    },
                ],
            },
            // Additional input node (BLOCKING - nodes after this won't render until answered)
            {
                id: crypto.randomUUID(),
                node_version: 1,
                order: 4,
                type: 'additional_input',
                subtype: null,
                display_date: null,
                additional_input: {
                    id: crypto.randomUUID(),
                    question: 'What kind of activities do you prefer for your trip?',
                    response_type: 'text',
                    placeholder: 'Type your preferences...',
                    is_required: true,
                },
            },
            // Action node - tasks only (won't render until additional_input is completed)
            {
                id: crypto.randomUUID(),
                node_version: 1,
                order: 5,
                type: 'action',
                subtype: 'tasks_only',
                display_date: {
                    type: 'time',
                    label: '2:00 PM',
                    start: '2026-01-18T14:00:00Z',
                },
                tasks: [
                    {
                        id: crypto.randomUUID(),
                        execution_state: 'pending',
                        visit_status: null,
                        priority: 1,
                        title: 'City Walking Tour',
                        title_image: 'https://images.unsplash.com/photo-1569959220744-ff553533f492?w=200',
                        description: 'Guided tour of historic downtown area',
                        price: {
                            type: 'confirmed',
                            unit: 'USD',
                            confirmed_price: 45,
                        },
                    },
                ],
            },
            // End node
            {
                id: endNodeId,
                node_version: 1,
                order: 99,
                type: 'end',
                subtype: null,
                display_date: null,
            },
        ],
    };
};

export const setupTimelineSocket = (io: Server) => {
    const timelineNamespace = io.of('/timeline');

    timelineNamespace.on('connection', (socket: Socket) => {
        console.log(`Timeline socket connected: ${socket.id}`);

        // Handle join timeline room
        socket.on('join-timeline', (data: { timeline_id: string }) => {
            const { timeline_id } = data;
            socket.join(timeline_id);
            console.log(`Socket ${socket.id} joined timeline: ${timeline_id}`);

            // Send complete timeline data
            const timelineData = generateDummyTimeline(timeline_id);
            socket.emit('complete-timeline', {
                type: 'complete-timeline',
                data: timelineData,
            });
        });

        // Handle request for timeline refresh
        socket.on('request-timeline', (data: { timeline_id: string }) => {
            const { timeline_id } = data;
            const timelineData = generateDummyTimeline(timeline_id);
            socket.emit('complete-timeline', {
                type: 'complete-timeline',
                data: timelineData,
            });
        });

        // Handle disconnect
        socket.on('disconnect', () => {
            console.log(`Timeline socket disconnected: ${socket.id}`);
        });
    });

    console.log('Timeline WebSocket namespace initialized');
};
