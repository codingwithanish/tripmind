import { Router } from 'express';
import authRoutes from './authRoutes';
import travelRoutes from './travelRoutes';
import chatRoutes from './chatRoutes';
import timelineRoutes from './timelineRoutes';
import suggestionRoutes from './suggestionRoutes';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/travels', travelRoutes);
router.use('/chat', chatRoutes);
router.use('/timelines', timelineRoutes);
router.use('/suggestions', suggestionRoutes);

// Health check endpoint
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;

