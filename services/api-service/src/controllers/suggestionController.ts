import { Request, Response } from 'express';
import suggestionService from '@services/suggestionService';

class SuggestionController {
    /**
     * Get all suggestion templates
     */
    async getSuggestionTemplates(req: Request, res: Response): Promise<void> {
        try {
            const { lat, lng, screenType } = req.query;

            if (!lat || !lng || !screenType) {
                res.status(400).json({
                    success: false,
                    error: 'Missing required parameters: lat, lng, screenType which are required for suggestions',
                });
                return;
            }

            const templates = await suggestionService.getSuggestionTemplates({
                lat: parseFloat(lat as string),
                lng: parseFloat(lng as string),
                screenType: screenType as 'mobile' | 'desktop',
            });

            res.json({
                success: true,
                data: templates,
            });
        } catch (error: any) {
            console.error('Error fetching suggestions:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to fetch suggestion templates',
            });
        }
    }
}

export default new SuggestionController();
