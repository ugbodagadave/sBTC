# sBTCPay - sBTC Payment Gateway

sBTCPay is an open-source payment gateway for processing sBTC payments on the Stacks blockchain. It provides merchants with an easy way to accept sBTC payments for goods and services.

## Project Structure

- `backend/` - Node.js/Express backend with PostgreSQL database
- `frontend/` - React.js frontend (to be developed)
- `contracts/` - Clarity smart contracts for Stacks blockchain
- `docker/` - Docker configuration for development environment
- `docs/` - Documentation for the project

## Phase 1 Implementation Status

✅ Project setup and structure created
✅ Backend API with Express and TypeScript
✅ PostgreSQL and Redis integration with Docker
✅ Database schema design and implementation
✅ Core services for merchants, payment intents, and webhooks
✅ Comprehensive test suite with Jest
✅ Basic frontend structure
✅ Smart contracts for payment processing
✅ Development environment configuration

## Phase 2 Implementation Status

✅ Comprehensive webhook system with event-driven architecture
✅ Secure webhook dispatch with HMAC-SHA256 signature verification
✅ Robust delivery system with retry logic and queue management
✅ Persistent event store with delivery tracking
✅ Testing tools for webhook verification
✅ Frontend components for webhook management
✅ Detailed documentation for webhook integration

## Phase 3 Implementation Status

🚧 Merchant Dashboard - IN PROGRESS
⏳ Analytics and Transaction Management - NOT STARTED
⏳ Settings and Configuration - NOT STARTED

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- PostgreSQL client
- Redis client

### Setup

1. Clone the repository
2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Start the database services:
   ```bash
   cd docker
   docker-compose up -d
   ```

4. Initialize the database:
   ```bash
   cd backend
   npm run init-db
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Run tests:
   ```bash
   npm test
   ```

## API Endpoints

### Merchant Management
- `POST /api/v1/merchants/register` - Register a new merchant
- `POST /api/v1/merchants/login` - Authenticate a merchant

### Payment Intents
- `POST /api/v1/payment-intents` - Create a new payment intent
- `GET /api/v1/payment-intents/:id` - Retrieve a payment intent
- `GET /api/v1/payment-intents/merchant/:merchantId` - List payment intents for a merchant

### Webhooks
- `POST /api/v1/webhooks` - Create a new webhook
- `GET /api/v1/webhooks/merchant/:merchantId` - List webhooks for a merchant
- `DELETE /api/v1/webhooks/:id` - Delete a webhook
- `GET /api/v1/webhooks/:id/deliveries` - Get webhook delivery history
- `POST /api/v1/webhooks/:id/retry` - Retry a failed webhook delivery
- `POST /api/v1/webhooks/:id/test` - Send a test event to a webhook

## Webhook System

The webhook system provides real-time notifications for payment events:

### Supported Events
- `payment.created` - When a new payment intent is created
- `payment.succeeded` - When a payment is confirmed on the blockchain
- `payment.failed` - When a payment fails or expires
- `payment.refunded` - When a payment is refunded (if supported)

### Security Features
- HMAC-SHA256 payload signing for verification
- HTTPS enforcement
- Retry logic with exponential backoff
- Comprehensive delivery tracking

For detailed documentation, see [Webhook Documentation](docs/webhooks.md)

## Development

### Backend

The backend is built with Node.js, Express, and TypeScript. It uses PostgreSQL for data storage and Redis for caching.

### Smart Contracts

The smart contracts are written in Clarity for the Stacks blockchain. They handle the core payment logic and ensure secure transactions.

## Testing

Run the test suite with:
```bash
npm test
```

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.