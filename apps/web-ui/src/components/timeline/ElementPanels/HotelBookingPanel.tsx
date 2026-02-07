import React from 'react';
import './ElementPanels.css';

interface HotelResult {
    id: string;
    name: string;
    image_url?: string;
    location: string;
    rating: number;
    review_score?: number;
    review_count?: number;
    price_per_night: number;
    currency: string;
    amenities: string[];
    booking_url?: string;
    room_type: string;
}

interface HotelSearchResults {
    category: 'hotel-booking';
    featured: HotelResult;
    alternatives: HotelResult[];
}

interface HotelBookingPanelProps {
    data: HotelSearchResults;
    onClose: () => void;
    isLoading?: boolean;
    error?: string | null;
}

// Icon wrapper component
const Icon: React.FC<{ icon: string; className?: string; style?: React.CSSProperties }> = ({ icon, className, style }) => {
    return React.createElement('iconify-icon', { icon, class: className, style });
};

const RatingStars: React.FC<{ rating: number }> = ({ rating }) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    return (
        <div className="rating__stars">
            {[...Array(fullStars)].map((_, i) => (
                <Icon key={i} icon="mdi:star" />
            ))}
            {hasHalfStar && <Icon icon="mdi:star-half" />}
            {[...Array(5 - Math.ceil(rating))].map((_, i) => (
                <Icon key={`empty-${i}`} icon="mdi:star-outline" />
            ))}
        </div>
    );
};

const HotelCard: React.FC<{ hotel: HotelResult; isFeatured?: boolean }> = ({ hotel, isFeatured }) => {
    const handleBookNow = () => {
        if (hotel.booking_url) {
            window.open(hotel.booking_url, '_blank', 'noopener,noreferrer');
        }
    };

    if (isFeatured) {
        return (
            <div className="featured-card">
                <div className="featured-card__badge">
                    <Icon icon="mdi:star" /> Recommended
                </div>
                {hotel.image_url && (
                    <img
                        src={hotel.image_url}
                        alt={hotel.name}
                        className="featured-card__image"
                    />
                )}
                <div className="featured-card__content">
                    <h3 className="featured-card__title">{hotel.name}</h3>
                    <p className="featured-card__subtitle">{hotel.location}</p>

                    <div className="rating" style={{ marginBottom: '12px' }}>
                        <RatingStars rating={hotel.rating} />
                        {hotel.review_score && (
                            <span className="rating__score" style={{ marginLeft: '8px' }}>
                                {hotel.review_score}
                            </span>
                        )}
                        {hotel.review_count && (
                            <span className="rating__count" style={{ marginLeft: '4px' }}>
                                ({hotel.review_count.toLocaleString()} reviews)
                            </span>
                        )}
                    </div>

                    <div className="featured-card__details">
                        <div className="featured-card__detail">
                            <Icon icon="mdi:bed" />
                            <span>{hotel.room_type}</span>
                        </div>
                    </div>

                    {hotel.amenities.length > 0 && (
                        <div className="amenities" style={{ marginBottom: '16px' }}>
                            {hotel.amenities.slice(0, 5).map((amenity, i) => (
                                <span key={i} className="amenity-tag">{amenity}</span>
                            ))}
                        </div>
                    )}

                    <div className="featured-card__footer">
                        <div className="featured-card__price">
                            <span className="featured-card__price-amount">
                                {hotel.currency === 'USD' ? '$' : hotel.currency}{hotel.price_per_night.toLocaleString()}
                            </span>
                            <span className="featured-card__price-label">per night</span>
                        </div>
                        <button className="book-now-btn" onClick={handleBookNow}>
                            Book Now
                            <Icon icon="mdi:arrow-right" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="alternative-card" onClick={handleBookNow}>
            {hotel.image_url && (
                <img
                    src={hotel.image_url}
                    alt={hotel.name}
                    className="alternative-card__image"
                />
            )}
            <div className="alternative-card__content">
                <h4 className="alternative-card__title">{hotel.name}</h4>
                <p className="alternative-card__subtitle">{hotel.location}</p>
                <div className="alternative-card__details">
                    <span className="alternative-card__detail">
                        <RatingStars rating={hotel.rating} />
                    </span>
                    {hotel.review_score && (
                        <span className="alternative-card__detail">
                            {hotel.review_score}
                        </span>
                    )}
                </div>
            </div>
            <div className="alternative-card__price">
                <span className="alternative-card__price-amount">
                    ${hotel.price_per_night.toLocaleString()}
                </span>
                <span className="alternative-card__price-label">per night</span>
            </div>
        </div>
    );
};

const HotelBookingPanel: React.FC<HotelBookingPanelProps> = ({
    data,
    onClose,
    isLoading,
    error
}) => {
    return (
        <div className="element-panel">
            <div className="element-panel__header">
                <h2 className="element-panel__title">
                    <Icon icon="mdi:bed" />
                    Hotel Options
                </h2>
                <button className="element-panel__close" onClick={onClose}>
                    <Icon icon="mdi:close" />
                </button>
            </div>

            <div className="element-panel__content">
                {isLoading && (
                    <div className="element-panel__loading">
                        <div className="element-panel__loading-spinner" />
                        <span>Searching for hotels...</span>
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
                        <HotelCard hotel={data.featured} isFeatured />

                        {data.alternatives.length > 0 && (
                            <div className="alternatives-section">
                                <h3 className="alternatives-section__title">Other Options</h3>
                                <div className="alternatives-list">
                                    {data.alternatives.map((hotel) => (
                                        <HotelCard key={hotel.id} hotel={hotel} />
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

export default HotelBookingPanel;
