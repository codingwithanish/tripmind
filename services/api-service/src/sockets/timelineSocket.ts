import { Server, Socket } from 'socket.io';
import crypto from 'crypto';

// Generate dummy timeline data matching frontend's websocket.types.ts
// Node types: 'start' | 'end' | 'task_node' | 'representation_node'
// - task_node: contains tasks[], recommendations[] with title, title_image, description, price
// - representation_node: contains representations[] with id, title, description, icon
const generateDummyTimeline = (timelineId: string) => {
    return {
        timeline_id: timelineId,
        version: 1,
        style: 'default',
        configs: {
            display_price_unit: 'INR',
            timezone: 'Asia/Kolkata',
        },
        nodes: [
            // Start node
            {
                id: crypto.randomUUID(),
                node_version: 1,
                order: 0,
                type: 'start',
                subtype: null,
                display_date: null,
            },
            // Task node 1 - Flight booking
            {
                id: crypto.randomUUID(),
                node_version: 1,
                order: 1,
                type: 'task_node',
                subtype: 'default',
                display_date: {
                    type: 'date_range',
                    label: 'Jan 12 - Jan 16',
                    start: '2026-01-12T12:30:00Z',
                    end: '2026-01-16T01:30:00Z',
                },
                tasks: [
                    {
                        id: crypto.randomUUID(),
                        execution_state: 'pending',
                        visit_status: 'no_action',
                        priority: 1,
                        title: 'Book your flight from COK to SYD',
                        title_image: 'mdi:airplane-takeoff',
                        description: 'IndiGo 6E-2034, Departure 6:00 AM on 23 Jan',
                        price: {
                            type: 'range',
                            unit: 'INR',
                            range: { min: 45000, max: 52000 },
                        },
                    },
                    {
                        id: crypto.randomUUID(),
                        execution_state: 'pending',
                        visit_status: 'no_action',
                        priority: 2,
                        title: 'Book hotel at Sydney Harbour for 4 nights',
                        title_image: 'mdi:bed',
                        description: 'Sydney Harbour Marriott, Check-in: Jan 24',
                        price: {
                            type: 'range',
                            unit: 'INR',
                            range: { min: 45000, max: 52000 },
                        },
                    },
                ],
                recommendations: [
                    {
                        id: crypto.randomUUID(),
                        action_state: 'suggested',
                        type: 'place',
                        priority: 1,
                        title: 'Visit Sydney Opera House for a guided tour',
                        title_image: 'mdi:camera',
                        description: 'Tours run hourly, advance booking recommended',
                        price_included: true,
                        price_info: {
                            type: 'confirmed',
                            unit: 'AUD',
                            confirmed_price: 42,
                        },
                    },
                    {
                        id: crypto.randomUUID(),
                        action_state: 'suggested',
                        type: 'restaurant',
                        priority: 2,
                        title: 'Try the famous Sydney Fish Market',
                        title_image: 'mdi:food',
                        description: 'Open daily 7AM-4PM, Pyrmont area',
                        price_included: true,
                        price_info: {
                            type: 'range',
                            unit: 'AUD',
                            range: { min: 50, max: 100 },
                        },
                    },
                ],
            },
            // Representation node 1 - Weather info (low severity)
            {
                id: crypto.randomUUID(),
                node_version: 1,
                order: 2,
                type: 'representation_node',
                subtype: null,
                display_date: {
                    type: 'date',
                    label: 'Jan 16',
                    start: '2026-01-16T00:00:00Z',
                },
                representations: [
                    {
                        id: crypto.randomUUID(),
                        title: 'Weather Advisory',
                        description: 'Last year, the temperature at this time dropped to around –1°C, so please be prepared with warm clothing.',
                        icon: 'mdi:weather-sunny',
                    },
                ],
            },
            // Task node 2 - Road trip
            {
                id: crypto.randomUUID(),
                node_version: 1,
                order: 3,
                type: 'task_node',
                subtype: 'default',
                display_date: {
                    type: 'date',
                    label: 'Jan 17',
                    start: '2026-01-17T09:00:00Z',
                },
                tasks: [
                    {
                        id: crypto.randomUUID(),
                        execution_state: 'pending',
                        visit_status: 'no_action',
                        priority: 1,
                        title: 'Rent a car for Blue Mountains day trip',
                        title_image: 'mdi:car-side',
                        description: 'Pick up from Sydney CBD, return same day',
                        price: {
                            type: 'range',
                            unit: 'AUD',
                            range: { min: 120, max: 180 },
                        },
                    },
                ],
                recommendations: [
                    {
                        id: crypto.randomUUID(),
                        action_state: 'suggested',
                        type: 'place',
                        priority: 1,
                        title: 'Visit Three Sisters lookout point',
                        title_image: 'mdi:binoculars',
                        description: 'Best views in early morning, free entry',
                        price_included: false,
                    },
                ],
            },
            // Representation node 2 - Traffic warning (medium severity)
            {
                id: crypto.randomUUID(),
                node_version: 1,
                order: 4,
                type: 'representation_node',
                subtype: null,
                display_date: {
                    type: 'date',
                    label: 'Jan 17',
                    start: '2026-01-17T00:00:00Z',
                },
                representations: [
                    {
                        id: crypto.randomUUID(),
                        title: 'Traffic Warning',
                        description: 'Traffic congestion expected on Highway 101. Consider alternative routes or adjust departure time.',
                        icon: 'mdi:alert',
                    },
                ],
            },
            // Representation node 3 - Passport urgent (high severity)
            {
                id: crypto.randomUUID(),
                node_version: 1,
                order: 5,
                type: 'representation_node',
                subtype: null,
                display_date: {
                    type: 'date',
                    label: 'Jan 18',
                    start: '2026-01-18T00:00:00Z',
                },
                representations: [
                    {
                        id: crypto.randomUUID(),
                        title: 'Urgent: Passport Renewal Required',
                        description: 'Important: Passport renewal required before Jan 20. Visit the nearest embassy immediately to avoid travel disruption.',
                        icon: 'mdi:alert-octagon',
                    },
                ],
            },
            // Task node 3 - Sydney Harbour activities
            {
                id: crypto.randomUUID(),
                node_version: 1,
                order: 6,
                type: 'task_node',
                subtype: 'default',
                display_date: {
                    type: 'date',
                    label: 'Jan 18',
                    start: '2026-01-18T10:00:00Z',
                },
                tasks: [
                    {
                        id: crypto.randomUUID(),
                        execution_state: 'completed',
                        visit_status: 'confirmed',
                        priority: 1,
                        title: 'Take a ferry ride across Sydney Harbour',
                        title_image: 'mdi:ferry',
                        description: 'Circular Quay to Manly Beach',
                        price: {
                            type: 'confirmed',
                            unit: 'AUD',
                            confirmed_price: 9.20,
                        },
                    },
                    {
                        id: crypto.randomUUID(),
                        execution_state: 'pending',
                        visit_status: 'no_action',
                        priority: 2,
                        title: 'Sydney Harbour Bridge Climb',
                        title_image: 'mdi:bridge',
                        description: '3.5 hour guided climb experience',
                        price: {
                            type: 'confirmed',
                            unit: 'AUD',
                            confirmed_price: 388,
                        },
                    },
                ],
                recommendations: [
                    {
                        id: crypto.randomUUID(),
                        action_state: 'suggested',
                        type: 'place',
                        priority: 1,
                        title: 'Relax at Bondi Beach',
                        title_image: 'mdi:beach',
                        description: 'Iconic Australian beach, great for surfing',
                        price_included: false,
                    },
                ],
            },
            // End node
            {
                id: crypto.randomUUID(),
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
