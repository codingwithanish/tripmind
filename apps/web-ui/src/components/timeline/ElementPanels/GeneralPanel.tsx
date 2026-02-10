import React from 'react';
import './ElementPanels.css';
import MarkdownRenderer from '../../common/MarkdownRenderer/MarkdownRenderer';

interface GeneralItem {
    id: string;
    name?: string;
    title?: string;
    description?: string;
    icon?: string;
    price?: string;
    rating?: number;
    reviews?: number;
    action_url?: string;
    action_label?: string;
}

interface GeneralSearchResults {
    category: string;
    title?: string;
    description?: string;
    markdown_content?: string;
    items?: GeneralItem[];
    options?: GeneralItem[];
}

interface GeneralPanelProps {
    data: GeneralSearchResults;
    onClose: () => void;
    isLoading?: boolean;
    error?: string | null;
    title?: string;
}

// Default fallback markdown content (when no content is provided)
const DEFAULT_MARKDOWN_CONTENT = `
## 📋 Details

Click on any item in the timeline to see detailed information here.

### What You'll Find
- 📍 **Location details** and directions
- 💰 **Pricing information** in your currency
- ⏰ **Timing tips** and recommendations
- ⚠️ **Important warnings** and reminders

> 💡 **Tip**: Each activity, restaurant, and task has its own detailed guide!
`;

// Icon wrapper component
const Icon: React.FC<{ icon: string; className?: string; style?: React.CSSProperties }> = ({ icon, className, style }) => {
    return React.createElement('iconify-icon', { icon, class: className, style });
};

const GeneralPanel: React.FC<GeneralPanelProps> = ({
    data,
    onClose,
    isLoading,
    error,
    title = 'Details'
}) => {
    const getPanelIcon = () => {
        const category = data?.category?.toLowerCase() || '';
        if (category.includes('activity')) return 'mdi:hiking';
        if (category.includes('notes')) return 'mdi:note-text';
        return 'mdi:information';
    };

    // Support both items and options arrays
    const displayItems = data?.items || data?.options || [];

    return (
        <div className="element-panel">
            <div className="element-panel__header">
                <h2 className="element-panel__title">
                    <Icon icon={getPanelIcon()} />
                    {title || data?.title || 'Details'}
                </h2>
                <button className="element-panel__close" onClick={onClose}>
                    <Icon icon="mdi:close" />
                </button>
            </div>

            <div className="element-panel__content">
                {isLoading && (
                    <div className="element-panel__loading">
                        <div className="element-panel__loading-spinner" />
                        <span>Loading details...</span>
                    </div>
                )}

                {error && (
                    <div className="element-panel__error">
                        <Icon icon="mdi:alert-circle" style={{ fontSize: '2rem', marginBottom: '8px' }} />
                        <p>{error}</p>
                    </div>
                )}

                {!isLoading && !error && data && (
                    <div className="general-items">
                        {/* Show markdown content if available */}
                        {(data.markdown_content || (!data.description && displayItems.length === 0)) && (
                            <div style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '12px',
                                padding: '20px',
                                marginBottom: '16px'
                            }}>
                                <MarkdownRenderer content={data.markdown_content || DEFAULT_MARKDOWN_CONTENT} />
                            </div>
                        )}

                        {/* Show main description if available (and no markdown) */}
                        {data.description && !data.markdown_content && (
                            <div style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '12px',
                                padding: '20px',
                                marginBottom: '16px'
                            }}>
                                <p style={{
                                    margin: 0,
                                    fontSize: '0.9rem',
                                    color: 'var(--text-secondary, rgba(255, 255, 255, 0.7))',
                                    lineHeight: 1.6
                                }}>
                                    {data.description}
                                </p>
                            </div>
                        )}

                        {/* Display items/options */}
                        {displayItems.length > 0 ? (
                            displayItems.map((item) => (
                                <div key={item.id} className="general-item" style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '12px',
                                    padding: '20px',
                                    marginBottom: '12px'
                                }}>
                                    <div style={{ display: 'flex', gap: '16px' }}>
                                        {item.icon && (
                                            <div style={{
                                                width: '48px',
                                                height: '48px',
                                                borderRadius: '12px',
                                                background: 'rgba(59, 130, 246, 0.2)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0
                                            }}>
                                                <Icon icon={item.icon} style={{ fontSize: '1.5rem', color: 'var(--primary-color, #3b82f6)' }} />
                                            </div>
                                        )}
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem', fontWeight: 600 }}>
                                                {item.name || item.title}
                                            </h4>
                                            {item.description && (
                                                <p style={{
                                                    margin: 0,
                                                    fontSize: '0.875rem',
                                                    color: 'var(--text-secondary, rgba(255, 255, 255, 0.7))',
                                                    lineHeight: 1.5
                                                }}>
                                                    {item.description}
                                                </p>
                                            )}
                                            <div style={{ display: 'flex', gap: '16px', marginTop: '12px', flexWrap: 'wrap' }}>
                                                {item.price && (
                                                    <span style={{ fontSize: '0.875rem', color: 'var(--color-success, #10b981)', fontWeight: 600 }}>
                                                        {item.price}
                                                    </span>
                                                )}
                                                {item.rating && (
                                                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                                        ⭐ {item.rating} ({item.reviews} reviews)
                                                    </span>
                                                )}
                                            </div>
                                            {item.action_url && item.action_label && (
                                                <a
                                                    href={item.action_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        marginTop: '12px',
                                                        color: 'var(--primary-color, #3b82f6)',
                                                        textDecoration: 'none',
                                                        fontSize: '0.875rem',
                                                        fontWeight: 500
                                                    }}
                                                >
                                                    {item.action_label}
                                                    <Icon icon="mdi:arrow-right" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{
                                textAlign: 'center',
                                padding: '40px 20px',
                                color: 'var(--text-tertiary)'
                            }}>
                                <Icon icon="mdi:information-outline" style={{ fontSize: '3rem', marginBottom: '12px', opacity: 0.5 }} />
                                <p>No additional details available</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GeneralPanel;

