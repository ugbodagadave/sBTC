// Stacks worker for monitoring payment statuses on the blockchain
import { connectRedis } from '../utils/redis';
import { PaymentIntentService } from '../services/paymentIntentService';
import { StacksService } from '../services/stacksService';
import pool from '../config/db';

class StacksWorker {
  private running: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;
  
  /**
   * Start the Stacks worker
   */
  async start(): Promise<void> {
    if (this.running) {
      console.log('Stacks worker is already running');
      return;
    }
    
    console.log('Starting Stacks worker...');
    this.running = true;
    
    // Connect to Redis
    await connectRedis();
    
    // Start processing loop
    this.intervalId = setInterval(() => this.processPayments(), 30000); // Check every 30 seconds
  }
  
  /**
   * Stop the Stacks worker
   */
  async stop(): Promise<void> {
    console.log('Stopping Stacks worker...');
    this.running = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
  
  /**
   * Process pending payments and check their status on the Stacks blockchain
   */
  private async processPayments(): Promise<void> {
    if (!this.running) {
      return;
    }
    
    try {
      console.log('Checking payment statuses on Stacks blockchain...');
      
      // Find all payment intents that are in processing status
      const query = `
        SELECT id, stacks_tx_id 
        FROM payment_intents 
        WHERE status = 'processing' AND stacks_tx_id IS NOT NULL
      `;
      
      const result = await pool.query(query);
      
      if (result.rows.length === 0) {
        console.log('No pending payments to check');
        return;
      }
      
      console.log(`Checking ${result.rows.length} payments...`);
      
      // Process each payment
      for (const row of result.rows) {
        try {
          const paymentIntentId = row.id;
          const stacksTxId = row.stacks_tx_id;
          
          console.log(`Checking payment ${paymentIntentId} with Stacks TX ID ${stacksTxId}`);
          
          // Check transaction status on Stacks blockchain
          // In a real implementation, we would call the Stacks API to get transaction details
          // For now, we'll simulate this with a placeholder
          
          // Simulate checking the transaction status
          const isConfirmed = Math.random() > 0.5; // 50% chance of confirmation for demo
          
          if (isConfirmed) {
            console.log(`Payment ${paymentIntentId} confirmed on Stacks blockchain`);
            // Update payment status to succeeded
            await PaymentIntentService.updateStatus(paymentIntentId, 'succeeded', stacksTxId);
          } else {
            console.log(`Payment ${paymentIntentId} still pending on Stacks blockchain`);
            // Keep as processing for now
          }
        } catch (error) {
          console.error(`Error processing payment ${row.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error in Stacks worker:', error);
    }
  }
  
  /**
   * Get worker status
   */
  async getStatus(): Promise<{ running: boolean }> {
    return {
      running: this.running
    };
  }
}

// Create and export a singleton instance
export const stacksWorker = new StacksWorker();

// Start the worker if this file is run directly
if (require.main === module) {
  stacksWorker.start().catch(console.error);
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('Received SIGINT, shutting down gracefully...');
    await stacksWorker.stop();
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    console.log('Received SIGTERM, shutting down gracefully...');
    await stacksWorker.stop();
    process.exit(0);
  });
}