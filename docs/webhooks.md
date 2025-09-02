# sBTCPay Webhook System Documentation

## Overview

The sBTCPay webhook system allows merchants to receive real-time notifications about payment events. Webhooks are HTTP callbacks that are triggered by specific events in the sBTCPay system, such as payment creation, success, failure, or refund.

## Supported Events

The following events are currently supported:

- `payment.created` - Triggered when a new payment intent is created
- `payment.succeeded` - Triggered when a payment is successfully confirmed on the blockchain
- `payment.failed` - Triggered when a payment fails or expires
- `payment.refunded` - Triggered when a payment is refunded (if supported)

## Webhook Registration

To receive webhook notifications, merchants must first register a webhook endpoint with sBTCPay.

### Endpoint

```http
POST /api/v1/webhooks
```

### Request Body

```json
{
  "merchantId": "merchant-uuid",
  "url": "https://your-site.com/webhook",
  "events": ["payment.created", "payment.succeeded"]
}
```

### Response

```json
{
  "id": "webhook-uuid",
  "url": "https://your-site.com/webhook",
  "events": ["payment.created", "payment.succeeded"],
  "secret": "webhook-secret-key",
  "createdAt": "2023-01-01T00:00:00Z"
}
```

The `secret` field is used to sign webhook payloads for security verification.

## Webhook Payloads

All webhook payloads follow a consistent structure:

```json
{
  "id": "event-uuid",
  "object": "event",
  "type": "payment.succeeded",
  "created": "2023-01-01T00:00:00Z",
  "data": {
    "object": {
      // Event-specific data
    }
  }
}
```

### Example Payloads

#### Payment Created

```json
{
  "id": "evt_123",
  "object": "event",
  "type": "payment.created",
  "created": "2023-01-01T00:00:00Z",
  "data": {
    "object": {
      "id": "pi_123",
      "object": "payment_intent",
      "amount": 0.01,
      "status": "requires_payment",
      "merchantId": "merchant-uuid",
      "createdAt": "2023-01-01T00:00:00Z"
    }
  }
}
```

#### Payment Succeeded

```json
{
  "id": "evt_124",
  "object": "event",
  "type": "payment.succeeded",
  "created": "2023-01-01T00:05:00Z",
  "data": {
    "object": {
      "id": "pi_123",
      "object": "payment_intent",
      "amount": 0.01,
      "status": "succeeded",
      "merchantId": "merchant-uuid",
      "stacksTxId": "0x123456789",
      "confirmedAt": "2023-01-01T00:05:00Z",
      "createdAt": "2023-01-01T00:00:00Z"
    }
  }
}
```

#### Payment Failed

```json
{
  "id": "evt_125",
  "object": "event",
  "type": "payment.failed",
  "created": "2023-01-01T00:10:00Z",
  "data": {
    "object": {
      "id": "pi_123",
      "object": "payment_intent",
      "amount": 0.01,
      "status": "failed",
      "merchantId": "merchant-uuid",
      "createdAt": "2023-01-01T00:00:00Z",
      "reason": "Payment failed"
    }
  }
}
```

## Webhook Signature Verification

For security, sBTCPay signs all webhook payloads using HMAC-SHA256. The signature is included in the `X-SBTCPay-Signature` header.

### Verification Process

1. Extract the signature from the `X-SBTCPay-Signature` header
2. Create a HMAC-SHA256 hash of the payload using your webhook secret
3. Compare the signatures

### Example Verification (Node.js)

```javascript
const crypto = require('crypto');

function verifySignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// In your webhook handler
app.post('/webhook', (req, res) => {
  const signature = req.headers['x-sbtcpay-signature'];
  const payload = JSON.stringify(req.body);
  
  if (!verifySignature(payload, signature, WEBHOOK_SECRET)) {
    return res.status(401).send('Unauthorized');
  }
  
  // Process the webhook
  res.status(200).send('OK');
});
```

## Retry Logic

sBTCPay implements an exponential backoff retry strategy for failed webhook deliveries:

- Attempt 1: Immediate
- Attempt 2: 1 minute
- Attempt 3: 2 minutes
- Attempt 4: 4 minutes
- Attempt 5: 8 minutes
- Maximum attempts: 5

## Webhook Management API

### List Webhooks

```http
GET /api/v1/webhooks/merchant/:merchantId
```

### Delete Webhook

```http
DELETE /api/v1/webhooks/:id
```

### Get Webhook Deliveries

```http
GET /api/v1/webhooks/:id/deliveries
```

### Retry Failed Delivery

```http
POST /api/v1/webhooks/:id/retry
```

### Send Test Event

```http
POST /api/v1/webhooks/:id/test
```

## Event Store and Delivery Tracking

The sBTCPay system maintains a persistent event store and tracks all webhook deliveries:

- Events are stored in the `events` table with their type, data, and creation timestamp
- Each webhook delivery attempt is tracked in the `webhook_deliveries` table
- Delivery status, response codes, and response bodies are logged for debugging
- Failed deliveries are automatically retried according to the exponential backoff schedule

## Best Practices

1. **Always verify signatures** - Never process unverified webhook payloads
2. **Handle duplicate events** - Webhooks may be delivered multiple times
3. **Respond quickly** - Acknowledge webhooks within 10 seconds
4. **Use HTTPS** - Ensure your webhook endpoints use HTTPS
5. **Implement idempotency** - Design your webhook handlers to be idempotent
6. **Log events** - Keep records of received events for debugging
7. **Handle errors gracefully** - Return appropriate HTTP status codes

## Security Considerations

1. **Signature verification** - Always verify webhook signatures
2. **HTTPS enforcement** - Only accept webhooks over HTTPS
3. **Rate limiting** - Implement rate limiting on your webhook endpoints
4. **IP filtering** - Consider filtering requests by IP address
5. **Payload validation** - Validate all incoming webhook data
6. **Secret rotation** - Rotate webhook secrets periodically

## Troubleshooting

### Common Issues

1. **Webhook not being delivered**
   - Check that your URL is accessible from the internet
   - Verify your server is responding within 10 seconds
   - Check the webhook deliveries endpoint for error details

2. **Signature verification failing**
   - Ensure you're using the correct secret
   - Verify you're hashing the exact payload received
   - Check for any modifications to the payload during processing

3. **Timeout errors**
   - Optimize your webhook handler to respond faster
   - Consider queuing work for background processing
   - Increase timeout settings if necessary

### Debugging Tools

Use the webhook management UI in the sBTCPay dashboard to:
- View delivery history
- Send test events
- Retry failed deliveries
- Check response details

## Example Implementation

Here's a complete example of a webhook handler in Node.js:

```javascript
const express = require('express');
const crypto = require('crypto');

const app = express();
const WEBHOOK_SECRET = 'your-webhook-secret';

// Middleware to capture raw body for signature verification
app.use('/webhook', express.raw({type: 'application/json'}));

app.post('/webhook', (req, res) => {
  const signature = req.headers['x-sbtcpay-signature'];
  const payload = req.body;
  
  // Verify signature
  const expectedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');
  
  if (signature !== `sha256=${expectedSignature}`) {
    return res.status(401).send('Unauthorized');
  }
  
  // Parse the payload
  const event = JSON.parse(payload);
  
  // Handle the event
  switch (event.type) {
    case 'payment.created':
      console.log('Payment created:', event.data.object.id);
      break;
    case 'payment.succeeded':
      console.log('Payment succeeded:', event.data.object.id);
      // Fulfill the order
      break;
    case 'payment.failed':
      console.log('Payment failed:', event.data.object.id);
      // Handle the failure
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
  
  res.status(200).send('OK');
});

app.listen(3000, () => {
  console.log('Webhook handler listening on port 3000');
});
```