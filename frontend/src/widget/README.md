# sBTCPay Widget

An embeddable payment widget for accepting sBTC payments with multiple wallet support.

![sBTCPay Widget](https://placehold.co/600x400/3498db/ffffff?text=sBTCPay+Widget&font=Poppins)

## Features

- **Multiple Wallet Support**: Integrates with popular Bitcoin and Stacks wallets:
  - Leather Wallet
  - Xverse Wallet
  - Unisat Wallet
  - OKX Wallet
  - Hiro Wallet
  - Bitcoin Connect / WebLN compatible wallets
  - WalletConnect
  
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