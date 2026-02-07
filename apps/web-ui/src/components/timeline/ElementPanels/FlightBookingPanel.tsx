import React from 'react';
import './ElementPanels.css';

interface FlightResult {
    id: string;
    airline: string;
    airline_logo?: string;
    flight_number: string;
    departure_airport: string;
    arrival_airport: string;
    departure_time: string;
    arrival_time: string;
    departure_date: string;
    duration: string;
    stops: number;
    stops_description?: string;
    price: number;
    currency: string;
    booking_url?: string;
    cabin_class: string;
}

interface FlightSearchResults {
    category: 'flight-booking';
    featured: FlightResult;
    alternatives: FlightResult[];
}

interface FlightBookingPanelProps {
    data: FlightSearchResults;
    onClose: () => void;
    isLoading?: boolean;
    error?: string | null;
}

// Icon wrapper component
const Icon: React.FC<{ icon: string; className?: string; style?: React.CSSProperties }> = ({ icon, className, style }) => {
    return React.createElement('iconify-icon', { icon, class: className, style });
};

const FlightCard: React.FC<{ flight: FlightResult; isFeatured?: boolean }> = ({ flight, isFeatured }) => {
    const handleBookNow = () => {
        if (flight.booking_url) {
            window.open(flight.booking_url, '_blank', 'noopener,noreferrer');
        }
    };

    if (isFeatured) {
        return (
            <div className="featured-card">
                <div className="featured-card__badge">
                    <Icon icon="mdi:star" /> Recommended
                </div>
                <div className="featured-card__content">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                        {flight.airline_logo && (
                            <img
                                src={flight.airline_logo}
                                alt={flight.airline}
                                style={{ width: '60px', height: '40px', objectFit: 'contain' }}
                            />
                        )}
                        <div>
                            <h3 className="featured-card__title">{flight.airline}</h3>
                            <p className="featured-card__subtitle">{flight.flight_number} • {flight.cabin_class}</p>
                        </div>
                    </div>

                    <div className="featured-card__details">
                        <div className="featured-card__detail">
                            <Icon icon="mdi:calendar" />
                            <span>{flight.departure_date}</span>
                        </div>
                        <div className="featured-card__detail">
                            <Icon icon="mdi:airplane-takeoff" />
                            <span>{flight.departure_airport}</span>
                        </div>
                        <div className="featured-card__detail">
                            <Icon icon="mdi:arrow-right" />
                        </div>
                        <div className="featured-card__detail">
                            <Icon icon="mdi:airplane-landing" />
                            <span>{flight.arrival_airport}</span>
                        </div>
                        <div className="featured-card__detail">
                            <Icon icon="mdi:clock-outline" />
                            <span>{flight.duration}</span>
                        </div>
                        <div className="featured-card__detail">
                            <Icon icon="mdi:transit-connection-variant" />
                            <span>{flight.stops_description || (flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`)}</span>
                        </div>
                    </div>

                    <div className="featured-card__footer">
                        <div className="featured-card__price">
                            <span className="featured-card__price-amount">
                                {flight.currency === 'USD' ? '$' : flight.currency}{flight.price.toLocaleString()}
                            </span>
                            <span className="featured-card__price-label">per person</span>
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
            {flight.airline_logo && (
                <img
                    src={flight.airline_logo}
                    alt={flight.airline}
                    className="alternative-card__logo"
                />
            )}
            <div className="alternative-card__content">
                <h4 className="alternative-card__title">{flight.airline}</h4>
                <p className="alternative-card__subtitle">{flight.flight_number} • {flight.departure_airport} → {flight.arrival_airport}</p>
                <div className="alternative-card__details">
                    <span className="alternative-card__detail">
                        <Icon icon="mdi:clock-outline" />
                        {flight.duration}
                    </span>
                    <span className="alternative-card__detail">
                        <Icon icon="mdi:transit-connection-variant" />
                        {flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                    </span>
                </div>
            </div>
            <div className="alternative-card__price">
                <span className="alternative-card__price-amount">
                    ${flight.price.toLocaleString()}
                </span>
                <span className="alternative-card__price-label">per person</span>
            </div>
        </div>
    );
};

const FlightBookingPanel: React.FC<FlightBookingPanelProps> = ({
    data,
    onClose,
    isLoading,
    error
}) => {
    return (
        <div className="element-panel">
            <div className="element-panel__header">
                <h2 className="element-panel__title">
                    <Icon icon="mdi:airplane" />
                    Flight Options
                </h2>
                <button className="element-panel__close" onClick={onClose}>
                    <Icon icon="mdi:close" />
                </button>
            </div>

            <div className="element-panel__content">
                {isLoading && (
                    <div className="element-panel__loading">
                        <div className="element-panel__loading-spinner" />
                        <span>Searching for flights...</span>
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
                        <FlightCard flight={data.featured} isFeatured />

                        {data.alternatives.length > 0 && (
                            <div className="alternatives-section">
                                <h3 className="alternatives-section__title">Other Options</h3>
                                <div className="alternatives-list">
                                    {data.alternatives.map((flight) => (
                                        <FlightCard key={flight.id} flight={flight} />
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

export default FlightBookingPanel;
