import { EventService } from '../src/services/eventService';
import pool from '../src/config/db';

// Generate unique identifiers for each test run
const timestamp = Date.now();

describe('Event Service', () => {
  afterAll(async () => {
    // Clean up test data
    await pool.query('DELETE FROM events WHERE data->>\'testRun\' = $1', [timestamp.toString()]);
    await pool.end();
  });
  
  it('should create an event', async () => {
    const event = await EventService.createEvent({
      type: 'test.event',
      data: { message: 'Test event data', testRun: timestamp.toString() }
    });
    
    expect(event.id).toBeDefined();
    expect(event.type).toBe('test.event');
    expect(event.data.message).toBe('Test event data');
    expect(event.data.testRun).toBe(timestamp.toString());
    expect(event.createdAt).toBeDefined();
  });
  
  it('should find an event by ID', async () => {
    // Create an event
    const createdEvent = await EventService.createEvent({
      type: 'test.find',
      data: { message: 'Find me', testRun: timestamp.toString() }
    });
    
    // Find the event
    const foundEvent = await EventService.findById(createdEvent.id);
    
    expect(foundEvent).toBeDefined();
    expect(foundEvent?.id).toBe(createdEvent.id);
    expect(foundEvent?.type).toBe('test.find');
    expect(foundEvent?.data.message).toBe('Find me');
    expect(foundEvent?.data.testRun).toBe(timestamp.toString());
  });
  
  it('should return null for non-existent event', async () => {
    const event = await EventService.findById('non-existent-id');
    expect(event).toBeNull();
  });
  
  it('should find events by type', async () => {
    // Create multiple events of the same type
    await EventService.createEvent({
      type: 'search.test',
      data: { index: 1, testRun: timestamp.toString() }
    });
    
    await EventService.createEvent({
      type: 'search.test',
      data: { index: 2, testRun: timestamp.toString() }
    });
    
    // Create an event of a different type
    await EventService.createEvent({
      type: 'other.test',
      data: { index: 3, testRun: timestamp.toString() }
    });
    
    // Find events by type
    const events = await EventService.findByType('search.test');
    
    // Filter events for this test run
    const testRunEvents = events.filter(e => e.data.testRun === timestamp.toString());
    
    expect(testRunEvents).toHaveLength(2);
    expect(testRunEvents.every(e => e.type === 'search.test')).toBe(true);
  });
});