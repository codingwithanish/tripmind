import React from 'react';
import { RecommendationElement } from '../../../types/websocket.types';
import './RecommendationCard.css';

export interface RecommendationCardProps {
    recommendation: RecommendationElement;
    onAccept?: (id: string) => void;
    onIgnore?: (id: string) => void;
}

const typeIcons: Record<string, string> = {
    hotel: '🏨',
    flight: '✈️',
    place: '📍',
    cab: '🚕',
    restaurant: '🍽️',
};

const RecommendationCard: React.FC<RecommendationCardProps> = ({
    recommendation,
    onAccept,
    onIgnore
}) => {
    const formatPrice = (): string => {
        if (!recommendation.price_included || !recommendation.price_info) return '';

        const { price_info } = recommendation;
        if (price_info.type === 'constant' && price_info.value) {
            return `${price_info.unit} ${price_info.value}`;
        }
        if (price_info.type === 'range' && price_info.range) {
            return `${price_info.unit} ${price_info.range.min} - ${price_info.range.max}`;
        }
        return '';
    };

    const isActionable = recommendation.action_state === 'suggested';

    return (
        <div className={`recommendation-card recommendation-card--${recommendation.action_state}`}>
            {recommendation.title_image && (
                <div className="recommendation-card__image">
                    <img src={recommendation.title_image} alt={recommendation.title} />
                    <span className="recommendation-card__type-badge">
                        {typeIcons[recommendation.type] || '📌'}
                    </span>
                </div>
            )}

            <div className="recommendation-card__content">
                <h4 className="recommendation-card__title">{recommendation.title}</h4>
                <p className="recommendation-card__description">{recommendation.description}</p>

                <div className="recommendation-card__footer">
                    {recommendation.price_included && (
                        <span className="recommendation-card__price">{formatPrice()}</span>
                    )}

                    {isActionable && (
                        <div className="recommendation-card__actions">
                            {onAccept && (
                                <button
                                    className="recommendation-card__btn recommendation-card__btn--accept"
                                    onClick={() => onAccept(recommendation.id)}
                                    title="Accept recommendation"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                    Accept
                                </button>
                            )}
                            {onIgnore && (
                                <button
                                    className="recommendation-card__btn recommendation-card__btn--ignore"
                                    onClick={() => onIgnore(recommendation.id)}
                                    title="Ignore recommendation"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecommendationCard;
