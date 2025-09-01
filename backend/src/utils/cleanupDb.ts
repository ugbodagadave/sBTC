// Database cleanup utility for tests
import pool from '../config/db';

/**
 * Clean up all data from the database tables
 */
export async function cleanupDatabase(): Promise<void> {
  try {
    // Delete all data from tables (in correct order to respect foreign keys)
    await pool.query('DELETE FROM webhooks');
    await pool.query('DELETE FROM payment_intents');
    await pool.query('DELETE FROM merchants');
    
    console.log('Database cleaned up successfully');
  } catch (error) {
    console.error('Error cleaning up database:', error);
    throw error;
  }
}

// Run the cleanup if this file is executed directly
if (require.main === module) {
  cleanupDatabase().then(() => {
    console.log('Database cleanup completed');
    process.exit(0);
  }).catch(error => {
    console.error('Error during database cleanup:', error);
    process.exit(1);
  });
}