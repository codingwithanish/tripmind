import { Router, Request, Response } from 'express';
import passport from 'passport';
import authController from '@controllers/authController';
import { env } from '@config/env';

const router = Router();

// Local authentication routes
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/logout', authController.logout);

// Google OAuth routes
router.get(
    '/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        session: false,
    })
);

router.get(
    '/google/callback',
    passport.authenticate('google', {
        session: false,
        failureRedirect: `${env.FRONTEND_URL}/login?error=google_auth_failed`,
    }),
    (req: Request, res: Response) => {
        // Get user and token from passport
        const { user, token } = req.user as { user: any; token: string };

        // Redirect to frontend with token
        res.redirect(`${env.FRONTEND_URL}/auth/callback?token=${token}&email=${encodeURIComponent(user.email)}&name=${encodeURIComponent(user.name)}`);
    }
);

export default router;
