// Database migration script to add Stacks wallet columns
import pool from '../config/db';

async function migrateDatabase() {
  try {
    console.log('Migrating database...');
    
    // Add stacks_address column to merchants table if it doesn't exist
    try {
      await pool.query(`
        ALTER TABLE merchants 
        ADD COLUMN IF NOT EXISTS stacks_address VARCHAR(255)
      `);
      console.log('Added stacks_address column to merchants table');
    } catch (error) {
      console.log('stacks_address column already exists or error:', error);
    }
    
    // Add stacks_private_key column to merchants table if it doesn't exist
    try {
      await pool.query(`
        ALTER TABLE merchants 
        ADD COLUMN IF NOT EXISTS stacks_private_key VARCHAR(255)
      `);
      console.log('Added stacks_private_key column to merchants table');
    } catch (error) {
      console.log('stacks_private_key column already exists or error:', error);
    }
    
    // Add stacks_payment_id column to payment_intents table if it doesn't exist
    try {
      await pool.query(`
        ALTER TABLE payment_intents 
        ADD COLUMN IF NOT EXISTS stacks_payment_id BIGINT
      `);
      console.log('Added stacks_payment_id column to payment_intents table');
    } catch (error) {
      console.log('stacks_payment_id column already exists or error:', error);
    }
    
    console.log('Database migration completed successfully!');
    await pool.end();
  } catch (error) {
    console.error('Error migrating database:', error);
    await pool.end();
    process.exit(1);
  }
}

// Run the migration if this file is executed directly
if (require.main === module) {
  migrateDatabase();
}