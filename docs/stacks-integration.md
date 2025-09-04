# Stacks Blockchain Integration

This document describes the Stacks blockchain integration implemented for the sBTCPay gateway, enabling merchants to accept sBTC payments through smart contracts.

## Overview

The Stacks integration allows the sBTCPay gateway to interact with the Stacks blockchain for processing sBTC payments. This includes creating payments, completing payments, and checking payment statuses using the deployed `payment-processor.clar` smart contract.

## Architecture

The integration consists of several key components:

1. **StacksService** - Core service for blockchain interactions
2. **StacksWorker** - Background worker for monitoring payment statuses
3. **Database Schema Updates** - New columns for storing Stacks wallet information
4. **Merchant Model Updates** - Extended to include Stacks wallet details
5. **Payment Intent Updates** - Extended to track Stacks payment IDs

## Smart Contract

The integration works with the `payment-processor.clar` smart contract deployed at:
`ST3R364CQ9Z3RH1T2FJHANQWDGK8RB5FPKXJ63VH8.payment-processor`

### Contract Functions

1. `create-payment` - Creates a new payment entry
2. `complete-payment` - Marks a payment as completed
3. `get-payment` - Retrieves payment details
4. `get-payment-status` - Retrieves payment status

## Implementation Details

### StacksService

The `StacksService` class in `backend/src/services/stacksService.ts` provides the following methods:

- `createPaymentOnChain(recipient, amount, senderKey)` - Creates a payment on the Stacks blockchain
- `completePaymentOnChain(paymentId, senderKey)` - Completes a payment on the Stacks blockchain
- `getPaymentStatus(paymentId)` - Retrieves the status of a payment from the blockchain
- `getPaymentDetails(paymentId)` - Retrieves detailed information about a payment
- `monitorTransaction(txId, maxWaitTime, pollInterval)` - Monitors a transaction for confirmation

### StacksWorker

The `StacksWorker` class in `backend/src/workers/stacksWorker.ts` runs as a background process that:

1. Periodically checks for payments in 'processing' status
2. Queries the Stacks blockchain for their current status
3. Updates the local database with the latest status information

### Database Schema

The database schema has been extended with new columns:

#### Merchants Table
```sql
ALTER TABLE merchants 
ADD COLUMN stacks_address VARCHAR(255),
ADD COLUMN stacks_private_key VARCHAR(255)
```

#### Payment Intents Table
```sql
ALTER TABLE payment_intents 
ADD COLUMN stacks_payment_id BIGINT
```

### Merchant Model

The `Merchant` model has been extended to include:

- `stacksAddress` - The merchant's Stacks wallet address
- `stacksPrivateKey` - The merchant's Stacks wallet private key

### Payment Intent Model

The `PaymentIntent` model has been extended to include:

- `stacksPaymentId` - The ID of the payment on the Stacks blockchain

## Environment Variables

The following environment variables are used for Stacks integration:

- `STACKS_NETWORK` - The Stacks network to use (testnet or mainnet)
- `STACKS_API_URL` - The Stacks API URL
- `STACKS_CONTRACT_ADDRESS` - The contract address (defaults to ST3R364CQ9Z3RH1T2FJHANQWDGK8RB5FPKXJ63VH8)
- `STACKS_CONTRACT_NAME` - The contract name (defaults to payment-processor)

## Usage

### Creating a Merchant with Stacks Wallet

When creating a merchant, include the Stacks wallet information:

```javascript
const merchant = await MerchantService.createMerchant({
  email: 'merchant@example.com',
  password: 'password123',
  businessName: 'Test Business',
  stacksAddress: 'ST3R364CQ9Z3RH1T2FJHANQWDGK8RB5FPKXJ63VH8',
  stacksPrivateKey: 'PRIVATE_KEY_PLACEHOLDER'
});
```

### Creating a Payment Intent

When creating a payment intent, the system automatically creates a corresponding payment on the Stacks blockchain:

```javascript
const paymentIntent = await PaymentIntentService.createPaymentIntent({
  merchantId: merchant.id,
  amount: 0.01,
  currency: 'sBTC',
  description: 'Test payment'
});
```

## Testing

The integration includes comprehensive tests:

- Unit tests for the StacksService
- Integration tests for the StacksWorker
- Database tests with Stacks wallet information

To run the tests:

```bash
cd backend
npm test
```

## Security Considerations

1. **Private Key Storage** - In a production environment, private keys should be stored securely using a key management system, not in the database
2. **Environment Isolation** - Use different contracts and wallets for testnet and mainnet
3. **Transaction Monitoring** - The worker service continuously monitors transactions for confirmation
4. **Error Handling** - Proper error handling for network issues and contract errors

## Future Improvements

1. **Enhanced Security** - Implement a more secure key management system
2. **Transaction Fee Management** - Add support for dynamic transaction fee calculation
3. **Event-Driven Updates** - Use Stacks events for real-time payment status updates
4. **Multi-Signature Support** - Add support for multi-signature wallets
5. **Batch Processing** - Optimize worker for batch processing of multiple payments