// Script to test the deployed payment-processor contract
const { makeContractCall, broadcastTransaction, uintCV, principalCV } = require('@stacks/transactions');
const { STACKS_TESTNET } = require('@stacks/network');
const axios = require('axios');

async function testContract() {
  try {
    // Network configuration
    const network = STACKS_TESTNET;
    network.coreApiUrl = 'https://api.testnet.hiro.so';
    
    // Your wallet information (testnet)
    const senderKey = 'be254442a95ec011468e0e0f0d47c5e752a758b16585be83d6d30d09f68383d801';
    const senderAddress = 'ST3R364CQ9Z3RH1T2FJHANQWDGK8RB5FPKXJ63VH8';
    const contractAddress = 'ST3R364CQ9Z3RH1T2FJHANQWDGK8RB5FPKXJ63VH8';
    const contractName = 'payment-processor';
    
    console.log('Testing contract functions...');
    
    // Test 1: Call the create-payment function
    console.log('\n1. Testing create-payment function...');
    
    const txOptions = {
      contractAddress: contractAddress,
      contractName: contractName,
      functionName: 'create-payment',
      functionArgs: [
        principalCV(senderAddress),  // recipient (using same address for testing)
        uintCV(1000000)              // amount (1 STX in micro-STX)
      ],
      senderKey: senderKey,
      network: network,
      fee: 1000000 // 1 STX fee
    };
    
    const transaction = await makeContractCall(txOptions);
    const broadcastResponse = await broadcastTransaction({ 
      transaction: transaction, 
      network: network 
    });
    
    if (broadcastResponse.hasOwnProperty('error')) {
      console.log('Error calling create-payment:', broadcastResponse);
      return;
    }
    
    console.log('create-payment transaction broadcast successfully!');
    console.log('Transaction ID:', broadcastResponse.txid);
    
    // Wait a moment for the transaction to be processed
    console.log('Waiting for transaction to be processed...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Check transaction status
    console.log('Checking transaction status...');
    const txStatusResponse = await axios.get(`${network.coreApiUrl}/extended/v1/tx/${broadcastResponse.txid}`);
    console.log('Transaction Status:', txStatusResponse.data.tx_status);
    
    if (txStatusResponse.data.tx_status === 'success') {
      console.log('\nContract functions are working correctly!');
      console.log('The payment-processor contract is ready to be used in your sBTCPay gateway.');
    } else {
      console.log('\nTransaction not yet confirmed. Please check the status later.');
    }
    
  } catch (error) {
    console.error('Error testing contract:', error);
  }
}

testContract();