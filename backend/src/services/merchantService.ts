// Merchant service
import pool from '../config/db';
import { Merchant, CreateMerchantInput } from '../models/Merchant';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export class MerchantService {
  /**
   * Create a new merchant
   * @param input Merchant creation input
   * @returns Created merchant
   */
  static async createMerchant(input: CreateMerchantInput): Promise<Merchant> {
    // Hash the password
    const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);
    
    const query = `
      INSERT INTO merchants (email, api_key_hash, business_name)
      VALUES ($1, $2, $3)
      RETURNING id, email, api_key_hash, created_at, business_name
    `;
    
    const values = [
      input.email,
      hashedPassword,
      input.businessName
    ];
    
    const result = await pool.query(query, values);
    const row = result.rows[0];
    
    return {
      id: row.id,
      email: row.email,
      apiKeyHash: row.api_key_hash,
      createdAt: row.created_at,
      businessName: row.business_name
    };
  }
  
  /**
   * Find a merchant by email
   * @param email Merchant email
   * @returns Merchant or null if not found
   */
  static async findByEmail(email: string): Promise<Merchant | null> {
    const query = 'SELECT * FROM merchants WHERE email = $1';
    const result = await pool.query(query, [email]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    return {
      id: row.id,
      email: row.email,
      apiKeyHash: row.api_key_hash,
      createdAt: row.created_at,
      businessName: row.business_name
    };
  }
  
  /**
   * Find a merchant by ID
   * @param id Merchant ID
   * @returns Merchant or null if not found
   */
  static async findById(id: string): Promise<Merchant | null> {
    const query = 'SELECT * FROM merchants WHERE id = $1';
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    return {
      id: row.id,
      email: row.email,
      apiKeyHash: row.api_key_hash,
      createdAt: row.created_at,
      businessName: row.business_name
    };
  }
  
  /**
   * Validate merchant credentials
   * @param email Merchant email
   * @param password Plain text password
   * @returns Boolean indicating if credentials are valid
   */
  static async validateCredentials(email: string, password: string): Promise<boolean> {
    const merchant = await this.findByEmail(email);
    
    if (!merchant) {
      return false;
    }
    
    return bcrypt.compare(password, merchant.apiKeyHash);
  }
}