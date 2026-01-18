import React, { useState, useEffect, useRef } from 'react';
import './TimelineNotificationsPanel.css';

interface Notification {
    id: string;
    severity: 'severe' | 'medium' | 'low';
    title: string;
    message: string;
    created_at: string;
}

interface TimelineNotificationsPanelProps {
    userId: string;
    threadId: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const TimelineNotificationsPanel: React.FC<TimelineNotificationsPanelProps> = ({
    userId,
    threadId
}) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const hasFetchedRef = useRef(false);

    useEffect(() => {
        if (hasFetchedRef.current) return;
        hasFetchedRef.current = true;

        const fetchNotifications = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_BASE_URL}/timeline/${userId}/${threadId}/notifications`);
                if (!response.ok) throw new Error('Failed to fetch notifications');
                const data = await response.json();
                setNotifications(data.notifications || []);
                setError(null);
            } catch (err) {
                console.error('Failed to load notifications:', err);
                setError('Failed to load notifications');
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, [userId, threadId]);

    const handleDelete = async (notificationId: string) => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/timeline/${userId}/${threadId}/notifications/${notificationId}`,
                { method: 'DELETE' }
            );
            if (response.ok) {
                setNotifications(prev => prev.filter(n => n.id !== notificationId));
            }
        } catch (err) {
            console.error('Failed to delete notification:', err);
        }
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'severe':
                return (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                    </svg>
                );
            case 'medium':
                return (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                    </svg>
                );
            default:
                return (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                );
        }
    };

    if (loading) {
        return (
            <div className="notifications-panel">
                <div className="notifications-panel__loading">
                    <div className="notifications-panel__spinner" />
                    <p>Loading notifications...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="notifications-panel">
                <div className="notifications-panel__error">
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="notifications-panel">
            <div className="notifications-panel__header">
                <h3>Notifications</h3>
                <span className="notifications-panel__count">{notifications.length}</span>
            </div>

            {notifications.length === 0 ? (
                <div className="notifications-panel__empty">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                    <p>No notifications</p>
                </div>
            ) : (
                <div className="notifications-panel__list">
                    {notifications.map(notification => (
                        <div
                            key={notification.id}
                            className={`notifications-panel__item notifications-panel__item--${notification.severity}`}
                        >
                            <div className="notifications-panel__icon">
                                {getSeverityIcon(notification.severity)}
                            </div>
                            <div className="notifications-panel__content">
                                <h4>{notification.title}</h4>
                                <p>{notification.message}</p>
                                <span className="notifications-panel__time">
                                    {new Date(notification.created_at).toLocaleString()}
                                </span>
                            </div>
                            <button
                                className="notifications-panel__delete"
                                onClick={() => handleDelete(notification.id)}
                                aria-label="Delete notification"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TimelineNotificationsPanel;
