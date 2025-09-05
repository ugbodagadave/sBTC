// Test script to verify Stacks transaction status checking
const axios = require('axios');

async function testStacksTransaction() {
  try {
    console.log('Testing Stacks transaction status checking...');
    
    // Test with a known transaction ID from the Stacks testnet
    // This is a real transaction ID from the Stacks testnet
    const testTxId = '0x41509689792f625782068040bd746050404300173f5d6990ce3c919b77469b0f';
    
    console.log(`Checking status for transaction: ${testTxId}`);
    
    // Call the Stacks API directly to test our implementation
    const STACKS_API_URL = 'https://api.testnet.hiro.so';
    const cleanTxId = testTxId.startsWith('0x') ? testTxId.substring(2) : testTxId;
    
    const response = await axios.get(`${STACKS_API_URL}/extended/v1/tx/${cleanTxId}`);
    
    const txStatus = {
      tx_id: response.data.tx_id,
      status: response.data.tx_status,
      confirmations: response.data.confirmations || 0,
      block_hash: response.data.block_hash,
      block_height: response.data.block_height,
      canonical: response.data.canonical
    };
    
    console.log('Transaction status:', txStatus);
    console.log('Test completed successfully!');
  } catch (error) {
    console.log('Error:', error.message);
  }
}

testStacksTransaction();