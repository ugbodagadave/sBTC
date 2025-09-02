// Event service
import pool from '../config/db';
import { Event, CreateEventInput } from '../models/Event';
import { v4 as uuidv4 } from 'uuid';

export class EventService {
  /**
   * Create a new event
   * @param input Event creation input
   * @returns Created event
   */
  static async createEvent(input: CreateEventInput): Promise<Event> {
    const id = uuidv4();
    
    const query = `
      INSERT INTO events (id, type, data)
      VALUES ($1, $2, $3)
      RETURNING id, type, data, created_at
    `;
    
    const values = [
      id,
      input.type,
      input.data
    ];
    
    const result = await pool.query(query, values);
    const row = result.rows[0];
    
    return {
      id: row.id,
      type: row.type,
      data: row.data,
      createdAt: row.created_at
    };
  }
  
  /**
   * Find an event by ID
   * @param id Event ID
   * @returns Event or null if not found
   */
  static async findById(id: string): Promise<Event | null> {
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return null;
    }
    
    const query = 'SELECT * FROM events WHERE id = $1';
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    return {
      id: row.id,
      type: row.type,
      data: row.data,
      createdAt: row.created_at
    };
  }
  
  /**
   * Find events by type
   * @param type Event type
   * @param limit Number of events to return (default: 100)
   * @returns Array of events
   */
  static async findByType(type: string, limit: number = 100): Promise<Event[]> {
    const query = 'SELECT * FROM events WHERE type = $1 ORDER BY created_at DESC LIMIT $2';
    const result = await pool.query(query, [type, limit]);
    
    return result.rows.map(row => ({
      id: row.id,
      type: row.type,
      data: row.data,
      createdAt: row.created_at
    }));
  }
  
  /**
   * Find events for a specific time period
   * @param startTime Start time
   * @param endTime End time
   * @returns Array of events
   */
  static async findEventsInTimeRange(startTime: Date, endTime: Date): Promise<Event[]> {
    const query = `
      SELECT * FROM events 
      WHERE created_at >= $1 AND created_at <= $2 
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query, [startTime, endTime]);
    
    return result.rows.map(row => ({
      id: row.id,
      type: row.type,
      data: row.data,
      createdAt: row.created_at
    }));
  }
}