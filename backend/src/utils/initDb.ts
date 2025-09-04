// Database initialization script
import pool from '../config/db';

async function initDatabase() {
  try {
    console.log('Initializing database...');
    
    // Create merchants table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS merchants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        api_key_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        business_name VARCHAR(255),
        stacks_address VARCHAR(255),
        stacks_private_key VARCHAR(255)
      )
    `);
    
    // Create payment_intents table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payment_intents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
        amount DECIMAL(18,8) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'requires_payment',
        stacks_tx_id VARCHAR(255),
        stacks_payment_id BIGINT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        confirmed_at TIMESTAMP WITH TIME ZONE
      )
    `);
    
    // Create webhooks table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS webhooks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
        url VARCHAR(500) NOT NULL,
        events TEXT[] NOT NULL,
        secret VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create events table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        type VARCHAR(255) NOT NULL,
        data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create webhook_deliveries table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS webhook_deliveries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        webhook_id UUID REFERENCES webhooks(id) ON DELETE CASCADE,
        event_id UUID REFERENCES events(id) ON DELETE CASCADE,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        attempts INT DEFAULT 0,
        last_attempt_at TIMESTAMP WITH TIME ZONE,
        next_attempt_at TIMESTAMP WITH TIME ZONE,
        response_status INT,
        response_body TEXT,
        error TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_payment_intents_merchant_id 
      ON payment_intents(merchant_id)
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_payment_intents_status 
      ON payment_intents(status)
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_webhooks_merchant_id 
      ON webhooks(merchant_id)
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_events_type 
      ON events(type)
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_webhook_id 
      ON webhook_deliveries(webhook_id)
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_status 
      ON webhook_deliveries(status)
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_next_attempt_at 
      ON webhook_deliveries(next_attempt_at)
    `);
    
    console.log('Database initialized successfully!');
    await pool.end();
  } catch (error) {
    console.error('Error initializing database:', error);
    await pool.end();
    process.exit(1);
  }
}

// Run the initialization if this file is executed directly
if (require.main === module) {
  initDatabase();
}