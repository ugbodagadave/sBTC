/// <reference types="jest" />

import { StacksService } from '../src/services/stacksService';

// Mock environment variables for testing
process.env.STACKS_NETWORK = 'testnet';
process.env.STACKS_API_URL = 'https://api.testnet.hiro.so';
process.env.STACKS_CONTRACT_ADDRESS = 'ST3R364CQ9Z3RH1T2FJHANQWDGK8RB5FPKXJ63VH8';
process.env.STACKS_CONTRACT_NAME = 'payment-processor';

describe('Stacks Service', () => {
  // Note: These tests require actual network calls and valid Stacks testnet credentials
  // For now, we'll skip them in automated testing but keep them for manual verification
  
  it('should be able to initialize the Stacks service', () => {
    expect(StacksService).toBeDefined();
  });

  // These tests would require actual Stacks testnet interaction
  // For a real implementation, you would need:
  // 1. A valid Stacks testnet account with STX
  // 2. The private key for that account
  // 3. Network connectivity to the Stacks testnet

  /*
  it('should create a payment on chain', async () => {
    // This test requires a valid sender private key and recipient address
    const recipient = 'ST3R364CQ9Z3RH1T2FJHANQWDGK8RB5FPKXJ63VH8'; // Example recipient
    const amount = 1000; // 1000 micro-STX
    const senderKey = 'YOUR_SENDER_PRIVATE_KEY'; // NEVER commit real private keys!
    
    const txId = await StacksService.createPaymentOnChain(recipient, amount, senderKey);
    expect(txId).toBeDefined();
    expect(typeof txId).toBe('string');
  });

  it('should get payment status', async () => {
    const paymentId = 0; // Example payment ID
    const status = await StacksService.getPaymentStatus(paymentId);
    expect(status).toBeDefined();
  });
  */
});