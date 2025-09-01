# sBTCPay JavaScript SDK

The official JavaScript SDK for the sBTCPay payment gateway, making it easy to integrate sBTC payments into your applications.

## Installation

```bash
npm install @sbtcpay/sdk
```

## Usage

### Initialize the SDK

```javascript
import { SBTCPay } from '@sbtcpay/sdk';

// Initialize with default settings
const sbtcpay = new SBTCPay();

// Or initialize with custom configuration
const sbtcpay = new SBTCPay({
  baseUrl: 'https://api.sbtcpay.com/api/v1',
  apiKey: 'your-api-key',
  timeout: 5000
});
```

### Merchant Registration

```javascript
// Register a new merchant
const merchant = await sbtcpay.registerMerchant({
  email: 'merchant@example.com',
  password: 'securepassword',
  businessName: 'My Business'
});

console.log(merchant.id); // Merchant ID
```

### Merchant Authentication

```javascript
// Login as a merchant
const authResponse = await sbtcpay.loginMerchant(
  'merchant@example.com',
  'securepassword'
);

console.log(authResponse.message); // Authentication successful
```

### Payment Intents

```javascript
// Create a payment intent
const paymentIntent = await sbtcpay.createPaymentIntent({
  merchantId: 'merchant_123',
  amount: 1000, // Amount in the smallest currency unit
  currency: 'sbtc',
  description: 'Payment for product',
  successUrl: 'https://example.com/success',
  cancelUrl: 'https://example.com/cancel'
});

console.log(paymentIntent.id); // Payment intent ID
console.log(paymentIntent.paymentUrl); // URL for customer to complete payment

// Retrieve a payment intent
const retrievedIntent = await sbtcpay.retrievePaymentIntent('pi_123');
console.log(retrievedIntent.status);

// List payment intents for a merchant
const paymentIntents = await sbtcpay.listPaymentIntents('merchant_123');
console.log(paymentIntents.length);
```

### Webhooks

```javascript
// Create a webhook
const webhook = await sbtcpay.createWebhook({
  merchantId: 'merchant_123',
  url: 'https://example.com/webhook',
  events: ['payment_intent.succeeded', 'payment_intent.failed']
});

console.log(webhook.id); // Webhook ID
console.log(webhook.secret); // Webhook secret for validation

// List webhooks for a merchant
const webhooks = await sbtcpay.listWebhooks('merchant_123');
console.log(webhooks.length);

// Delete a webhook
await sbtcpay.deleteWebhook('wh_123');
```

### Configuration

```javascript
// Set API key after initialization
sbtcpay.setApiKey('your-api-key');
```

## API

### SBTCPay Constructor

```typescript
new SBTCPay(config?: SBTCPayConfig)
```

Configuration options:
- `baseUrl`: The base URL for the sBTCPay API (default: 'http://localhost:3000/api/v1')
- `apiKey`: Your API key for authentication
- `timeout`: Request timeout in milliseconds (default: 10000)

### Merchant Methods

- `registerMerchant(input: CreateMerchantInput): Promise<Merchant>`
- `loginMerchant(email: string, password: string): Promise<{ message: string }>`

### Payment Intent Methods

- `createPaymentIntent(input: CreatePaymentIntentInput): Promise<PaymentIntent>`
- `retrievePaymentIntent(id: string): Promise<PaymentIntent>`
- `listPaymentIntents(merchantId: string): Promise<PaymentIntent[]>`

### Webhook Methods

- `createWebhook(input: CreateWebhookInput): Promise<Webhook>`
- `listWebhooks(merchantId: string): Promise<Webhook[]>`
- `deleteWebhook(id: string): Promise<void>`

### Configuration Methods

- `setApiKey(apiKey: string): void`

## Development

### Prerequisites

- Node.js v18+
- npm

### Installation

```bash
npm install
```

### Building

Build the SDK:

```bash
npm run build
```

This will output compiled JavaScript and TypeScript declaration files to the `dist` directory.

### Testing

Run the test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

### Examples

Run the basic usage example:

```bash
npx ts-node examples/basic-usage.ts
```

Run the complete example:

```bash
npx ts-node examples/complete-example.ts
```

## Architecture

For information about the SDK architecture, see the [Architecture Documentation](ARCHITECTURE.md).

## License

This project is licensed under the MIT License.