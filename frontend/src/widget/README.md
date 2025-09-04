# sBTCPay Widget

An embeddable payment widget for accepting sBTC payments with multiple wallet support.

![sBTCPay Widget](https://placehold.co/600x400/3498db/ffffff?text=sBTCPay+Widget&font=Poppins)

## Features

- **Multiple Wallet Support**: Integrates with popular Bitcoin and Stacks wallets:
  - Leather Wallet (Stacks Connect)
  - Xverse Wallet (Sats Connect)
  - Unisat Wallet
  - OKX Wallet
  - Hiro Wallet
  - Bitcoin Connect / WebLN compatible wallets
  - WalletConnect
  
- **Stacks Blockchain Integration**: Direct integration with Stacks smart contracts for sBTC payments
- **QR Code Generation**: Easily generate QR codes for payment flows
- **Payment Status Polling**: Track transaction confirmation on the blockchain
- **Customizable UI**: Fully customizable theme options
- **Responsive Design**: Works seamlessly on desktop and mobile

## Installation

### Using npm

```bash
npm install @sbtcpay/widget
```

### Using yarn

```bash
yarn add @sbtcpay/widget
```

### Direct script inclusion

```html
<script src="https://unpkg.com/@sbtcpay/widget/dist/widget.min.js"></script>
```

## Basic Usage

### HTML

```html
<div id="sbtcpay-widget-container"></div>

<script>
  document.addEventListener('DOMContentLoaded', function() {
    new SBTCPayWidget({
      apiKey: 'your_api_key',
      paymentIntentId: 'your_payment_intent_id',
      container: '#sbtcpay-widget-container'
    });
  });
</script>
```

### JavaScript (ES Modules)

```javascript
import SBTCPayWidget from '@sbtcpay/widget';

// Initialize the widget
const widget = new SBTCPayWidget({
  apiKey: 'your_api_key',
  paymentIntentId: 'your_payment_intent_id',
  container: '#sbtcpay-widget-container'
});
```

## Stacks Blockchain Integration

The sBTCPay widget provides seamless integration with the Stacks blockchain for sBTC payments. When users connect a Stacks-compatible wallet (like Leather Wallet), payments are submitted directly to the Stacks blockchain through smart contracts.

### How It Works

1. **Wallet Connection**: Users connect their Stacks wallet (e.g., Leather Wallet) to the widget
2. **Payment Submission**: Payment details are sent to the sBTCPay backend, which creates a transaction on the Stacks blockchain
3. **Transaction Confirmation**: The widget monitors the transaction status on the Stacks blockchain
4. **Payment Completion**: Once confirmed, the payment is marked as complete in the sBTCPay system

### Supported Stacks Wallets

- **Leather Wallet**: Full integration with Stacks Connect for seamless transaction signing
- **Xverse Wallet**: Integration through Sats Connect API
- **Hiro Wallet**: Native Stacks wallet support

### Smart Contract Functions

The widget interacts with the `payment-processor` smart contract deployed on the Stacks testnet:

- `create-payment`: Creates a new payment entry on the blockchain
- `complete-payment`: Marks a payment as completed
- `get-payment`: Retrieves payment details
- `get-payment-status`: Retrieves payment status

## Configuration Options

The widget accepts the following configuration options:

```javascript
const widget = new SBTCPayWidget({
  // API configuration (required)
  apiKey: 'your_api_key', // Your sBTCPay API key
  paymentIntentId: 'payment_intent_id', // Payment intent ID
  baseUrl: 'https://api.sbtcpay.com/api/v1', // API base URL (default: 'http://localhost:3000/api/v1')
  
  // Container configuration
  container: '#widget-container', // CSS selector for the widget container
  
  // Wallet configuration
  enabledWallets: ['leather', 'xverse', 'unisat', 'okx', 'hiro', 'bitcoin-connect', 'walletconnect'], // Enabled wallet types
  
  // Theme customization
  theme: {
    primaryColor: '#3498db', // Primary brand color
    backgroundColor: '#ffffff', // Widget background color
    textColor: '#333333', // Text color
    fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", // Font family
    borderRadius: '8px', // Border radius for the widget
    logoUrl: 'https://your-logo-url.com/logo.png' // URL to your logo
  },
  
  // Accessibility options
  lang: 'en', // Language code
  
  // Payment options
  showQRCode: true, // Whether to show QR code option
  enablePolling: true, // Whether to enable payment status polling
  pollingInterval: 5000, // Payment status polling interval in ms
  
  // Callback functions
  onSuccess: function(paymentData) {
    console.log('Payment successful!', paymentData);
    // Handle successful payment
  },
  onFailure: function(error) {
    console.error('Payment failed!', error);
    // Handle failed payment
  },
  onCancel: function() {
    console.log('Payment cancelled');
    // Handle cancelled payment
  }
});
```

## Methods

### Initialize the Widget

```javascript
await widget.init();
```

### Connect to a Wallet

```javascript
await widget.connectWallet('leather'); // Connect to Leather wallet
```

### Disconnect from Current Wallet

```javascript
widget.disconnectWallet();
```

### Show QR Code for Payment

```javascript
await widget.showQRCode();
```

### Process Payment

```javascript
await widget.handlePayment();
```

### Submit Stacks Payment

```javascript
await widget.submitStacksPayment(); // Submit payment directly to Stacks blockchain
```

### Check Payment Status

```javascript
const status = await widget.checkPaymentStatus();
console.log('Payment status:', status);
```

## Event Handling

You can also add custom event listeners to handle various widget events:

```javascript
// Listen for successful payment
widget.addEventListener('payment-success', (event) => {
  console.log('Payment successful!', event.detail);
});

// Listen for failed payment
widget.addEventListener('payment-failure', (event) => {
  console.error('Payment failed!', event.detail);
});

// Listen for wallet connection
widget.addEventListener('wallet-connected', (event) => {
  console.log('Wallet connected!', event.detail);
});

// Listen for wallet disconnection
widget.addEventListener('wallet-disconnected', () => {
  console.log('Wallet disconnected!');
});
```

## Styling

The widget comes with default styling that can be customized through the `theme` option. Additionally, you can override specific styles using CSS:

```css
/* Example: Customize widget header */
.sbtcpay-widget-header {
  border-bottom: 2px solid #3498db;
  padding-bottom: 15px;
}

/* Example: Customize wallet buttons */
.sbtcpay-wallet-button {
  background: linear-gradient(to right, #3498db, #2980b9);
  border: none;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}
```

## Testing

To run the widget tests:

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Development

To contribute to the development of the sBTCPay Widget:

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Troubleshooting

### Wallet Not Detected

If a wallet is not being detected:

1. Ensure the wallet extension is installed and enabled in your browser
2. Verify the wallet is unlocked and accessible
3. Check if the wallet is included in the `enabledWallets` option

### QR Code Not Displaying

If the QR code is not displaying:

1. Ensure the `qrcode` dependency is properly installed
2. Verify that `showQRCode` option is set to `true`
3. Check for console errors related to QR code generation

### Stacks Transaction Issues

If you're experiencing issues with Stacks transactions:

1. Verify that the Stacks network is accessible
2. Check that the merchant has properly configured their Stacks wallet
3. Ensure the payment processor smart contract is deployed and accessible

## Browser Compatibility

The sBTCPay Widget is compatible with modern browsers:

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 16+

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please contact:
- support@sbtcpay.com
- Join our [Discord](https://discord.gg/sbtcpay)