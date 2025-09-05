// Script to check the balance of a Stacks testnet wallet
const axios = require('axios');

async function checkBalance() {
  try {
    // Your wallet address (testnet)
    const address = 'ST3R364CQ9Z3RH1T2FJHANQWDGK8RB5FPKXJ63VH8';
    const apiUrl = 'https://api.testnet.hiro.so';
    
    console.log(`Checking balance for address: ${address}`);
    
    // Get account info from Stacks API
    const response = await axios.get(`${apiUrl}/v2/accounts/${address}?proof=0`);
    
    console.log('Account Info:', response.data);
    console.log('STX Balance (micro-STX):', response.data.balance);
    console.log('STX Balance (STX):', response.data.balance / 1000000);
    console.log('Nonce:', response.data.nonce);
    
  } catch (error) {
    console.error('Error checking balance:', error.response?.data || error.message);
  }
}

checkBalance();