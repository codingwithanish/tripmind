import { Request, Response } from 'express';
import suggestionService from '@services/suggestionService';

class SuggestionController {
    /**
     * Get all suggestion templates
     */
    async getSuggestionTemplates(_req: Request, res: Response): Promise<void> {
        try {
            const templates = await suggestionService.getSuggestionTemplates();

            res.json({
                success: true,
                data: templates,
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to fetch suggestion templates',
            });
        }
    }
}

export default new SuggestionController();
