# sBTCPay Smart Contracts

This directory contains the Clarity smart contracts for the sBTCPay payment gateway.

## Overview

The sBTCPay system uses smart contracts on the Stacks blockchain to facilitate sBTC payments. These contracts handle the core payment logic and ensure secure transactions.

## Contracts

### Payment Processor

The main contract that handles payment processing, including:
- Creating payment intents
- Managing payment states
- Handling sBTC transfers
- Event logging for external systems

### Token Management

Utilities for handling sBTC token operations:
- Balance queries
- Token transfers
- Approval mechanisms

## Development

Contracts are written in Clarity and can be tested using the Clarinet framework.

## Testing

```bash
clarinet test
```

## Deployment

Contracts will be deployed to the Stacks testnet initially, with mainnet deployment following successful testing.