import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { TimelineRenderer } from '@components/timeline';
import TimelineChat from '@components/timeline/TimelineChat';
import TimelineNotificationsPanel from '@components/timeline/TimelineNotificationsPanel';
import TimelineSettingsPanel from '@components/timeline/TimelineSettingsPanel';
import timelineWebSocket from '@services/timelineWebSocket';
import { TimelineData, TimelineNode, CompleteTimelineEvent } from '../../types/websocket.types';
import './Timeline.css';

type TabType = 'timeline' | 'chat' | 'notifications' | 'settings';

const Timeline: React.FC = () => {
    const { userId, threadId, travelId } = useParams<{
        userId?: string;
        threadId?: string;
        travelId?: string;
    }>();

    // Use URL params - support both old (/timeline/:travelId) and new (/:userId/:threadId/timeline) routes
    const effectiveUserId = userId || 'anonymous';
    const effectiveThreadId = threadId || travelId || '';

    const [timeline, setTimeline] = useState<TimelineData | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('chat');
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [helpContextNode, setHelpContextNode] = useState<TimelineNode | null>(null);

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
        if (!effectiveThreadId) return;

        timelineWebSocket.connect(effectiveThreadId, {
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
                setIsGenerating(false);
            },
            onLoading: () => {
                console.log('Timeline generation started');
                setIsGenerating(true);
                setTimeline(null); // Clear existing timeline for fresh load
            },
            onCompleteTimeline: (event: CompleteTimelineEvent) => {
                console.log('Received complete timeline:', event.data);
                setTimeline(event.data);
                setIsGenerating(false);
                setError(null);
            },
            onNewNode: (event) => {
                setTimeline((prev) => {
                    // Initialize timeline if first node received during streaming
                    if (!prev) {
                        return {
                            timeline_id: event.data.timeline_id,
                            version: event.data.version,
                            style: 'default',
                            configs: { display_price_unit: 'USD', timezone: 'UTC' },
                            nodes: [event.data.node],
                        };
                    }
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
    }, [effectiveThreadId]);

    const handleTaskComplete = useCallback((taskId: string, nodeId: string) => {
        console.log('Complete task:', taskId, 'in node:', nodeId);
    }, []);

    const handleAdditionalInput = useCallback((nodeId: string, value: string) => {
        console.log('Additional input for node:', nodeId, 'value:', value);
    }, []);

    const handleTimelineUpdate = useCallback(() => {
        timelineWebSocket.requestRefresh();
    }, []);

    // Handle help request from timeline - pass node to chat
    const handleHelpRequest = useCallback((nodeId: string) => {
        if (!timeline) return;
        const node = timeline.nodes.find(n => n.id === nodeId);
        if (node) {
            setHelpContextNode(node);
            setActiveTab('chat'); // Switch to chat tab
        }
    }, [timeline]);

    const handleContextCardHandled = useCallback(() => {
        // Clear the context node after it's been handled by chat
        setHelpContextNode(null);
    }, []);

    // Render tab content
    const renderTabContent = () => {
        switch (activeTab) {
            case 'timeline':
                // Show generating state with enhanced animation
                if (isGenerating) {
                    return (
                        <div className="timeline-generating">
                            {/* Show partial timeline while loading */}
                            {timeline && timeline.nodes.length > 0 && (
                                <TimelineRenderer
                                    data={timeline}
                                    onTaskComplete={handleTaskComplete}
                                    onAdditionalInput={handleAdditionalInput}
                                    onHelpRequest={handleHelpRequest}
                                />
                            )}
                            <div className="timeline-generating__indicator">
                                <div className="timeline-generating__spinner" />
                                <p>Generating your timeline...</p>
                            </div>
                        </div>
                    );
                }
                return timeline ? (
                    <TimelineRenderer
                        data={timeline}
                        onTaskComplete={handleTaskComplete}
                        onAdditionalInput={handleAdditionalInput}
                        onHelpRequest={handleHelpRequest}
                    />
                ) : (
                    <div className="timeline-loading">
                        <div className="timeline-loading__spinner" />
                        <p>Loading timeline...</p>
                    </div>
                );
            case 'chat':
                return (
                    <TimelineChat
                        threadId={effectiveThreadId}
                        contextCard={helpContextNode}
                        onContextCardHandled={handleContextCardHandled}
                        onTimelineUpdate={handleTimelineUpdate}
                    />
                );
            case 'notifications':
                return (
                    <TimelineNotificationsPanel
                        userId={effectiveUserId}
                        threadId={effectiveThreadId}
                    />
                );
            case 'settings':
                return (
                    <TimelineSettingsPanel
                        userId={effectiveUserId}
                        threadId={effectiveThreadId}
                        onTimelineUpdate={handleTimelineUpdate}
                    />
                );
        }
    };

    // Mobile view with bottom navigation
    if (isMobile) {
        return (
            <div className="timeline-page timeline-page--mobile">
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
                    <div className="timeline-page__panel">
                        {renderTabContent()}
                    </div>
                </div>

                {/* Bottom Navigation */}
                <nav className="timeline-page__bottom-nav">
                    <button
                        className={`timeline-page__nav-item ${activeTab === 'timeline' ? 'timeline-page__nav-item--active' : ''}`}
                        onClick={() => setActiveTab('timeline')}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M21.04 12.13C21.18 12.13 21.31 12.19 21.42 12.3L22.7 13.58C22.92 13.79 22.92 14.14 22.7 14.35L21.7 15.35L19.65 13.3L20.65 12.3C20.76 12.19 20.9 12.13 21.04 12.13M19.07 13.88L21.12 15.93L15.06 22H13V19.94L19.07 13.88M11 19L11 13H4V19H11M11 11V5H4V11H11M13 5V11H20V5H13M20 9H13V7H20V9Z" />
                        </svg>
                        <span>Timeline</span>
                    </button>
                    <button
                        className={`timeline-page__nav-item ${activeTab === 'chat' ? 'timeline-page__nav-item--active' : ''}`}
                        onClick={() => setActiveTab('chat')}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                        <span>Chat</span>
                    </button>
                    <button
                        className={`timeline-page__nav-item ${activeTab === 'notifications' ? 'timeline-page__nav-item--active' : ''}`}
                        onClick={() => setActiveTab('notifications')}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                        <span>Notifications</span>
                    </button>
                    <button
                        className={`timeline-page__nav-item ${activeTab === 'settings' ? 'timeline-page__nav-item--active' : ''}`}
                        onClick={() => setActiveTab('settings')}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="3"></circle>
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                        </svg>
                        <span>Settings</span>
                    </button>
                </nav>
            </div>
        );
    }

    // Desktop view with split layout and vertical tabs
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
                {/* Left - Timeline */}
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
                    {timeline ? (
                        <TimelineRenderer
                            data={timeline}
                            onTaskComplete={handleTaskComplete}
                            onAdditionalInput={handleAdditionalInput}
                            onHelpRequest={handleHelpRequest}
                        />
                    ) : (
                        <div className="timeline-loading">
                            <div className="timeline-loading__spinner" />
                            <p>Loading timeline...</p>
                        </div>
                    )}
                </div>

                {/* Right - Tabbed Panel */}
                <div className="timeline-page__right">
                    {/* Vertical Tabs */}
                    <div className="timeline-page__vertical-tabs">
                        <button
                            className={`timeline-page__vtab ${activeTab === 'chat' ? 'timeline-page__vtab--active' : ''}`}
                            onClick={() => setActiveTab('chat')}
                            title="Chat"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                            <span>Chat</span>
                        </button>
                        <button
                            className={`timeline-page__vtab ${activeTab === 'notifications' ? 'timeline-page__vtab--active' : ''}`}
                            onClick={() => setActiveTab('notifications')}
                            title="Notifications"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                            </svg>
                            <span>Notifications</span>
                        </button>
                        <button
                            className={`timeline-page__vtab ${activeTab === 'settings' ? 'timeline-page__vtab--active' : ''}`}
                            onClick={() => setActiveTab('settings')}
                            title="Settings"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="3"></circle>
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                            </svg>
                            <span>Settings</span>
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="timeline-page__tab-content">
                        {activeTab === 'chat' && (
                            <TimelineChat
                                threadId={effectiveThreadId}
                                contextCard={helpContextNode}
                                onContextCardHandled={handleContextCardHandled}
                                onTimelineUpdate={handleTimelineUpdate}
                            />
                        )}
                        {activeTab === 'notifications' && (
                            <TimelineNotificationsPanel
                                userId={effectiveUserId}
                                threadId={effectiveThreadId}
                            />
                        )}
                        {activeTab === 'settings' && (
                            <TimelineSettingsPanel
                                userId={effectiveUserId}
                                threadId={effectiveThreadId}
                                onTimelineUpdate={handleTimelineUpdate}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Timeline;
