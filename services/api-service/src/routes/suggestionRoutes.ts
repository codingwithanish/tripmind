import { Router } from 'express';
import suggestionController from '@controllers/suggestionController';

const router = Router();

// Public endpoint - no authentication required
router.get('/templates', suggestionController.getSuggestionTemplates);

export default router;
