// Timeline Test Page - For verifying the new compound component system

import { TimelineRenderer } from '../components/timeline';
import type { TimelineData } from '../components/timeline';

// Mock timeline data for testing
const mockTimelineData: TimelineData = {
    timeline_id: 'test-timeline-001',
    version: 1,
    style: 'default',
    configs: {
        display_price_unit: 'INR',
        timezone: 'Asia/Kolkata',
    },
    nodes: [
        {
            id: 'node-start',
            node_version: 1,
            order: 1,
            type: 'start',
            subtype: null,
            display_date: {
                type: 'date',
                label: 'Jan 15, 2026',
                start: '2026-01-15T00:00:00+05:30',
            },
        },
        {
            id: 'node-task-1',
            node_version: 1,
            order: 2,
            type: 'task_node',
            subtype: 'default',
            display_date: {
                type: 'date',
                label: 'Jan 15, 2026',
                start: '2026-01-15T09:00:00+05:30',
            },
            tasks: [
                {
                    id: 'task-1',
                    execution_state: 'completed',
                    visit_status: 'confirmed',
                    priority: 1,
                    title: 'Book Flight to Goa',
                    description: 'IndiGo 6E-2034, Departure 6:00 AM',
                    price: {
                        type: 'confirmed',
                        unit: 'INR',
                        confirmed_price: 4500,
                    },
                },
                {
                    id: 'task-2',
                    execution_state: 'pending',
                    visit_status: 'no_action',
                    priority: 2,
                    title: 'Check into Hotel',
                    description: 'Taj Exotica - Check-in after 2 PM',
                    price: {
                        type: 'range',
                        unit: 'INR',
                        price_range: { min: 12000, max: 18000 },
                    },
                },
            ],
            recommendations: [
                {
                    id: 'rec-1',
                    action_state: 'suggested',
                    type: 'restaurant',
                    priority: 1,
                    title: "Fisherman's Wharf",
                    description: 'Famous seafood restaurant',
                    price_included: true,
                    price_info: {
                        type: 'range',
                        unit: 'INR',
                        range: { min: 800, max: 2000 },
                    },
                },
            ],
        },
        {
            id: 'node-representation',
            node_version: 1,
            order: 3,
            type: 'representation_node',
            subtype: null,
            display_date: {
                type: 'date_range',
                label: 'Jan 15 - 17',
                start: '2026-01-15T00:00:00+05:30',
                end: '2026-01-17T00:00:00+05:30',
            },
            representations: [
                {
                    id: 'rep-1',
                    title: 'Perfect Beach Weather',
                    description: 'Expect sunny skies with temperatures around 28°C',
                    icon: 'sun',
                },
            ],
        },
        {
            id: 'node-input',
            node_version: 1,
            order: 4,
            type: 'task_node',
            subtype: 'additional_input',
            display_date: null,
            additional_input: {
                id: 'input-1',
                question: 'What kind of activities do you prefer - adventure or relaxation?',
                response_type: 'text',
                placeholder: 'E.g., water sports, spa, sightseeing...',
                is_required: true,
            },
        },
        {
            id: 'node-end',
            node_version: 1,
            order: 5,
            type: 'end',
            subtype: null,
            display_date: {
                type: 'date',
                label: 'Jan 18, 2026',
                start: '2026-01-18T00:00:00+05:30',
            },
        },
    ],
};

export default function TimelineTest() {
    const handleTaskComplete = (taskId: string, nodeId: string) => {
        console.log('Task completed:', taskId, 'in node:', nodeId);
        alert(`Task ${taskId} marked as complete!`);
    };

    const handleAdditionalInput = (nodeId: string, value: string) => {
        console.log('Additional input received:', value, 'for node:', nodeId);
        alert(`Input received: ${value}`);
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '20px' }}>Timeline Component Test</h1>

            <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
                <strong>Test Controls:</strong>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>
                    The timeline below uses mock data. Scroll to see all nodes.
                    The blocking node (additional input) should show a pulsing effect.
                </p>
            </div>

            <div style={{
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                backgroundColor: '#ffffff',
                minHeight: '500px',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <TimelineRenderer
                    data={mockTimelineData}
                    style="default"
                    onTaskComplete={handleTaskComplete}
                    onAdditionalInput={handleAdditionalInput}
                />
            </div>

            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#dbeafe', borderRadius: '8px' }}>
                <strong>Debug Info:</strong>
                <pre style={{ fontSize: '12px', marginTop: '10px', overflow: 'auto' }}>
                    {JSON.stringify({
                        nodeCount: mockTimelineData.nodes.length,
                        nodes: mockTimelineData.nodes.map(n => ({ id: n.id, type: n.type, subtype: n.subtype }))
                    }, null, 2)}
                </pre>
            </div>
        </div>
    );
}
