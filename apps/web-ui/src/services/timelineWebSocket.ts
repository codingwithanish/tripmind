import { io, Socket } from 'socket.io-client';
import {
    TimelineData,
    TimelineWebSocketEvent,
    CompleteTimelineEvent,
    NewNodeEvent,
    DeleteNodeEvent,
    AddNodeElementEvent,
    UpdateNodeElementEvent,
    DeleteNodeElementEvent,
} from '../types/websocket.types';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:5000';

type EventHandler<T> = (event: T) => void;

interface TimelineSocketHandlers {
    onCompleteTimeline?: EventHandler<CompleteTimelineEvent>;
    onNewNode?: EventHandler<NewNodeEvent>;
    onDeleteNode?: EventHandler<DeleteNodeEvent>;
    onAddNodeElement?: EventHandler<AddNodeElementEvent>;
    onUpdateNodeElement?: EventHandler<UpdateNodeElementEvent>;
    onDeleteNodeElement?: EventHandler<DeleteNodeElementEvent>;
    onLoading?: () => void;
    onConnect?: () => void;
    onDisconnect?: () => void;
    onError?: (error: Error) => void;
}

class TimelineWebSocketService {
    private socket: Socket | null = null;
    private handlers: TimelineSocketHandlers = {};
    private currentTimelineId: string | null = null;
    private currentVersion: number = 0;
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 5;

    connect(timelineId: string, handlers: TimelineSocketHandlers): void {
        this.handlers = handlers;
        this.currentTimelineId = timelineId;
        this.currentVersion = 0;

        // Create socket connection to timeline namespace
        this.socket = io(`${SOCKET_URL}/timeline`, {
            transports: ['websocket', 'polling'],
            timeout: 10000,
            reconnection: true,
            reconnectionAttempts: this.maxReconnectAttempts,
            reconnectionDelay: 1000,
        });

        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        if (!this.socket) return;

        // Connection events
        this.socket.on('connect', () => {
            console.log('Timeline WebSocket connected');
            this.reconnectAttempts = 0;
            this.handlers.onConnect?.();

            // Join timeline room
            if (this.currentTimelineId) {
                this.socket?.emit('join-timeline', { timeline_id: this.currentTimelineId });
            }
        });

        this.socket.on('disconnect', () => {
            console.log('Timeline WebSocket disconnected');
            this.handlers.onDisconnect?.();
        });

        this.socket.on('connect_error', (error) => {
            console.error('Timeline WebSocket connection error:', error);
            this.handlers.onError?.(error);
        });

        // Timeline events
        this.socket.on('complete-timeline', (event: CompleteTimelineEvent) => {
            console.log('Received complete-timeline event', event);
            this.currentVersion = event.data.version;
            this.handlers.onCompleteTimeline?.(event);
        });

        this.socket.on('loading', () => {
            console.log('Timeline loading started');
            this.handlers.onLoading?.();
        });

        this.socket.on('new-node', (event: NewNodeEvent) => {
            if (this.shouldProcessEvent(event.data.timeline_id, event.data.version)) {
                this.currentVersion = event.data.version;
                this.handlers.onNewNode?.(event);
            }
        });

        this.socket.on('delete-node', (event: DeleteNodeEvent) => {
            if (this.shouldProcessEvent(event.data.timeline_id, event.data.version)) {
                this.currentVersion = event.data.version;
                this.handlers.onDeleteNode?.(event);
            }
        });

        this.socket.on('add-node-element', (event: AddNodeElementEvent) => {
            if (this.shouldProcessEvent(event.data.timeline_id, event.data.version)) {
                this.currentVersion = event.data.version;
                this.handlers.onAddNodeElement?.(event);
            }
        });

        this.socket.on('update-node-element', (event: UpdateNodeElementEvent) => {
            if (this.shouldProcessEvent(event.data.timeline_id, event.data.version)) {
                this.currentVersion = event.data.version;
                this.handlers.onUpdateNodeElement?.(event);
            }
        });

        this.socket.on('delete-node-element', (event: DeleteNodeElementEvent) => {
            if (this.shouldProcessEvent(event.data.timeline_id, event.data.version)) {
                this.currentVersion = event.data.version;
                this.handlers.onDeleteNodeElement?.(event);
            }
        });
    }

    private shouldProcessEvent(timelineId: string, version: number): boolean {
        // Ignore events for different timelines
        if (timelineId !== this.currentTimelineId) {
            console.log('Ignoring event for different timeline');
            return false;
        }

        // Ignore stale versions
        if (version <= this.currentVersion) {
            console.log(`Ignoring stale version ${version}, current: ${this.currentVersion}`);
            return false;
        }

        return true;
    }

    requestRefresh(): void {
        if (this.socket && this.currentTimelineId) {
            this.socket.emit('request-timeline', { timeline_id: this.currentTimelineId });
        }
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        this.currentTimelineId = null;
        this.currentVersion = 0;
        this.handlers = {};
    }

    isConnected(): boolean {
        return this.socket?.connected ?? false;
    }

    getCurrentVersion(): number {
        return this.currentVersion;
    }
}

// Export singleton instance
export const timelineWebSocket = new TimelineWebSocketService();
export default timelineWebSocket;
