// Script to derive Stacks testnet address from private key
const { getAddressFromPrivateKey } = require('@stacks/transactions');

// Your private key
const privateKey = 'be254442a95ec011468e0e0f0d47c5e752a758b16585be83d6d30d09f68383d801';

try {
  // Derive testnet address from private key
  // For testnet, we need to pass the testnet address version (26 for single sig)
  const testnetAddress = getAddressFromPrivateKey(privateKey);
  console.log('Testnet Address:', testnetAddress);
  
  console.log('Your wallet address:', testnetAddress);
} catch (error) {
  console.error('Error deriving address:', error);
}