// Status check utility
import pool from '../config/db';
import { connectRedis, disconnectRedis } from './redis';

/**
 * Check the status of all services
 * @returns Object with status of each service
 */
export async function checkStatus(): Promise<any> {
  const status: any = {
    database: 'unknown',
    redis: 'unknown',
    timestamp: new Date().toISOString()
  };

  // Check database connection
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    status.database = 'connected';
  } catch (error) {
    status.database = `error: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }

  // Check Redis connection
  try {
    const redisClient = await connectRedis();
    await redisClient.ping();
    await disconnectRedis();
    status.redis = 'connected';
  } catch (error) {
    status.redis = `error: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }

  return status;
}

// Run the status check if this file is executed directly
if (require.main === module) {
  checkStatus().then(status => {
    console.log('Service Status Check:');
    console.log(JSON.stringify(status, null, 2));
  }).catch(error => {
    console.error('Error checking status:', error);
  });
}