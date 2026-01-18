import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { MyTravelCard, TravelCardStatus } from '@/types/myTravel.types';
import './TravelCard.css';

// Status badge component
interface StatusBadgeProps {
    status: TravelCardStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
    const statusConfig: Record<TravelCardStatus, { label: string; className: string }> = {
        confirmed: { label: 'Confirmed', className: 'status-confirmed' },
        planning: { label: 'Planning', className: 'status-planning' },
        completed: { label: 'Completed', className: 'status-completed' },
        dropped: { label: 'Dropped', className: 'status-dropped' },
    };

    const config = statusConfig[status];

    return (
        <span className={`travel-card-status-badge ${config.className}`}>
            {config.label}
        </span>
    );
};

// Main TravelCard component
interface TravelCardProps {
    travel: MyTravelCard;
}

const TravelCard: React.FC<TravelCardProps> = ({ travel }) => {
    const navigate = useNavigate();
    const [currentNotificationIndex, setCurrentNotificationIndex] = useState(0);

    const thumbnailImage = travel.images.find((img) => img.type === 'thumbnail');
    const sortedSummary = [...travel.summary].sort((a, b) => a.priority - b.priority);
    const sortedNotifications = [...travel.notifications].sort((a, b) => a.priority - b.priority);

    const handleTitleClick = () => {
        // Navigate to the timeline page for this travel
        navigate(`/timeline/${travel.thread_id}`);
    };

    const handlePrevNotification = () => {
        setCurrentNotificationIndex((prev) =>
            prev > 0 ? prev - 1 : sortedNotifications.length - 1
        );
    };

    const handleNextNotification = () => {
        setCurrentNotificationIndex((prev) =>
            prev < sortedNotifications.length - 1 ? prev + 1 : 0
        );
    };

    const currentNotification = sortedNotifications[currentNotificationIndex];

    return (
        <div className="travel-card">
            {/* Header Section */}
            <div className="travel-card-header">
                <h3 className="travel-card-title" onClick={handleTitleClick}>
                    {travel.travel_summary}
                </h3>
                <StatusBadge status={travel.status} />
            </div>

            {/* Body Section */}
            <div className="travel-card-body">
                {/* Left: Thumbnail Image */}
                <div className="travel-card-image-container">
                    {thumbnailImage ? (
                        <img
                            src={thumbnailImage.url}
                            alt={thumbnailImage.description}
                            className="travel-card-image"
                        />
                    ) : (
                        <div className="travel-card-image-placeholder">
                            <Icon icon="mdi:image-outline" className="placeholder-icon" />
                        </div>
                    )}
                </div>

                {/* Right: Summary Items */}
                <div className="travel-card-summary">
                    {sortedSummary.map((item, index) => (
                        <div key={index} className="travel-card-summary-item">
                            <Icon icon={item.icon.name} className="summary-icon" />
                            <div className="summary-content">
                                <span className="summary-title">{item.title}</span>
                                {item.subtitle && (
                                    <span className="summary-subtitle">{item.subtitle}</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer Section - Notifications */}
            {sortedNotifications.length > 0 && (
                <div className="travel-card-footer">
                    <div className="travel-card-notification">
                        <Icon
                            icon={currentNotification.icon.name}
                            className="notification-icon"
                        />
                        <div className="notification-content">
                            <span className="notification-title">{currentNotification.title}</span>
                            <span className="notification-subtitle">{currentNotification.subtitle}</span>
                        </div>
                    </div>

                    {sortedNotifications.length > 1 && (
                        <div className="notification-navigation">
                            <button
                                className="nav-arrow nav-arrow-prev"
                                onClick={handlePrevNotification}
                                aria-label="Previous notification"
                            >
                                <Icon icon="mdi:chevron-left" />
                            </button>
                            <button
                                className="nav-arrow nav-arrow-next"
                                onClick={handleNextNotification}
                                aria-label="Next notification"
                            >
                                <Icon icon="mdi:chevron-right" />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TravelCard;
