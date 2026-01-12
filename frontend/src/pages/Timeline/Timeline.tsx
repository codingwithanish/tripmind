import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import TimelineContainer from '@components/timeline/TimelineContainer';
import TimelineChat from '@components/timeline/TimelineChat';
import timelineWebSocket from '@services/timelineWebSocket';
import { TimelineData, CompleteTimelineEvent } from '../../types/websocket.types';
import './Timeline.css';

interface LocationState {
    threadId?: string;
}

const Timeline: React.FC = () => {
    const { travelId } = useParams<{ travelId: string }>();
    const location = useLocation();
    const state = location.state as LocationState;

    const [timeline, setTimeline] = useState<TimelineData | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'timeline' | 'chat'>('timeline');
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Connect to WebSocket
    useEffect(() => {
        if (!travelId) return;

        const timelineId = travelId;

        timelineWebSocket.connect(timelineId, {
            onConnect: () => {
                console.log('Timeline WebSocket connected');
                setIsConnected(true);
                setError(null);
            },
            onDisconnect: () => {
                console.log('Timeline WebSocket disconnected');
                setIsConnected(false);
            },
            onError: (err) => {
                console.error('WebSocket error:', err);
                setError('Connection error. Retrying...');
            },
            onCompleteTimeline: (event: CompleteTimelineEvent) => {
                console.log('Received complete timeline:', event.data);
                setTimeline(event.data);
                setError(null);
            },
            onNewNode: (event) => {
                setTimeline((prev) => {
                    if (!prev) return prev;
                    const newNode = event.data.node;
                    const nodes = [...prev.nodes, newNode].sort((a, b) => a.order - b.order);
                    return { ...prev, nodes, version: event.data.version };
                });
            },
            onDeleteNode: (event) => {
                setTimeline((prev) => {
                    if (!prev) return prev;
                    const nodes = prev.nodes.filter((n) => n.id !== event.data.node_id);
                    return { ...prev, nodes, version: event.data.version };
                });
            },
            onAddNodeElement: (event) => {
                setTimeline((prev) => {
                    if (!prev) return prev;
                    const nodes = prev.nodes.map((node) => {
                        if (node.id !== event.data.node_id) return node;
                        if (event.data.element_type === 'task') {
                            return {
                                ...node,
                                tasks: [...(node.tasks || []), event.data.element as any],
                            };
                        }
                        if (event.data.element_type === 'recommendation') {
                            return {
                                ...node,
                                recommendations: [...(node.recommendations || []), event.data.element as any],
                            };
                        }
                        return node;
                    });
                    return { ...prev, nodes, version: event.data.version };
                });
            },
            onUpdateNodeElement: (event) => {
                setTimeline((prev) => {
                    if (!prev) return prev;
                    const nodes = prev.nodes.map((node) => {
                        if (node.id !== event.data.node_id) return node;
                        if (event.data.element_type === 'task' && node.tasks) {
                            return {
                                ...node,
                                tasks: node.tasks.map((t) =>
                                    t.id === event.data.element_id ? { ...t, ...event.data.patch } : t
                                ),
                            };
                        }
                        if (event.data.element_type === 'recommendation' && node.recommendations) {
                            return {
                                ...node,
                                recommendations: node.recommendations.map((r) =>
                                    r.id === event.data.element_id ? { ...r, ...event.data.patch } : r
                                ),
                            };
                        }
                        return node;
                    });
                    return { ...prev, nodes, version: event.data.version };
                });
            },
            onDeleteNodeElement: (event) => {
                setTimeline((prev) => {
                    if (!prev) return prev;
                    const nodes = prev.nodes.map((node) => {
                        if (node.id !== event.data.node_id) return node;
                        return {
                            ...node,
                            tasks: node.tasks?.filter((t) => !event.data.element_ids.includes(t.id)),
                            recommendations: node.recommendations?.filter(
                                (r) => !event.data.element_ids.includes(r.id)
                            ),
                        };
                    });
                    return { ...prev, nodes, version: event.data.version };
                });
            },
        });

        return () => {
            timelineWebSocket.disconnect();
        };
    }, [travelId]);

    const handleTaskComplete = useCallback((taskId: string, nodeId: string) => {
        console.log('Complete task:', taskId, 'in node:', nodeId);
        // TODO: Send WebSocket event to update task
    }, []);

    const handleTaskSkip = useCallback((taskId: string, nodeId: string) => {
        console.log('Skip task:', taskId, 'in node:', nodeId);
        // TODO: Send WebSocket event to update task
    }, []);

    const handleAdditionalInput = useCallback((nodeId: string, value: string) => {
        console.log('Additional input for node:', nodeId, 'value:', value);
        // TODO: Send chat message with the input
    }, []);

    const handleTimelineUpdate = useCallback(() => {
        timelineWebSocket.requestRefresh();
    }, []);

    // Mobile view with tabs
    if (isMobile) {
        return (
            <div className="timeline-page timeline-page--mobile">
                <div className="timeline-page__tabs">
                    <button
                        className={`timeline-page__tab ${activeTab === 'timeline' ? 'timeline-page__tab--active' : ''}`}
                        onClick={() => setActiveTab('timeline')}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        Timeline
                    </button>
                    <button
                        className={`timeline-page__tab ${activeTab === 'chat' ? 'timeline-page__tab--active' : ''}`}
                        onClick={() => setActiveTab('chat')}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                        Chat
                    </button>
                </div>

                {/* Connection status */}
                {!isConnected && (
                    <div className="timeline-page__status timeline-page__status--disconnected">
                        <span className="timeline-page__status-dot"></span>
                        Connecting...
                    </div>
                )}

                {error && (
                    <div className="timeline-page__error">
                        <p>{error}</p>
                    </div>
                )}

                <div className="timeline-page__content">
                    {activeTab === 'timeline' && (
                        <div className="timeline-page__panel">
                            <TimelineContainer
                                timeline={timeline}
                                isLoading={!isConnected}
                                onTaskComplete={handleTaskComplete}
                                onTaskSkip={handleTaskSkip}
                                onAdditionalInput={handleAdditionalInput}
                            />
                        </div>
                    )}
                    {activeTab === 'chat' && (
                        <div className="timeline-page__panel">
                            <TimelineChat
                                threadId={state?.threadId || null}
                                onTimelineUpdate={handleTimelineUpdate}
                            />
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Desktop view with split layout
    return (
        <div className="timeline-page timeline-page--desktop">
            {/* Connection status */}
            {!isConnected && (
                <div className="timeline-page__status timeline-page__status--disconnected">
                    <span className="timeline-page__status-dot"></span>
                    Connecting to timeline...
                </div>
            )}

            {error && (
                <div className="timeline-page__error">
                    <p>{error}</p>
                </div>
            )}

            <div className="timeline-page__split">
                <div className="timeline-page__left">
                    <div className="timeline-page__panel-header">
                        <h2>Your Travel Timeline</h2>
                        <p>
                            {timeline
                                ? `${timeline.nodes.filter((n) => n.type === 'task_node').length} planning steps`
                                : 'Loading...'}
                        </p>
                        {isConnected && (
                            <span className="timeline-page__connected-badge">
                                <span className="timeline-page__status-dot timeline-page__status-dot--connected"></span>
                                Live
                            </span>
                        )}
                    </div>
                    <TimelineContainer
                        timeline={timeline}
                        isLoading={!isConnected}
                        onTaskComplete={handleTaskComplete}
                        onTaskSkip={handleTaskSkip}
                        onAdditionalInput={handleAdditionalInput}
                    />
                </div>
                <div className="timeline-page__right">
                    <TimelineChat
                        threadId={state?.threadId || null}
                        onTimelineUpdate={handleTimelineUpdate}
                    />
                </div>
            </div>
        </div>
    );
};

export default Timeline;
