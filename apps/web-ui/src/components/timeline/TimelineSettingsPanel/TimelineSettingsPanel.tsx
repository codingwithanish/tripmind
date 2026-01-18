import React, { useState } from 'react';
import './TimelineSettingsPanel.css';

interface TimelineSettingsPanelProps {
    userId: string;
    threadId: string;
    onTimelineUpdate?: () => void;
}

interface Version {
    id: string;
    name: string;
    created_at: string;
    is_current: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const TimelineSettingsPanel: React.FC<TimelineSettingsPanelProps> = ({
    userId,
    threadId,
    onTimelineUpdate
}) => {
    const [loading, setLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [showVersionPicker, setShowVersionPicker] = useState(false);
    const [versions, setVersions] = useState<Version[]>([]);
    const [showConfirmDialog, setShowConfirmDialog] = useState<string | null>(null);

    const handleAction = async (action: string, confirmMessage?: string) => {
        if (confirmMessage && !showConfirmDialog) {
            setShowConfirmDialog(action);
            return;
        }

        setShowConfirmDialog(null);
        setLoading(action);
        setError(null);
        setSuccess(null);

        try {
            let response: Response;
            switch (action) {
                case 'create-version':
                    response = await fetch(`${API_BASE_URL}/timeline/${userId}/${threadId}/versions`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: `Version ${new Date().toLocaleDateString()}` })
                    });
                    if (response.ok) setSuccess('New version created successfully');
                    break;

                case 'confirm-timeline':
                    response = await fetch(`${API_BASE_URL}/timeline/${userId}/${threadId}/confirm`, {
                        method: 'POST'
                    });
                    if (response.ok) setSuccess('Timeline confirmed successfully');
                    break;

                case 'delete-timeline':
                    response = await fetch(`${API_BASE_URL}/timeline/${userId}/${threadId}`, {
                        method: 'DELETE'
                    });
                    if (response.ok) {
                        setSuccess('Timeline deleted');
                        // Navigate away handled by parent
                    }
                    break;

                default:
                    return;
            }

            if (response && !response.ok) {
                throw new Error('Action failed');
            }

            onTimelineUpdate?.();
        } catch (err) {
            console.error(`Failed to ${action}:`, err);
            setError(`Failed to ${action.replace('-', ' ')}`);
        } finally {
            setLoading(null);
        }
    };

    const handleLoadVersions = async () => {
        setLoading('load-versions');
        try {
            const response = await fetch(`${API_BASE_URL}/timeline/${userId}/${threadId}/versions`);
            if (response.ok) {
                const data = await response.json();
                setVersions(data.versions || []);
                setShowVersionPicker(true);
            }
        } catch (err) {
            console.error('Failed to load versions:', err);
            setError('Failed to load versions');
        } finally {
            setLoading(null);
        }
    };

    const handleSwitchVersion = async (versionId: string) => {
        setLoading('switch-version');
        try {
            const response = await fetch(`${API_BASE_URL}/timeline/${userId}/${threadId}/version`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ version_id: versionId })
            });
            if (response.ok) {
                setSuccess('Version switched successfully');
                setShowVersionPicker(false);
                onTimelineUpdate?.();
            }
        } catch (err) {
            console.error('Failed to switch version:', err);
            setError('Failed to switch version');
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="settings-panel">
            <div className="settings-panel__header">
                <h3>Timeline Settings</h3>
            </div>

            {error && (
                <div className="settings-panel__alert settings-panel__alert--error">
                    {error}
                    <button onClick={() => setError(null)}>×</button>
                </div>
            )}

            {success && (
                <div className="settings-panel__alert settings-panel__alert--success">
                    {success}
                    <button onClick={() => setSuccess(null)}>×</button>
                </div>
            )}

            <div className="settings-panel__content">
                <div className="settings-panel__section">
                    <h4>Version Management</h4>
                    <p className="settings-panel__description">
                        Create and manage multiple versions of your timeline
                    </p>
                    <div className="settings-panel__actions">
                        <button
                            className="settings-panel__btn settings-panel__btn--primary"
                            onClick={() => handleAction('create-version')}
                            disabled={loading !== null}
                        >
                            {loading === 'create-version' ? (
                                <span className="settings-panel__spinner" />
                            ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="12" y1="5" x2="12" y2="19" />
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                            )}
                            Create New Version
                        </button>
                        <button
                            className="settings-panel__btn settings-panel__btn--secondary"
                            onClick={handleLoadVersions}
                            disabled={loading !== null}
                        >
                            {loading === 'load-versions' ? (
                                <span className="settings-panel__spinner" />
                            ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="1 4 1 10 7 10" />
                                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                                </svg>
                            )}
                            Switch Version
                        </button>
                    </div>
                </div>

                <div className="settings-panel__section">
                    <h4>Timeline Actions</h4>
                    <p className="settings-panel__description">
                        Finalize or remove this travel timeline
                    </p>
                    <div className="settings-panel__actions">
                        <button
                            className="settings-panel__btn settings-panel__btn--success"
                            onClick={() => handleAction('confirm-timeline')}
                            disabled={loading !== null}
                        >
                            {loading === 'confirm-timeline' ? (
                                <span className="settings-panel__spinner" />
                            ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            )}
                            Confirm Timeline
                        </button>
                        <button
                            className="settings-panel__btn settings-panel__btn--danger"
                            onClick={() => handleAction('delete-timeline', 'Are you sure you want to delete this timeline?')}
                            disabled={loading !== null}
                        >
                            {loading === 'delete-timeline' ? (
                                <span className="settings-panel__spinner" />
                            ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </svg>
                            )}
                            Delete Timeline
                        </button>
                    </div>
                </div>
            </div>

            {/* Version Picker Modal */}
            {showVersionPicker && (
                <div className="settings-panel__modal-overlay" onClick={() => setShowVersionPicker(false)}>
                    <div className="settings-panel__modal" onClick={e => e.stopPropagation()}>
                        <div className="settings-panel__modal-header">
                            <h4>Select Version</h4>
                            <button onClick={() => setShowVersionPicker(false)}>×</button>
                        </div>
                        <div className="settings-panel__modal-content">
                            {versions.length === 0 ? (
                                <p className="settings-panel__modal-empty">No other versions available</p>
                            ) : (
                                <ul className="settings-panel__version-list">
                                    {versions.map(version => (
                                        <li
                                            key={version.id}
                                            className={`settings-panel__version-item ${version.is_current ? 'settings-panel__version-item--current' : ''}`}
                                            onClick={() => !version.is_current && handleSwitchVersion(version.id)}
                                        >
                                            <span>{version.name}</span>
                                            <span className="settings-panel__version-date">
                                                {new Date(version.created_at).toLocaleDateString()}
                                            </span>
                                            {version.is_current && <span className="settings-panel__version-badge">Current</span>}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Dialog */}
            {showConfirmDialog && (
                <div className="settings-panel__modal-overlay" onClick={() => setShowConfirmDialog(null)}>
                    <div className="settings-panel__modal settings-panel__modal--small" onClick={e => e.stopPropagation()}>
                        <div className="settings-panel__modal-header">
                            <h4>Confirm Action</h4>
                        </div>
                        <div className="settings-panel__modal-content">
                            <p>Are you sure you want to delete this timeline? This action cannot be undone.</p>
                        </div>
                        <div className="settings-panel__modal-actions">
                            <button
                                className="settings-panel__btn settings-panel__btn--secondary"
                                onClick={() => setShowConfirmDialog(null)}
                            >
                                Cancel
                            </button>
                            <button
                                className="settings-panel__btn settings-panel__btn--danger"
                                onClick={() => handleAction(showConfirmDialog)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TimelineSettingsPanel;
