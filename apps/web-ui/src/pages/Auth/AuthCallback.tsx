import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@utils/constants';
import './Login.css';

/**
 * OAuth callback handler component.
 * Processes the token from URL params after Google OAuth redirect.
 */
const AuthCallback: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { handleOAuthCallback } = useAuth();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const processCallback = async () => {
            const token = searchParams.get('token');
            const email = searchParams.get('email');
            const name = searchParams.get('name');
            const errorParam = searchParams.get('error');

            if (errorParam) {
                setError('Google authentication failed. Please try again.');
                setTimeout(() => navigate(ROUTES.LOGIN), 3000);
                return;
            }

            if (token && email && name) {
                const result = await handleOAuthCallback(token, email, name);
                if (result.success) {
                    navigate(ROUTES.HOME, { replace: true });
                } else {
                    setError(result.error || 'Authentication failed');
                    setTimeout(() => navigate(ROUTES.LOGIN), 3000);
                }
            } else {
                setError('Invalid callback parameters');
                setTimeout(() => navigate(ROUTES.LOGIN), 3000);
            }
        };

        processCallback();
    }, [searchParams, handleOAuthCallback, navigate]);

    if (error) {
        return (
            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        <div className="login-icon login-icon--error">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                            </svg>
                        </div>
                        <h1 className="login-title">Authentication Error</h1>
                        <p className="login-subtitle">{error}</p>
                        <p className="login-subtitle">Redirecting to login...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <div className="login-icon">
                        <span className="login-spinner"></span>
                    </div>
                    <h1 className="login-title">Signing you in...</h1>
                    <p className="login-subtitle">Please wait while we complete your authentication</p>
                </div>
            </div>
        </div>
    );
};

export default AuthCallback;
