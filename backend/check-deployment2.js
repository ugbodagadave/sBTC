// Script to check the status of the contract deployment transaction
const axios = require('axios');

async function checkDeploymentStatus() {
  try {
    const txId = 'f103cf787c5088f196f5c70259f177748432aaf1a3fa23949b83762c64648db7';
    const apiUrl = 'https://api.testnet.hiro.so';
    
    console.log(`Checking deployment transaction status: ${txId}`);
    
    // Get transaction details from Stacks API
    const response = await axios.get(`${apiUrl}/extended/v1/tx/${txId}`);
    
    console.log('Transaction Status:', response.data.tx_status);
    console.log('Transaction Details:', response.data);
    
    if (response.data.tx_status === 'success') {
      console.log('\nContract deployment confirmed!');
      console.log('Contract ID:', response.data.contract_id);
    } else {
      console.log('\nContract deployment not yet confirmed. Current status:', response.data.tx_status);
    }
    
  } catch (error) {
    console.error('Error checking deployment status:', error.response?.data || error.message);
  }
}

checkDeploymentStatus();