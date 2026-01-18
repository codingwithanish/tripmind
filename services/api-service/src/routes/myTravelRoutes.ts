import { Router } from 'express';
import myTravelController from '@controllers/myTravelController';
import authMiddleware from '@middleware/authMiddleware';

const router = Router();

// All my-travel routes require authentication
router.use(authMiddleware);

// GET /api/v1/my-travel - Get all travels with pagination and optional status filter
// Query params: page (default: 1), limit (default: 10, max: 50), status (optional)
router.get('/', myTravelController.getMyTravels);

export default router;
