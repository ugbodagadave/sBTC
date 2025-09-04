// Stacks Service
// Handles all Stacks blockchain interactions for the sBTCPay gateway

import { STACKS_TESTNET, STACKS_MAINNET } from '@stacks/network';
import { 
  makeContractCall, 
  broadcastTransaction, 
  fetchCallReadOnlyFunction,
  uintCV,
  principalCV,
  cvToString,
  ClarityType,
  TxBroadcastResult
} from '@stacks/transactions';
import dotenv from 'dotenv';

dotenv.config();

// Network configuration
const STACKS_NETWORK = process.env.STACKS_NETWORK || 'testnet';
const STACKS_API_URL = process.env.STACKS_API_URL || 'https://api.testnet.hiro.so';
const CONTRACT_ADDRESS = process.env.STACKS_CONTRACT_ADDRESS || 'ST3R364CQ9Z3RH1T2FJHANQWDGK8RB5FPKXJ63VH8';
const CONTRACT_NAME = process.env.STACKS_CONTRACT_NAME || 'payment-processor';

// Initialize the Stacks network
const network = STACKS_NETWORK === 'mainnet' 
  ? { ...STACKS_MAINNET, coreApiUrl: STACKS_API_URL }
  : { ...STACKS_TESTNET, coreApiUrl: STACKS_API_URL };

export class StacksService {
  /**
   * Create a payment on the Stacks blockchain
   * @param recipient The recipient's Stacks address
   * @param amount The amount to transfer (in micro-STX)
   * @param senderKey The sender's private key
   * @returns Transaction ID
   */
  static async createPaymentOnChain(
    recipient: string,
    amount: number,
    senderKey: string
  ): Promise<string> {
    try {
      // Call the create-payment function in the payment-processor contract
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'create-payment',
        functionArgs: [
          principalCV(recipient),  // recipient principal
          uintCV(amount)           // amount in micro-STX
        ],
        senderKey: senderKey,
        validateWithAbi: true,
        network: network
      };

      const transaction = await makeContractCall(txOptions);
      const broadcastResponse: TxBroadcastResult = await broadcastTransaction({ 
        transaction: transaction, 
        network: network 
      });
      
      if ('error' in broadcastResponse) {
        throw new Error(`Transaction broadcast failed: ${broadcastResponse.error}`);
      }
      
      return broadcastResponse.txid;
    } catch (error) {
      console.error('Error creating payment on chain:', error);
      throw error;
    }
  }

  /**
   * Complete a payment on the Stacks blockchain
   * @param paymentId The payment ID
   * @param senderKey The sender's private key
   * @returns Transaction ID
   */
  static async completePaymentOnChain(
    paymentId: number,
    senderKey: string
  ): Promise<string> {
    try {
      // Call the complete-payment function in the payment-processor contract
      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'complete-payment',
        functionArgs: [
          uintCV(paymentId)  // payment ID
        ],
        senderKey: senderKey,
        validateWithAbi: true,
        network: network
      };

      const transaction = await makeContractCall(txOptions);
      const broadcastResponse: TxBroadcastResult = await broadcastTransaction({ 
        transaction: transaction, 
        network: network 
      });
      
      if ('error' in broadcastResponse) {
        throw new Error(`Transaction broadcast failed: ${broadcastResponse.error}`);
      }
      
      return broadcastResponse.txid;
    } catch (error) {
      console.error('Error completing payment on chain:', error);
      throw error;
    }
  }

  /**
   * Get payment status from the Stacks blockchain
   * @param paymentId The payment ID
   * @returns Payment status
   */
  static async getPaymentStatus(paymentId: number): Promise<string> {
    try {
      // Call the get-payment-status read-only function in the payment-processor contract
      const options = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-payment-status',
        functionArgs: [
          uintCV(paymentId)  // payment ID
        ],
        network: network,
        senderAddress: CONTRACT_ADDRESS  // Required for read-only calls
      };

      const result = await fetchCallReadOnlyFunction(options);
      
      if (result.type === ClarityType.ResponseOk) {
        // Extract the string value from the Clarity response
        // The result.value should contain the status string
        if (result.value && typeof result.value === 'object' && 'data' in result.value) {
          // If it's a buffer or string type, convert to string
          return cvToString(result.value);
        } else {
          // If it's already a primitive value
          return String(result.value);
        }
      } else if (result.type === ClarityType.ResponseErr) {
        throw new Error(`Contract error: ${cvToString(result.value)}`);
      } else {
        throw new Error(`Unexpected result type: ${result.type}`);
      }
    } catch (error) {
      console.error('Error getting payment status:', error);
      throw error;
    }
  }

  /**
   * Get payment details from the Stacks blockchain
   * @param paymentId The payment ID
   * @returns Payment details
   */
  static async getPaymentDetails(paymentId: number): Promise<any> {
    try {
      // Call the get-payment read-only function in the payment-processor contract
      const options = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-payment',
        functionArgs: [
          uintCV(paymentId)  // payment ID
        ],
        network: network,
        senderAddress: CONTRACT_ADDRESS  // Required for read-only calls
      };

      const result = await fetchCallReadOnlyFunction(options);
      
      if (result.type === ClarityType.ResponseOk) {
        // For complex Clarity values like tuples, we need to extract the data properly
        // The result will be a Clarity tuple with payment details
        return this.formatPaymentDetails(result.value);
      } else if (result.type === ClarityType.ResponseErr) {
        throw new Error(`Contract error: ${cvToString(result.value)}`);
      } else {
        throw new Error(`Unexpected result type: ${result.type}`);
      }
    } catch (error) {
      console.error('Error getting payment details:', error);
      throw error;
    }
  }
  
  // Add a helper function to format payment details
  static formatPaymentDetails(paymentData: any): any {
    // If paymentData is a Clarity tuple, extract its values
    if (paymentData && paymentData.type === ClarityType.Tuple) {
      const tupleData = paymentData.data;
      const formattedData: any = {};
      
      // Extract each field from the tuple
      for (const [key, value] of Object.entries(tupleData)) {
        if (typeof value === 'object' && value !== null && 'type' in value) {
          // Handle different Clarity types
          switch ((value as any).type) {
            case ClarityType.UInt:
              formattedData[key] = Number((value as any).value);
              break;
            case ClarityType.PrincipalStandard:
            case ClarityType.PrincipalContract:
              formattedData[key] = cvToString(value as any);
              break;
            case ClarityType.StringASCII:
              formattedData[key] = cvToString(value as any);
              break;
            case ClarityType.OptionalSome:
              // Handle optional values
              formattedData[key] = this.formatPaymentDetails((value as any).value);
              break;
            case ClarityType.OptionalNone:
              formattedData[key] = null;
              break;
            default:
              formattedData[key] = cvToString(value as any);
          }
        } else {
          formattedData[key] = value;
        }
      }
      
      return formattedData;
    }
    
    // If it's not a tuple, just return the data as is
    return paymentData;
  }
  
  /**
   * Monitor a transaction for confirmation
   * @param txId Transaction ID
   * @param maxWaitTime Maximum time to wait in milliseconds (default: 30 seconds)
   * @param pollInterval Polling interval in milliseconds (default: 5 seconds)
   * @returns Transaction status
   */
  static async monitorTransaction(
    txId: string,
    maxWaitTime: number = 30000,
    pollInterval: number = 5000
  ): Promise<any> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      try {
        // In a real implementation, we would call the Stacks API to get transaction status
        // For now, we'll simulate this with a placeholder
        console.log(`Monitoring transaction ${txId}...`);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        
        // In a real implementation, we would check the actual transaction status
        // For now, we'll just return a mock response after a few iterations
        if (Date.now() - startTime > pollInterval * 2) {
          return {
            tx_id: txId,
            status: 'success',
            confirmations: 1
          };
        }
      } catch (error) {
        console.error('Error monitoring transaction:', error);
        throw error;
      }
    }
    
    throw new Error(`Transaction ${txId} not confirmed within ${maxWaitTime}ms`);
  }
}