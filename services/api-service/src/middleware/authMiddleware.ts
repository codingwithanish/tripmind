import { Request, Response, NextFunction } from 'express';
import authService from '@services/authService';

// Demo user for development/testing with hardcoded credentials
const DEMO_USER = {
  userId: 'demo-user-1',
  email: 'user@tripmind.com',
  name: 'TripMind User',
};

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'No token provided',
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Check for demo token (for development/testing with hardcoded credentials)
    if (token.startsWith('demo-token-')) {
      // Attach demo user info to request object
      (req as any).user = DEMO_USER;
      next();
      return;
    }

    const payload = authService.verifyToken(token);

    // Attach user info to request object
    (req as any).user = payload;

    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
    });
  }
};

export default authMiddleware;

