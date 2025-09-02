// Queue service for webhook deliveries
import { connectRedis, getRedisClient } from '../utils/redis';
import { WebhookDelivery } from '../models/WebhookDelivery';

export class QueueService {
  private static readonly WEBHOOK_QUEUE_KEY = 'webhook_deliveries_queue';
  private static readonly WEBHOOK_PROCESSING_KEY = 'webhook_deliveries_processing';
  
  /**
   * Add a webhook delivery to the queue
   * @param deliveryId Webhook delivery ID
   */
  static async enqueueDelivery(deliveryId: string): Promise<void> {
    const redisClient = await connectRedis();
    await redisClient.lPush(this.WEBHOOK_QUEUE_KEY, deliveryId);
  }
  
  /**
   * Get the next webhook delivery from the queue
   * @returns Webhook delivery ID or null if queue is empty
   */
  static async dequeueDelivery(): Promise<string | null> {
    const redisClient = getRedisClient();
    if (!redisClient) {
      throw new Error('Redis client not available');
    }
    
    const deliveryId = await redisClient.rPop(this.WEBHOOK_QUEUE_KEY);
    if (deliveryId) {
      // Add to processing set
      await redisClient.sAdd(this.WEBHOOK_PROCESSING_KEY, deliveryId);
    }
    
    return deliveryId;
  }
  
  /**
   * Mark a delivery as completed (remove from processing)
   * @param deliveryId Webhook delivery ID
   */
  static async markDeliveryCompleted(deliveryId: string): Promise<void> {
    const redisClient = getRedisClient();
    if (!redisClient) {
      throw new Error('Redis client not available');
    }
    
    await redisClient.sRem(this.WEBHOOK_PROCESSING_KEY, deliveryId);
  }
  
  /**
   * Get the current queue length
   * @returns Number of items in the queue
   */
  static async getQueueLength(): Promise<number> {
    const redisClient = getRedisClient();
    if (!redisClient) {
      throw new Error('Redis client not available');
    }
    
    return await redisClient.lLen(this.WEBHOOK_QUEUE_KEY);
  }
  
  /**
   * Get the number of items currently being processed
   * @returns Number of items being processed
   */
  static async getProcessingCount(): Promise<number> {
    const redisClient = getRedisClient();
    if (!redisClient) {
      throw new Error('Redis client not available');
    }
    
    return await redisClient.sCard(this.WEBHOOK_PROCESSING_KEY);
  }
  
  /**
   * Requeue deliveries that were being processed but may have failed
   */
  static async requeueProcessingDeliveries(): Promise<void> {
    const redisClient = getRedisClient();
    if (!redisClient) {
      throw new Error('Redis client not available');
    }
    
    const processingDeliveries = await redisClient.sMembers(this.WEBHOOK_PROCESSING_KEY);
    
    for (const deliveryId of processingDeliveries) {
      await redisClient.lPush(this.WEBHOOK_QUEUE_KEY, deliveryId);
      await redisClient.sRem(this.WEBHOOK_PROCESSING_KEY, deliveryId);
    }
  }
}