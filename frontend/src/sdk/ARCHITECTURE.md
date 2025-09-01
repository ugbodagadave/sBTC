# sBTCPay JavaScript SDK Architecture

## Overview

The sBTCPay JavaScript SDK provides a convenient way for developers to integrate sBTC payment functionality into their applications. The SDK is written in TypeScript and provides type safety for all operations.

## Directory Structure

```
sdk/
├── src/                 # Source code
│   ├── index.ts         # Entry point
│   ├── client.ts        # Main SDK client
│   ├── http.ts          # HTTP client wrapper
│   └── types.ts         # TypeScript types
├── tests/               # Unit tests
│   └── client.test.ts   # Client tests
├── examples/            # Usage examples
│   ├── basic-usage.ts   # Basic usage example
│   └── complete-example.ts # Complete example
├── dist/                # Compiled output
├── package.json         # Package configuration
├── tsconfig.json        # TypeScript configuration
├── jest.config.js       # Jest configuration
├── README.md            # SDK documentation
└── ARCHITECTURE.md      # This file
```

## Core Components

### 1. Main Client (client.ts)

The main `SBTCPay` class provides methods for all API operations:
- Merchant registration and authentication
- Payment intent creation and management
- Webhook creation and management

### 2. HTTP Client (http.ts)

The `HTTPClient` class wraps Axios to provide:
- Base URL configuration
- Request/response interceptors
- Error handling
- API key management

### 3. Types (types.ts)

TypeScript interfaces for all data structures:
- Merchant types
- Payment intent types
- Webhook types
- Configuration types
- Error types

## Design Patterns

### 1. Singleton Pattern

The SDK uses a singleton-like pattern where each instance of `SBTCPay` maintains its own HTTP client with configuration.

### 2. Wrapper Pattern

The `HTTPClient` wraps Axios to provide a consistent interface and handle common concerns like error handling and authentication.

### 3. Type Safety

All API requests and responses are strongly typed using TypeScript interfaces.

## Error Handling

The SDK provides consistent error handling through:
1. Axios interceptors that transform HTTP errors into `APIError` objects
2. Detailed error messages with status codes
3. Type-safe error objects

## Testing

The SDK uses Jest for testing with:
- Mocked HTTP requests
- Comprehensive test coverage for all methods
- Both positive and negative test cases

## Build Process

The SDK uses TypeScript compiler (tsc) to:
- Compile TypeScript to JavaScript
- Generate TypeScript declaration files
- Output to the `dist/` directory

## Usage Patterns

### Initialization

```typescript
import { SBTCPay } from '@sbtcpay/sdk';

const sbtcpay = new SBTCPay({
  baseUrl: 'https://api.sbtcpay.com/api/v1',
  apiKey: 'your-api-key'
});
```

### Method Chaining

All methods return promises for async/await usage:

```typescript
const merchant = await sbtcpay.registerMerchant(input);
const paymentIntent = await sbtcpay.createPaymentIntent(input);
```

## Extensibility

The SDK is designed to be easily extensible:
1. New API methods can be added to the `SBTCPay` class
2. Additional configuration options can be added to `SBTCPayConfig`
3. New data types can be added to the types file
4. HTTP client can be extended with additional interceptors

## Security Considerations

1. API keys are sent via Authorization headers
2. All communication should use HTTPS in production
3. Webhook secrets are provided for payload validation
4. Input validation is performed by the API server

## Performance Considerations

1. HTTP keep-alive is handled by Axios
2. Timeouts are configurable
3. Minimal dependencies (only Axios as external dependency)
4. Tree-shaking support through ES modules