import { Request, Response } from 'express';
import authService from '@services/authService';

class AuthController {
  /**
   * Login user
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          error: 'Email and password are required',
        });
        return;
      }

      const result = await authService.login(email, password);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        error: error.message || 'Login failed',
      });
    }
  }

  /**
   * Register new user
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name } = req.body;

      if (!email || !password || !name) {
        res.status(400).json({
          success: false,
          error: 'Email, password, and name are required',
        });
        return;
      }

      const result = await authService.register(email, password, name);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Registration failed',
      });
    }
  }

  /**
   * Logout user
   */
  async logout(_req: Request, res: Response): Promise<void> {
    // In a stateless JWT implementation, logout is handled client-side
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  }
}

export default new AuthController();
