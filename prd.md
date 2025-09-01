# sBTC Payment Gateway - Product Requirements Document

## 1. Executive Summary

**Project Name:** sBTCPay

**Objective:** Build a production-ready sBTC payment gateway that simplifies accepting Bitcoin payments to match the ease of traditional processors like Stripe. The primary target is to win the $3,000 Stacks sBTC competition organized by the Stacks Foundation (https://www.stacks.co/sbtc) by delivering superior developer experience (DX) and user experience (UX).

**Vision Statement:**  
"Make sBTC payments as simple as swiping a credit card - for both developers and customers."

## 2. Market Analysis & Opportunity

### Problem Statement
- Current Bitcoin payment solutions are complex and developer-unfriendly, requiring deep blockchain knowledge.
- High transaction fees and slow confirmation times (e.g., Bitcoin's ~10-60 minute blocks) hurt UX.
- No Stripe-equivalent exists specifically for sBTC, a 1:1 Bitcoin-pegged asset on the Stacks blockchain (see sBTC overview: https://docs.stacks.co/concepts/sbtc).
- Developers need simple APIs, not direct blockchain complexity like managing private keys or monitoring mempools.

### Target Users
- **Primary:** Web developers integrating payments into dApps, e-commerce sites, or DeFi protocols.
- **Secondary:** E-commerce businesses accepting crypto without needing blockchain expertise.
- **Tertiary:** DeFi applications needing reliable payment rails for sBTC-enabled smart contracts.

### Competitive Landscape
- **Traditional:** Stripe (https://stripe.com/docs), PayPal – Excellent DX but no native crypto support.
- **Crypto:** BitPay, CoinGate – Support BTC but are complex, with high fees and no sBTC integration.
- **Opportunity:** First-mover advantage in the sBTC space, leveraging Stacks' Bitcoin L2 for faster settlements and smart contract features.

## 3. Product Strategy

### Core Value Propositions
- **Developer-First:** 7-line integration similar to Stripe's SDK.
- **Zero Friction:** Abstract blockchain complexities; no need for users to understand sBTC peg-in/peg-out (details: https://docs.stacks.co/guides-and-tutorials/sbtc).
- **Instant Settlement:** Use sBTC's fast finality on Stacks (~10-second blocks) for near-instant confirmations.
- **Cost Effective:** Fees under 2% (vs. Stripe's 2.9% + $0.30).
- **Bitcoin Native:** Retain true Bitcoin value with Stacks' smart contract benefits for escrow or automated refunds.

### Success Metrics
- Integration time: <10 minutes for basic setup.
- Payment completion rate: >95%.
- Developer satisfaction: Net Promoter Score >70.
- Transaction fees: <2%.

## 4. Core Features & Requirements

### 4.1 Payment Processing Engine
#### Essential Features
- **Payment Intent Creation:** Generate secure sessions with unique IDs and deposit addresses.
- **Real-time Transaction Monitoring:** Track sBTC transfers on Stacks testnet using event listeners.
- **Automatic Confirmation:** Detect payments via blockchain APIs without manual checks.
- **Webhook System:** Send real-time notifications for events like confirmations or failures.
- **Idempotency:** Use keys to prevent duplicates and ensure consistency.

#### Technical Requirements
- Process actual sBTC testnet transactions (testnet setup: https://docs.stacks.co/guides-and-tutorials/sbtc/sbtc-builder-quickstart).
- Support amounts from 0.001 to 100 sBTC.
- 99.9% uptime SLA.
- Sub-5 second payment detection using polling or websockets.
- Comprehensive error handling (e.g., insufficient funds, network congestion) with retry logic.

### 4.2 Integration Options

#### 4.2.1 RESTful API
- Key Endpoints:
  - `POST /v1/payment-intents`: Create intent.
  - `GET /v1/payment-intents/{id}`: Retrieve status.
  - `POST /v1/webhooks/configure`: Set up webhooks.
  - `GET /v1/transactions`: List transactions.
  - Refund endpoint: `POST /v1/refunds`.
- Authentication: API keys (similar to Stripe: https://stripe.com/docs/api/authentication).
- Use Hiro's Stacks Blockchain API for querying (docs: https://docs.hiro.so/apis/stacks-blockchain-api).

#### 4.2.2 JavaScript SDK
- Target simplicity with Stacks.js integration (docs: https://docs.hiro.so/stacks/stacks.js/quickstart).
```javascript
// Example integration using @stacks/transactions (npm install @stacks/transactions)
import { sBTCPay } from '@sbtcpay/js'; // Hypothetical SDK wrapping Stacks.js

const payment = await sBTCPay.createPayment({
  amount: 0.01,
  currency: 'sBTC',
  description: 'Digital Product Purchase'
});
```

#### 4.2.3 Embeddable Widget
- Iframe-based form with QR code for wallet scanning.
- Customizable branding, mobile-responsive.
- One-line integration:
```html
<script src="https://pay.sbtcpay.com/widget.js" data-key="pk_test_..."></script>
```
- Supports wallets like Leather (https://leather.gitbook.io/guides/) and Xverse (https://docs.xverse.app/sats-connect).

#### 4.2.4 Payment Links
- No-code URLs for sharing (e.g., https://pay.sbtcpay.com/invoice/123).
- Customizable pages with QR codes.
- Ideal for invoicing; integrates with social sharing.

### 4.3 Merchant Dashboard
#### Core Functionality
- **Real-time Analytics:** Payment volume, success rates, trends (using charts).
- **Transaction Management:** Search, filter, export (CSV/JSON).
- **API Key Management:** Generate/rotate keys.
- **Webhook Configuration:** Setup and test endpoints.
- **Account Settings:** Business info, notifications.

#### Advanced Features
- Dispute management with refunds.
- Financial reporting for taxes.
- Team management with roles.
- Sandbox for testing (testnet mode).

### 4.4 Smart Contract Infrastructure
- Written in Clarity (docs: https://docs.stacks.co/concepts/clarity/overview).
#### Core Contracts
- **Payment Processor Contract:**
```clarity
;; Core payment processing logic (from Clarity docs: https://clarity-lang.org/)
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
- **Fee Management Contract:** Dynamic fees, optimization.
- **Dispute Resolution Contract:** Timelocks, automated refunds.

#### Security Features
- Multi-signature support.
- Time-locked escrow.
- Automated audits.
- Emergency pause.

## 5. Technical Architecture

### 5.1 System Components
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │  Stacks Node    │
│   Dashboard     │◄──►│   Node.js       │◄──►│   sBTC          │
│   React.js      │    │   Express       │    │   Contracts     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Database      │
                       │   PostgreSQL    │
                       └─────────────────┘
```

### 5.2 Technology Stack
#### Frontend
- React.js with TypeScript.
- Tailwind CSS.
- Recharts for visualization.
- Stacks Connect for wallets (part of Stacks.js: https://stacks.js.org/).

#### Backend
- Node.js/Express with TypeScript.
- PostgreSQL for persistence.
- Redis for caching.
- @stacks/transactions for interactions (https://www.hiro.so/stacks-js).

#### Blockchain
- Stacks.js for tx building.
- Clarity contracts (https://clarity-lang.org/).
- Stacks testnet.
- Hiro API for data (https://www.hiro.so/stacks-api).

#### Infrastructure
- Docker for containerization.
- GitHub Actions for CI/CD.
- Vercel/Railway for hosting.
- Sentry for monitoring.

### 5.3 Database Schema
```sql
-- Core tables for MVP
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

## 6. User Experience Design

### 6.1 Customer Payment Flow
- Initiation: Click "Pay with sBTC".
- Amount Display: In sBTC + USD (via oracle).
- Wallet Connection: One-click with Leather (https://leather.io/) or Xverse (https://www.xverse.app/).
- Review: Confirm details.
- Processing: Real-time updates.
- Confirmation: Success page with tx link (e.g., to Stacks explorer).

### 6.2 Developer Integration Flow
- Sign up: 30 seconds.
- API Key: Instant.
- Quick Start: Copy-paste code.
- Test: Process test tx.
- Live: Switch modes.

### 6.3 Merchant Dashboard UX
- Overview: Key metrics.
- Payments: Searchable history.
- Settings: Easy config.
- Docs Hub: Integrated guides.

## 7. Development Phases
Phase 1: Foundation  
- Smart contract development and testing.  
- Core API endpoints.  
- Basic authentication.  
- Testnet integration.  
- Database setup.

Phase 2: Integration Layer  
- JS SDK.  
- Widget creation.  
- Payment links.  
- Webhook system.  
- Error logic.

Phase 3: Dashboard & UX  
- Frontend dashboard.  
- Analytics.  
- Checkout experience.  
- Responsiveness.  
- Security.

Phase 4: Polish & Launch  
- Documentation.  
- Examples.  
- Optimization.  
- Audit.  
- Submission prep.

## 8. API Design

### 8.1 Core Endpoints
**Create Payment Intent**  
`POST /v1/payment-intents`  
Authorization: Bearer sk_test_...  
```json
{
  "amount": "0.01",
  "currency": "sbtc",
  "description": "Digital Product",
  "success_url": "https://example.com/success",
  "cancel_url": "https://example.com/cancel"
}
```  
Response:  
```json
{
  "id": "pi_1a2b3c",
  "amount": "0.01",
  "status": "requires_payment",
  "client_secret": "pi_1a2b3c_secret_...",
  "payment_url": "https://pay.sbtcpay.com/pi_1a2b3c"
}
```

**Retrieve Payment**  
`GET /v1/payment-intents/pi_1a2b3c`  
Response:  
```json
{
  "id": "pi_1a2b3c",
  "status": "succeeded",
  "amount": "0.01",
  "stacks_tx_id": "0x1234...",
  "confirmed_at": "2025-09-01T12:00:00Z"
}
```

### 8.2 Webhook Events
- payment_intent.created
- payment_intent.succeeded
- payment_intent.failed
- payment_intent.cancelled

## 9. Smart Contract Specifications

### 9.1 Payment Processor Contract
See code extract in 4.4.

### 9.2 Fee Management
- Platform fee: 1.5%.
- Network fees: Platform-covered.
- Sharing: 70% merchant, 30% platform.

## 10. Security Requirements

### Infrastructure Security
- API key encryption.
- Rate limiting.
- HTTPS with TLS 1.3.
- PCI DSS considerations.

### Blockchain Security
- Multi-sig wallets.
- Contract audits.
- Key management.
- Replay protection.

### Data Protection
- End-to-end encryption.
- GDPR compliance.
- Webhook signatures.
- Penetration testing.

## 11. Competition Winning Differentiators

### 11.1 Superior Developer Experience
- One-line: `<script src="sbtcpay.js" data-key="pk_..."></script>`.
- Interactive docs with testnet examples.
- SDKs: JS, Python, PHP, Go.
- Playground: Test without account.

### 11.2 Advanced Features
- Partial payments.
- Multi-currency display.
- QR generation.
- Social payments.

### 11.3 Merchant Tools
- Real-time analytics.
- Exports.
- Refund automation.
- Support tools.

## 12. Technical Implementation Details

### 12.1 Critical Technical Decisions
- Database: PostgreSQL for ACID.
- Caching: Redis.
- Queue: Bull.js.
- Monitoring: Logging/alerting.

### 12.2 Stacks Integration
- @stacks/transactions for tx (https://www.hiro.so/stacks-js).
- Event listening for confirmations.
- Congestion handling.
- Support Hiro/other APIs.

### 12.3 Performance Targets
- API: <200ms.
- Detection: <10s.
- Dashboard: <2s.
- Uptime: 99.9%.

## 13. Go-to-Market Strategy

### 13.1 Competition Submission Strategy
- Demo Video: 3-min walkthrough.
- Live Demo: Deployed with tests.
- Docs Site: Interactive examples.
- Code: Clean, commented.

### 13.2 Positioning Against Judges' Criteria
- Functionality: Exceed reqs.
- Usability: Stripe simplicity.
- Excellence: Production architecture.
- Innovation: Unique features.

## 14. Risk Mitigation

### High-Risk Areas
- Integration: Testnet stability.
- Bugs: Testing/fallbacks.
- Security: Reviews.
- Performance: Load tests.

### Mitigation Strategies
- Extensive testing.
- Fallbacks.
- Audit checklist.
- Monitoring.

## 15. Success Criteria & KPIs
- Completeness: All reqs met.
- Quality: Documented code.
- UX: Intuitive.
- Innovation: Wow factor.
- Outcomes: >98% success, <10 min integration, >99.5% reliability, 100% docs.

## 16. Resource Requirements
**Development Team (Solo/Small):**  
- Full-stack: API, contracts.  
- Frontend: UX.  
- DevOps: Security.

**Technology Budget:**  
- Hosting: ~$50/month.  
- Domain/SSL: ~$20.  
- Tools: Free tier.  
- Services: Minimal.

## 17. Post-Competition Strategy
**If Win:**  
- Business continuation.  
- Mainnet prep.  
- Fundraising.  
- Expansion.

**Regardless:**  
- Open-source core.  
- Community build.  
- Ecosystem leadership.  
- Pivot opportunities.

## 18. Appendix

### 18.1 Technical Architecture Diagram
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Merchant      │    │   sBTCPay       │    │   Customer      │
│   Website       │    │   Gateway       │    │   Wallet        │
│                 │    │                 │    │                 │
│  1. Create      │───►│  2. Generate    │    │                 │
│     Order       │    │     Payment     │    │                 │
│                 │    │     Intent      │    │                 │
│                 │    │                 │    │                 │
│  6. Webhook     │◄───│  5. Confirm     │◄───│  3. Send sBTC   │
│     Notification│    │     Payment     │    │     Transaction │
│                 │    │                 │    │                 │
│  7. Update      │    │                 │    │  4. Transaction │
│     Order       │    │                 │    │     Broadcast   │
│     Status      │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Stacks        │
                       │   Blockchain    │
                       │   (sBTC)        │
                       └─────────────────┘
```

### 18.2 Competitive Analysis Matrix

| Features          | sBTCPay | BitPay | CoinGate | Stripe |
|-------------------|---------|--------|----------|--------|
| Integration Time | <10 min | 30+ min | 30+ min | <5 min |
| Fees              | 1.5%    | 2.5%   | 2.5%     | 2.9%   |
| sBTC Support      | ✓       | ✗      | ✗        | ✗      |
| Developer Docs    | ✓       | Limited| Limited  | ✓      |
| Instant Settlement| ✓       | ✗      | ✗        | ✓      |

### 18.3 Code Examples Preview
**Basic Integration**  
```javascript
// Initialize sBTCPay with Stacks.js integration
const sbtcpay = new sBTCPay('pk_test_...');

// Create payment
const payment = await sbtcpay.createPayment({
  amount: 0.01,
  description: 'Digital Download'
});

// Handle success
payment.on('success', (result) => {
  window.location.href = '/success';
});
```

**Webhook Handler**  
```javascript
app.post('/webhook', (req, res) => {
  const sig = req.headers['sbtcpay-signature'];
  const event = sbtcpay.webhooks.constructEvent(req.body, sig);
  
  if (event.type === 'payment_intent.succeeded') {
    // Payment confirmed - fulfill order
    fulfillOrder(event.data.object.id);
  }
  
  res.status(200).send('OK');
});
```

This PRD provides a comprehensive roadmap to build a competition-winning sBTC payment gateway that combines the simplicity of Stripe with the innovation of Bitcoin payments.