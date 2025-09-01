// Merchant controller
import { Request, Response } from 'express';
import { MerchantService } from '../services/merchantService';
import { CreateMerchantInput } from '../models/Merchant';

export class MerchantController {
  /**
   * Register a new merchant
   * @param req Express request
   * @param res Express response
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, businessName } = req.body;
      
      // Validate input
      if (!email || !password) {
        res.status(400).json({
          error: 'Email and password are required'
        });
        return;
      }
      
      // Check if merchant already exists
      const existingMerchant = await MerchantService.findByEmail(email);
      if (existingMerchant) {
        res.status(409).json({
          error: 'Merchant with this email already exists'
        });
        return;
      }
      
      // Create merchant
      const input: CreateMerchantInput = {
        email,
        password,
        businessName
      };
      
      const merchant = await MerchantService.createMerchant(input);
      
      res.status(201).json({
        id: merchant.id,
        email: merchant.email,
        businessName: merchant.businessName,
        createdAt: merchant.createdAt
      });
    } catch (error) {
      console.error('Error registering merchant:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }
  
  /**
   * Authenticate a merchant
   * @param req Express request
   * @param res Express response
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      
      // Validate input
      if (!email || !password) {
        res.status(400).json({
          error: 'Email and password are required'
        });
        return;
      }
      
      // Validate credentials
      const isValid = await MerchantService.validateCredentials(email, password);
      if (!isValid) {
        res.status(401).json({
          error: 'Invalid credentials'
        });
        return;
      }
      
      // In a real application, you would generate and return a JWT token here
      res.status(200).json({
        message: 'Authentication successful'
      });
    } catch (error) {
      console.error('Error authenticating merchant:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }
}