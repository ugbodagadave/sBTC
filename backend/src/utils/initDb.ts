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
        business_name VARCHAR(255)
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