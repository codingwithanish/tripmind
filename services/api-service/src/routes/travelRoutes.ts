import { Router } from 'express';
import travelController from '@controllers/travelController';
import authMiddleware from '@middleware/authMiddleware';

const router = Router();

// All travel routes require authentication
router.use(authMiddleware);

router.get('/', travelController.getAllTravels);
router.get('/:id', travelController.getTravelById);
router.post('/', travelController.createTravel);
router.put('/:id', travelController.updateTravel);
router.delete('/:id', travelController.deleteTravel);
router.post('/:id/confirm', travelController.confirmTravel);

export default router;
