import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import { env } from './env';
import authService from '@services/authService';

/**
 * Configure Passport with Google OAuth 2.0 strategy
 */
export const configurePassport = (): void => {
    // Only configure if credentials are present
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
        console.warn('Google OAuth credentials not configured. Skipping Google strategy.');
        return;
    }

    passport.use(
        new GoogleStrategy(
            {
                clientID: env.GOOGLE_CLIENT_ID,
                clientSecret: env.GOOGLE_CLIENT_SECRET,
                callbackURL: env.GOOGLE_CALLBACK_URL || `http://localhost:${env.PORT}/api/auth/google/callback`,
                scope: ['profile', 'email'],
            },
            async (
                _accessToken: string,
                _refreshToken: string,
                profile: Profile,
                done: (error: Error | null, user?: any) => void
            ) => {
                try {
                    // Extract user info from Google profile
                    const email = profile.emails?.[0]?.value;
                    const name = profile.displayName || profile.name?.givenName || 'User';
                    const avatar = profile.photos?.[0]?.value;
                    const providerId = profile.id;

                    if (!email) {
                        return done(new Error('No email found in Google profile'));
                    }

                    // Use existing oauthLogin method for user creation/lookup
                    const result = await authService.oauthLogin(
                        'google',
                        providerId,
                        email,
                        name,
                        avatar
                    );

                    done(null, { user: result.user, token: result.token });
                } catch (error: any) {
                    done(error);
                }
            }
        )
    );

    // Passport serialization (for session support if needed)
    passport.serializeUser((user: any, done) => {
        done(null, user);
    });

    passport.deserializeUser((user: any, done) => {
        done(null, user);
    });
};

export default configurePassport;
