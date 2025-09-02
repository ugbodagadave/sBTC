// Webhook worker for processing deliveries
import { connectRedis } from '../utils/redis';
import { WebhookService } from '../services/webhookService';
import { QueueService } from '../services/queueService';

class WebhookWorker {
  private running: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;
  
  /**
   * Start the webhook worker
   */
  async start(): Promise<void> {
    if (this.running) {
      console.log('Webhook worker is already running');
      return;
    }
    
    console.log('Starting webhook worker...');
    this.running = true;
    
    // Connect to Redis
    await connectRedis();
    
    // Requeue any deliveries that were being processed
    await QueueService.requeueProcessingDeliveries();
    
    // Start processing loop
    this.intervalId = setInterval(() => this.processQueue(), 1000); // Check every second
  }
  
  /**
   * Stop the webhook worker
   */
  async stop(): Promise<void> {
    console.log('Stopping webhook worker...');
    this.running = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
  
  /**
   * Process the webhook delivery queue
   */
  private async processQueue(): Promise<void> {
    if (!this.running) {
      return;
    }
    
    try {
      // Process deliveries one by one
      const deliveryId = await QueueService.dequeueDelivery();
      
      if (deliveryId) {
        console.log(`Processing webhook delivery: ${deliveryId}`);
        
        try {
          await WebhookService.processWebhookDelivery(deliveryId);
          await QueueService.markDeliveryCompleted(deliveryId);
        } catch (error) {
          console.error(`Error processing webhook delivery ${deliveryId}:`, error);
          await QueueService.markDeliveryCompleted(deliveryId);
        }
      }
    } catch (error) {
      console.error('Error in webhook worker:', error);
    }
  }
  
  /**
   * Get worker status
   */
  async getStatus(): Promise<{ running: boolean; queueLength: number; processingCount: number }> {
    const queueLength = await QueueService.getQueueLength();
    const processingCount = await QueueService.getProcessingCount();
    
    return {
      running: this.running,
      queueLength,
      processingCount
    };
  }
}

// Create and export a singleton instance
export const webhookWorker = new WebhookWorker();

// Start the worker if this file is run directly
if (require.main === module) {
  webhookWorker.start().catch(console.error);
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('Received SIGINT, shutting down gracefully...');
    await webhookWorker.stop();
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    console.log('Received SIGTERM, shutting down gracefully...');
    await webhookWorker.stop();
    process.exit(0);
  });
}