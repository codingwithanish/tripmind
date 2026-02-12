import React from 'react';
import FlightBookingPanel from './FlightBookingPanel';
import HotelBookingPanel from './HotelBookingPanel';
import RestaurantPanel from './RestaurantPanel';
import GeneralPanel from './GeneralPanel';
import type { ElementClickData } from '../TimelineTypes';
import './ElementPanels.css';

// Icon wrapper component
const Icon: React.FC<{ icon: string; className?: string; style?: React.CSSProperties }> = ({ icon, className, style }) => {
    return React.createElement('iconify-icon', { icon, class: className, style });
};

// Re-export ElementClickData for convenience
export type { ElementClickData };

interface ElementDetailsPanelProps {
    element: ElementClickData | null;
    searchResults: any | null;
    isLoading: boolean;
    error: string | null;
    onClose: () => void;
    isMobile?: boolean;
}

const ElementDetailsPanel: React.FC<ElementDetailsPanelProps> = ({
    element,
    searchResults,
    isLoading,
    error,
    onClose,
    isMobile = false
}) => {
    if (!element && !isLoading) {
        return null;
    }

    // Determine which panel to render based on category
    const renderPanel = () => {
        if (isLoading || !searchResults) {
            return (
                <div className="element-panel">
                    <div className="element-panel__header">
                        <h2 className="element-panel__title">
                            <Icon icon="mdi:magnify" />
                            Searching...
                        </h2>
                        <button className="element-panel__close" onClick={onClose}>
                            <Icon icon="mdi:close" />
                        </button>
                    </div>
                    <div className="element-panel__content">
                        <div className="element-panel__loading">
                            <div className="element-panel__loading-spinner" />
                            <span>Finding the best options for you...</span>
                        </div>
                    </div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="element-panel">
                    <div className="element-panel__header">
                        <h2 className="element-panel__title">
                            <Icon icon="mdi:alert-circle" />
                            Error
                        </h2>
                        <button className="element-panel__close" onClick={onClose}>
                            <Icon icon="mdi:close" />
                        </button>
                    </div>
                    <div className="element-panel__content">
                        <div className="element-panel__error">
                            <Icon icon="mdi:alert-circle" style={{ fontSize: '2rem', marginBottom: '8px' }} />
                            <p>{error}</p>
                        </div>
                    </div>
                </div>
            );
        }

        const category = searchResults.category?.toLowerCase().replace(/-/g, '_') || '';

        if (category.includes('flight')) {
            return (
                <FlightBookingPanel
                    data={searchResults}
                    onClose={onClose}
                    isLoading={isLoading}
                    error={error}
                />
            );
        }

        if (category.includes('hotel')) {
            return (
                <HotelBookingPanel
                    data={searchResults}
                    onClose={onClose}
                    isLoading={isLoading}
                    error={error}
                />
            );
        }

        if (category.includes('restaurant') || category.includes('dining') || category.includes('food')) {
            return (
                <RestaurantPanel
                    data={searchResults}
                    onClose={onClose}
                    isLoading={isLoading}
                    error={error}
                />
            );
        }

        // Default to general panel
        return (
            <GeneralPanel
                data={searchResults}
                onClose={onClose}
                isLoading={isLoading}
                error={error}
                title={element?.title || 'Details'}
            />
        );
    };

    // Mobile: render as overlay
    if (isMobile) {
        return (
            <div className="element-panel-overlay" onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}>
                {renderPanel()}
            </div>
        );
    }

    // Desktop: render directly
    return renderPanel();
};

export default ElementDetailsPanel;
export { FlightBookingPanel, HotelBookingPanel, RestaurantPanel, GeneralPanel };
