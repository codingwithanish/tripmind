import { Request, Response } from 'express';
import myTravelService, { TravelCardStatus } from '@services/myTravelService';

const validStatuses: TravelCardStatus[] = ['confirmed', 'planning', 'completed', 'dropped'];

class MyTravelController {
    /**
     * Get all travels for user with pagination and optional status filter
     */
    async getMyTravels(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user.userId;

            // Parse pagination parameters
            const page = Math.max(1, parseInt(req.query.page as string) || 1);
            const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));

            // Parse status filter
            const statusParam = req.query.status as string | undefined;
            let status: TravelCardStatus | undefined;

            if (statusParam) {
                const lowerStatus = statusParam.toLowerCase() as TravelCardStatus;
                if (validStatuses.includes(lowerStatus)) {
                    status = lowerStatus;
                } else {
                    res.status(400).json({
                        success: false,
                        error: `Invalid status. Valid values are: ${validStatuses.join(', ')}`,
                    });
                    return;
                }
            }

            const result = await myTravelService.getMyTravels(userId, page, limit, status);

            res.json({
                success: true,
                ...result,
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to fetch travels',
            });
        }
    }
}

export default new MyTravelController();
