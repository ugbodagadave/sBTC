# sBTCPay Implementation Plan

A comprehensive, phase-by-phase plan for building the sBTC Payment Gateway from initial setup to final demo.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Phase 1: Foundation](#phase-1-foundation)
3. [Phase 2: Integration Layer](#phase-2-integration-layer)
4. [Phase 3: Dashboard & UX](#phase-3-dashboard--ux)
5. [Phase 4: Polish & Launch](#phase-4-polish--launch)
6. [Testing Strategy](#testing-strategy)
7. [Documentation](#documentation)
8. [Final Demo Preparation](#final-demo-preparation)
9. [Appendix](#appendix)

## Project Overview

This document outlines the implementation plan for sBTCPay - a production-ready sBTC payment gateway that simplifies accepting Bitcoin payments to match the ease of traditional processors like Stripe. The project targets the Stacks Foundation's $3,000 sBTC competition.

### Technology Stack

- **Frontend**: React.js with TypeScript and [Tailwind CSS](https://tailwindcss.com/docs)
- **Backend**: Node.js/Express with TypeScript
- **Database**: PostgreSQL with [Redis](https://redis.io/docs/) for caching
- **Blockchain**: [Stacks.js](https://docs.hiro.so/stacks/stacks.js/quickstart) for interactions, Clarity smart contracts
- **Infrastructure**: [Docker](https://docs.docker.com/get-started/) for containerization, [GitHub Actions](https://docs.github.com/en/actions) for CI/CD
- **Hosting**: [Vercel](https://vercel.com/docs) for frontend, other cloud provider for backend
- **Monitoring**: [Sentry](https://docs.sentry.io/platforms/javascript/guides/node/) for error tracking

## Phase 1: Foundation

**Duration**: 2-3 weeks
**Goal**: Establish core infrastructure, smart contracts, and basic API endpoints

### Week 1: Environment Setup and Project Structure

#### Tasks:
1. Initialize project repositories
   - Create GitHub organization/repository for sBTCPay
   - Set up proper branching strategy (main, develop, feature branches)
   - Configure repository settings and permissions

2. Set up development environment
   - Install Node.js (v18+) and npm
   - Install Docker and Docker Compose
   - Install PostgreSQL and Redis locally or via Docker
   - Install Stacks CLI tools:
     ```bash
     npm install -g @stacks/cli
     ```
   - Install Clarinet for smart contract development:
     ```bash
     brew install clarinet  # macOS
     # OR follow instructions at https://docs.hiro.so/smart-contracts/clarinet
     ```

3. Create project structure
   ```
   sbtcpay/
   ├── backend/
   │   ├── src/
   │   ├── tests/
   │   ├── package.json
   │   └── tsconfig.json
   ├── frontend/
   │   ├── public/
   │   ├── src/
   │   ├── package.json
   │   └── tsconfig.json
   ├── contracts/
   │   ├── deployments/
   │   ├── tests/
   │   └── settings/
   ├── docs/
   └── docker/
   ```

#### Dependencies:
- [Stacks.js Quickstart](https://docs.hiro.so/stacks/stacks.js/quickstart)
- [Clarinet Documentation](https://docs.hiro.so/smart-contracts/clarinet)

#### Testing:
- Verify all tools are correctly installed
- Run sample commands to confirm functionality

### Week 2: Smart Contract Development

#### Tasks:
1. Set up Clarinet development environment
   - Initialize Clarinet project in `contracts/` directory:
     ```bash
     clarinet new sbtc-contracts
     cd sbtc-contracts
     ```

2. Develop core contracts:
   - Payment Processor Contract
   - Fee Management Contract
   - Dispute Resolution Contract

3. Contract Requirements:
   ```clarity
   ;; Payment Processor Contract
   (define-public (create-payment (amount uint) (merchant-id uint))
     (let ((payment-id (generate-payment-id)))
       (map-set payments payment-id {
         amount: amount,
         merchant: merchant-id,
         status: "pending",
         created-at: block-height
       })
       (ok payment-id)))
   
   (define-public (confirm-payment (payment-id uint))
     ;; Verify sBTC transfer and update status
     ;; Release funds to merchant
     ;; Emit confirmation event
     )
   ```

#### Dependencies:
- [Clarity Language Reference](https://docs.stacks.co/write-smart-contracts/language-reference)
- [Clarity Book](https://book.clarity-lang.org/)

#### Testing:
- Unit tests for each contract function using Clarinet
- Test contract deployment on Stacks testnet
- Verify contract interactions with sBTC token

### Week 3: Backend API Foundation

#### Tasks:
1. Initialize Node.js/Express backend in `backend/` directory:
   ```bash
   npm init -y
   npm install express cors dotenv
   npm install -D typescript ts-node @types/node @types/express
   ```

2. Set up database:
   - Design schema based on PRD requirements
   - Implement PostgreSQL schema:
     ```sql
     CREATE TABLE merchants (
       id UUID PRIMARY KEY,
       email VARCHAR(255) UNIQUE,
       api_key_hash VARCHAR(255),
       created_at TIMESTAMP,
       business_name VARCHAR(255)
     );
     
     CREATE TABLE payment_intents (
       id UUID PRIMARY KEY,
       merchant_id UUID REFERENCES merchants(id),
       amount DECIMAL(18,8),
       status VARCHAR(50),
       stacks_tx_id VARCHAR(255),
       created_at TIMESTAMP,
       confirmed_at TIMESTAMP
     );
     
     CREATE TABLE webhooks (
       id UUID PRIMARY KEY,
       merchant_id UUID REFERENCES merchants(id),
       url VARCHAR(500),
       events TEXT[],
       secret VARCHAR(255)
     );
     ```

3. Implement core API endpoints:
   - `POST /v1/merchants` - Merchant registration
   - `POST /v1/auth` - Authentication endpoint
   - Basic payment intent creation
   - Database connection and models

#### Dependencies:
- [Express.js Documentation](https://expressjs.com/en/guide/routing.html)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

#### Testing:
- API endpoint unit tests with Jest
- Database integration tests
- Contract deployment verification tests

## Phase 2: Integration Layer

**Duration**: 2-3 weeks
**Goal**: Implement integration options (SDK, Widget, Payment Links) and core payment processing

### Week 1: Core Payment Processing

#### Tasks:
1. Implement payment intent creation:
   - Generate unique payment IDs
   - Create deposit addresses using Stacks.js
   - Store payment intent in database

2. Integrate with Stacks blockchain:
   - Set up Stacks.js library
   - Implement functions to interact with payment processor contract
   - Add transaction monitoring capabilities
   - **COMPLETED**: Implemented StacksService with functions to create payments, complete payments, and check payment statuses
   - **COMPLETED**: Created StacksWorker for background monitoring of payment statuses
   - **COMPLETED**: Extended database schema to include Stacks wallet information for merchants
   - **COMPLETED**: Extended payment intent model to track Stacks payment IDs

3. Implement payment confirmation workflow:
   - Listen for blockchain events
   - Update payment status in database
   - Trigger webhook notifications

#### Dependencies:
- [Stacks.js Documentation](https://docs.hiro.so/stacks/stacks.js/overview)
- [Stacks Blockchain Documentation](https://docs.stacks.co/)

#### Testing:
- Unit tests for Stacks integration functions
- Integration tests with testnet
- End-to-end payment processing tests

### Week 2: SDK Development

#### Tasks:
1. Create JavaScript/TypeScript SDK:
   - Implement merchant registration
   - Add payment intent creation
   - Include webhook management
   - Add utility functions for payment status checking

2. SDK Features:
   - Promise-based API
   - TypeScript definitions
   - Comprehensive error handling
   - Request/response validation

#### Dependencies:
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Axios Documentation](https://axios-http.com/docs/intro)

#### Testing:
- Unit tests for all SDK functions
- Integration tests with backend API
- Browser compatibility tests

### Week 3: Widget Implementation

#### Tasks:
1. Implement payment widget:
   - Create embeddable JavaScript widget
   - Add support for multiple wallet providers
   - Implement QR code generation
   - Add payment status polling

2. Wallet Integration:
   - Leather Wallet (Stacks Connect)
   - Xverse Wallet (Sats Connect)
   - Unisat Wallet
   - OKX Wallet
   - Hiro Wallet
   - Bitcoin Connect (WebLN)
   - WalletConnect

3. Widget Features:
   - Responsive design
   - Customizable styling
   - Multiple language support
   - Accessibility compliance

#### Dependencies:
- [Stacks Connect Documentation](https://docs.hiro.so/stacks/stacks.js/overview)
- [Sats Connect Documentation](https://github.com/secretkeylabs/sats-connect)
- [QR Code Library](https://github.com/soldair/node-qrcode)

#### Testing:
- Cross-browser testing
- Wallet integration tests
- Mobile device testing
- Accessibility testing

## Phase 3: Dashboard & UX

**Duration**: 2 weeks
**Goal**: Create merchant dashboard and improve user experience

### Week 1: Merchant Dashboard

#### Tasks:
1. Design dashboard layout:
   - Overview section with key metrics
   - Payment history table
   - Webhook management interface
   - Settings page

2. Implement dashboard features:
   - Real-time payment status updates
   - Search and filtering capabilities
   - Export functionality for reports
   - User authentication and session management

#### Dependencies:
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Chart.js Documentation](https://www.chartjs.org/docs/latest/)

#### Testing:
- Component unit tests
- Dashboard integration tests
- Performance testing

### Week 2: User Experience Improvements

#### Tasks:
1. Enhance widget UX:
   - Add loading states
   - Improve error handling
   - Implement retry mechanisms
   - Add transaction history

2. Optimize dashboard:
   - Add keyboard navigation
   - Improve mobile responsiveness
   - Implement dark mode
   - Add tooltips and help text

#### Dependencies:
- [Accessibility Guidelines](https://www.w3.org/WAI/standards-guidelines/wcag/)
- [Performance Optimization Guide](https://web.dev/fast/)

#### Testing:
- Usability testing
- Performance benchmarking
- Accessibility audit

## Phase 4: Polish & Launch

**Duration**: 1 week
**Goal**: Finalize features, fix bugs, and prepare for launch

### Week 1: Finalization

#### Tasks:
1. Bug fixes and optimizations:
   - Address all outstanding issues
   - Optimize database queries
   - Improve error handling
   - Enhance security measures

2. Documentation:
   - Complete API documentation
   - Write user guides
   - Create developer documentation
   - Prepare marketing materials

3. Deployment preparation:
   - Set up production environment
   - Configure monitoring and logging
   - Implement backup strategies
   - Prepare rollback procedures

#### Dependencies:
- [Security Best Practices](https://owasp.org/www-project-top-ten/)
- [Documentation Tools](https://docusaurus.io/)

#### Testing:
- Security audit
- Load testing
- Documentation review
- Deployment dry-run

## Testing Strategy

### Unit Testing
- Test individual functions and methods
- Mock external dependencies
- Achieve 80%+ code coverage

### Integration Testing
- Test interactions between components
- Verify database operations
- Test API endpoints

### End-to-End Testing
- Simulate real user workflows
- Test payment processing flow
- Verify webhook delivery

### Performance Testing
- Load testing with multiple concurrent users
- Stress testing under high load
- Response time monitoring

## Documentation

### Developer Documentation
- API reference
- SDK documentation
- Integration guides
- Code examples

### User Documentation
- Getting started guide
- Merchant dashboard guide
- Widget integration guide
- Troubleshooting guide

### Technical Documentation
- Architecture overview
- Database schema
- Smart contract documentation
- **COMPLETED**: [Stacks Integration Guide](./stacks-integration.md)

## Final Demo Preparation

### Demo Requirements
- End-to-end payment processing
- Widget integration showcase
- Dashboard functionality demonstration
- Webhook notification verification

### Presentation Materials
- Project overview slides
- Technical architecture diagram
- Live demonstration setup
- Q&A preparation

## Appendix

### Glossary
- **sBTC**: Stacks Bitcoin, a Bitcoin-backed token on the Stacks blockchain
- **Stacks**: A layer-2 blockchain that enables smart contracts for Bitcoin
- **Clarity**: The smart contract language used on the Stacks blockchain
- **Payment Intent**: An object representing a customer's intention to pay
- **Webhook**: HTTP callback for real-time event notifications

### References
- [Stacks Documentation](https://docs.stacks.co/)
- [Clarity Language Reference](https://docs.stacks.co/write-smart-contracts/language-reference)
- [Stacks.js Library](https://docs.hiro.so/stacks/stacks.js/overview)
- [sBTC Documentation](https://docs.stacks.co/sbtc)