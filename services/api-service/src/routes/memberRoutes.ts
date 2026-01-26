import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware';
import { getProfile, addMember, deleteMember } from '../controllers/memberController';

const router = Router();

// all routes require authentication
router.use(authMiddleware);

router.get('/', getProfile);
router.post('/', addMember);
router.delete('/:id', deleteMember);

export default router;
