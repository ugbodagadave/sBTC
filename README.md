# sBTCPay - sBTC Payment Gateway

sBTCPay is an open-source payment gateway for processing sBTC payments on the Stacks blockchain. It provides merchants with an easy way to accept sBTC payments for goods and services.

## Project Structure

- `backend/` - Node.js/Express backend with PostgreSQL database
- `frontend/` - React.js frontend (to be developed)
- `contracts/` - Clarity smart contracts for Stacks blockchain
- `docker/` - Docker configuration for development environment

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

- `POST /api/v1/merchants/register` - Register a new merchant
- `POST /api/v1/merchants/login` - Authenticate a merchant
- `POST /api/v1/payment-intents` - Create a new payment intent
- `GET /api/v1/payment-intents/:id` - Retrieve a payment intent
- `GET /api/v1/payment-intents/merchant/:merchantId` - List payment intents for a merchant
- `POST /api/v1/webhooks` - Create a new webhook
- `GET /api/v1/webhooks/merchant/:merchantId` - List webhooks for a merchant
- `DELETE /api/v1/webhooks/:id` - Delete a webhook

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