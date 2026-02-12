import React from 'react';
import './ElementPanels.css';

interface RestaurantResult {
    id: string;
    name: string;
    image_url?: string;
    cuisine: string;
    location: string;
    rating: number;
    price_level: string;
    review_count?: number;
    booking_url?: string;
    opening_hours?: string;
}

interface RestaurantSearchResults {
    category: 'restaurants';
    featured: RestaurantResult;
    alternatives: RestaurantResult[];
}

interface RestaurantPanelProps {
    data: RestaurantSearchResults;
    onClose: () => void;
    isLoading?: boolean;
    error?: string | null;
}

// Icon wrapper component
const Icon: React.FC<{ icon: string; className?: string; style?: React.CSSProperties }> = ({ icon, className, style }) => {
    return React.createElement('iconify-icon', { icon, class: className, style });
};

const RestaurantCard: React.FC<{ restaurant: RestaurantResult; isFeatured?: boolean }> = ({ restaurant, isFeatured }) => {
    const handleBookNow = () => {
        if (restaurant.booking_url) {
            window.open(restaurant.booking_url, '_blank', 'noopener,noreferrer');
        }
    };

    if (isFeatured) {
        return (
            <div className="featured-card">
                <div className="featured-card__badge">
                    <Icon icon="mdi:star" /> Recommended
                </div>
                {restaurant.image_url && (
                    <img
                        src={restaurant.image_url}
                        alt={restaurant.name}
                        className="featured-card__image"
                    />
                )}
                <div className="featured-card__content">
                    <h3 className="featured-card__title">{restaurant.name}</h3>
                    <p className="featured-card__subtitle">{restaurant.cuisine} • {restaurant.location}</p>

                    <div className="featured-card__details">
                        <div className="featured-card__detail">
                            <Icon icon="mdi:star" />
                            <span>{restaurant.rating} ({restaurant.review_count?.toLocaleString()} reviews)</span>
                        </div>
                        <div className="featured-card__detail">
                            <Icon icon="mdi:cash-multiple" />
                            <span>{restaurant.price_level}</span>
                        </div>
                        {restaurant.opening_hours && (
                            <div className="featured-card__detail">
                                <Icon icon="mdi:clock-outline" />
                                <span>{restaurant.opening_hours}</span>
                            </div>
                        )}
                    </div>

                    <div className="featured-card__footer">
                        <div className="featured-card__price">
                            <span className="featured-card__price-amount" style={{ color: 'var(--primary-color, #3b82f6)' }}>
                                {restaurant.price_level}
                            </span>
                            <span className="featured-card__price-label">price level</span>
                        </div>
                        {restaurant.booking_url && (
                            <button className="book-now-btn" onClick={handleBookNow}>
                                Reserve Now
                                <Icon icon="mdi:arrow-right" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="alternative-card" onClick={handleBookNow}>
            {restaurant.image_url && (
                <img
                    src={restaurant.image_url}
                    alt={restaurant.name}
                    className="alternative-card__image"
                />
            )}
            <div className="alternative-card__content">
                <h4 className="alternative-card__title">{restaurant.name}</h4>
                <p className="alternative-card__subtitle">{restaurant.cuisine}</p>
                <div className="alternative-card__details">
                    <span className="alternative-card__detail">
                        <Icon icon="mdi:star" />
                        {restaurant.rating}
                    </span>
                    <span className="alternative-card__detail">
                        <Icon icon="mdi:cash" />
                        {restaurant.price_level}
                    </span>
                </div>
            </div>
            <div className="alternative-card__price">
                <span className="alternative-card__price-amount" style={{ color: 'var(--primary-color)' }}>
                    {restaurant.price_level}
                </span>
            </div>
        </div>
    );
};

const RestaurantPanel: React.FC<RestaurantPanelProps> = ({
    data,
    onClose,
    isLoading,
    error
}) => {
    return (
        <div className="element-panel">
            <div className="element-panel__header">
                <h2 className="element-panel__title">
                    <Icon icon="mdi:food" />
                    Restaurant Options
                </h2>
                <button className="element-panel__close" onClick={onClose}>
                    <Icon icon="mdi:close" />
                </button>
            </div>

            <div className="element-panel__content">
                {isLoading && (
                    <div className="element-panel__loading">
                        <div className="element-panel__loading-spinner" />
                        <span>Searching for restaurants...</span>
                    </div>
                )}

                {error && (
                    <div className="element-panel__error">
                        <Icon icon="mdi:alert-circle" style={{ fontSize: '2rem', marginBottom: '8px' }} />
                        <p>{error}</p>
                    </div>
                )}

                {!isLoading && !error && data && (
                    <>
                        <RestaurantCard restaurant={data.featured} isFeatured />

                        {data.alternatives.length > 0 && (
                            <div className="alternatives-section">
                                <h3 className="alternatives-section__title">Other Options</h3>
                                <div className="alternatives-list">
                                    {data.alternatives.map((restaurant) => (
                                        <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default RestaurantPanel;
