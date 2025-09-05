// Script to deploy the payment-processor contract to Stacks testnet
const { makeContractDeploy, broadcastTransaction } = require('@stacks/transactions');
const { STACKS_TESTNET } = require('@stacks/network');
const fs = require('fs');

async function deployContract() {
  try {
    // Get the contract source code
    const contractName = 'payment-processor';
    const contractSource = fs.readFileSync('../contracts/payment-processor.clar', 'utf8');
    
    console.log('Contract source code loaded successfully');
    
    // Network configuration
    const network = STACKS_TESTNET;
    network.coreApiUrl = 'https://api.testnet.hiro.so';
    
    // Your wallet information (testnet)
    const senderKey = 'be254442a95ec011468e0e0f0d47c5e752a758b16585be83d6d30d09f68383d801';
    // Using your original testnet address with ST prefix
    const senderAddress = 'ST3R364CQ9Z3RH1T2FJHANQWDGK8RB5FPKXJ63VH8';
    
    console.log(`Deploying contract as ${senderAddress} (testnet address)`);
    
    // Create the contract deploy transaction with a specific fee
    const txOptions = {
      contractName,
      codeBody: contractSource,
      senderKey,
      network,
      fee: 1000000 // Set a fixed fee of 1 STX to ensure we have enough funds
    };
    
    const transaction = await makeContractDeploy(txOptions);
    
    console.log('Broadcasting contract deployment transaction...');
    
    // Broadcast the transaction
    const result = await broadcastTransaction({
      transaction: transaction,
      network: network
    });
    
    if (result.hasOwnProperty('error')) {
      console.log('Error deploying contract:', result);
      return;
    }
    
    console.log('Contract deployment transaction broadcast successfully!');
    console.log('Transaction ID:', result.txid);
    console.log('You can view the transaction at: https://explorer.hiro.so/txid/' + result.txid + '?chain=testnet');
    
  } catch (error) {
    console.error('Error deploying contract:', error);
  }
}

deployContract();