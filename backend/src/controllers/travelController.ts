import { Request, Response } from 'express';
import travelService from '@services/travelService';

class TravelController {
  /**
   * Get all travels for user
   */
  async getAllTravels(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const travels = await travelService.getAllTravels(userId);

      res.json({
        success: true,
        data: travels,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch travels',
      });
    }
  }

  /**
   * Get travel by ID
   */
  async getTravelById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user.userId;

      const travel = await travelService.getTravelById(id, userId);

      if (!travel) {
        res.status(404).json({
          success: false,
          error: 'Travel not found',
        });
        return;
      }

      res.json({
        success: true,
        data: travel,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch travel',
      });
    }
  }

  /**
   * Create new travel
   */
  async createTravel(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const travel = await travelService.createTravel(userId, req.body);

      res.status(201).json({
        success: true,
        data: travel,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to create travel',
      });
    }
  }

  /**
   * Update travel
   */
  async updateTravel(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user.userId;

      const travel = await travelService.updateTravel(id, userId, req.body);

      res.json({
        success: true,
        data: travel,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to update travel',
      });
    }
  }

  /**
   * Delete travel
   */
  async deleteTravel(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user.userId;

      await travelService.deleteTravel(id, userId);

      res.json({
        success: true,
        message: 'Travel deleted successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to delete travel',
      });
    }
  }

  /**
   * Confirm travel
   */
  async confirmTravel(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user.userId;

      const travel = await travelService.confirmTravel(id, userId);

      res.json({
        success: true,
        data: travel,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to confirm travel',
      });
    }
  }
}

export default new TravelController();
