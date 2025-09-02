# sBTCPay Widget and Payment Links

This package provides an embeddable payment widget and payment link generation system for sBTCPay - an sBTC payment gateway for the Stacks blockchain.

## Features

- **Embeddable Payment Widget**: A customizable widget that can be embedded in any website
- **Payment Link Generation**: Create payment links that can be shared with customers
- **QR Code Support**: Generate QR codes for mobile payments
- **Responsive Design**: Works on all device sizes
- **Customization Options**: Customize colors, logos, and styling to match your brand
- **Accessibility**: WCAG compliant interface

## Installation

### Using a Script Tag

Include the widget script in your HTML:

```html
<!-- For the payment widget -->
<script src="https://your-domain.com/widget.min.js" 
        data-api-key="YOUR_API_KEY" 
        data-payment-intent-id="PAYMENT_INTENT_ID"
        data-container="#widget-container">
</script>

<!-- For payment link generation -->
<script src="https://your-domain.com/payment-links.min.js"></script>
```

### Using npm

Install the package:

```bash
npm install @sbtcpay/widget
```

Import and use in your application:

```javascript
import { SBTCPayWidget, SBTCPayPaymentLinks } from '@sbtcpay/widget';

// Create a payment widget
const widget = new SBTCPayWidget({
  apiKey: 'YOUR_API_KEY',
  paymentIntentId: 'PAYMENT_INTENT_ID',
  container: '#widget-container'
});

// Generate payment links
const paymentLinks = new SBTCPayPaymentLinks({
  apiKey: 'YOUR_API_KEY'
});

const paymentLink = await paymentLinks.generatePaymentLink({
  amount: 0.01,
  description: 'Payment for services'
});
```

## Payment Widget

### Basic Usage

```html
<div id="widget-container"></div>

<script src="widget.min.js" 
        data-api-key="YOUR_API_KEY" 
        data-payment-intent-id="PAYMENT_INTENT_ID"
        data-container="#widget-container">
</script>
```

### Programmatic Usage

```javascript
import { SBTCPayWidget } from '@sbtcpay/widget';

const widget = new SBTCPayWidget({
  apiKey: 'YOUR_API_KEY',
  paymentIntentId: 'PAYMENT_INTENT_ID',
  container: '#widget-container',
  theme: {
    primaryColor: '#3498db',
    backgroundColor: '#ffffff',
    textColor: '#333333',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif',
    borderRadius: '8px',
    logoUrl: 'https://your-domain.com/logo.png'
  },
  onSuccess: (paymentData) => {
    console.log('Payment successful!', paymentData);
  }
});
```

### Widget Options

| Option | Type | Description |
|--------|------|-------------|
| `apiKey` | string | Your sBTCPay API key |
| `paymentIntentId` | string | The ID of the payment intent to process |
| `container` | string | CSS selector for the container element |
| `theme` | object | Theme customization options |
| `theme.primaryColor` | string | Primary color for buttons and highlights |
| `theme.backgroundColor` | string | Background color of the widget |
| `theme.textColor` | string | Text color |
| `theme.fontFamily` | string | Font family for the widget |
| `theme.borderRadius` | string | Border radius for elements |
| `theme.logoUrl` | string | URL to your logo image |
| `onSuccess` | function | Callback function when payment is successful |

## Payment Links

### Basic Usage

```javascript
import { SBTCPayPaymentLinks } from '@sbtcpay/widget';

const paymentLinks = new SBTCPayPaymentLinks({
  apiKey: 'YOUR_API_KEY',
  baseUrl: 'https://your-api-domain.com/api/v1'
});

// Generate a payment link
const paymentLink = await paymentLinks.generatePaymentLink({
  amount: 0.01,
  description: 'Payment for services',
  currency: 'sBTC',
  expiresAt: '2023-12-31T23:59:59Z', // Optional
  password: 'secret123', // Optional
  metadata: { // Optional
    orderId: '12345',
    customerId: '67890'
  }
});

console.log('Payment link:', paymentLink.link);
console.log('QR code data:', paymentLink.qrCodeData);

// Generate a QR code for the payment link
const qrCodeDataUrl = await paymentLinks.generateQRCode(paymentLink.link);
```

### Payment Link Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `amount` | number | Yes | Payment amount in sBTC |
| `description` | string | Yes | Payment description |
| `currency` | string | No | Currency code (default: 'sBTC') |
| `expiresAt` | string | No | Expiration date in ISO format |
| `password` | string | No | Password protection for the payment link |
| `metadata` | object | No | Custom metadata for the payment |

## Responsive Design

The widget is fully responsive and will adapt to different screen sizes. On mobile devices, it will take up most of the screen width, while on desktops it will have a maximum width of 400px.

## Customization

You can customize the appearance of the widget using the theme options:

```javascript
const widget = new SBTCPayWidget({
  // ... other options
  theme: {
    primaryColor: '#8e44ad',        // Purple primary color
    backgroundColor: '#f9f9f9',     // Light gray background
    textColor: '#2c3e50',           // Dark blue text
    fontFamily: '"Helvetica Neue", Arial, sans-serif',
    borderRadius: '12px',           // More rounded corners
    logoUrl: 'https://example.com/logo.png' // Your logo
  }
});
```

Or using data attributes in HTML:

```html
<script src="widget.min.js" 
        data-api-key="YOUR_API_KEY" 
        data-payment-intent-id="PAYMENT_INTENT_ID"
        data-container="#widget-container"
        data-primary-color="#8e44ad"
        data-background-color="#f9f9f9"
        data-text-color="#2c3e50"
        data-font-family="'Helvetica Neue', Arial, sans-serif"
        data-border-radius="12px"
        data-logo-url="https://example.com/logo.png">
</script>
```

## Accessibility

The widget follows WCAG guidelines for accessibility:
- Proper contrast ratios for text and background colors
- Keyboard navigable elements
- Focus indicators for interactive elements
- Semantic HTML structure

## Building

To build the widget and payment links system:

```bash
npm run build
```

This will generate:
- `dist/widget.min.js` - The payment widget
- `dist/payment-links.min.js` - The payment links system
- `dist/index.html` - Demo page

For development:

```bash
npm run dev
```

This will start a development server at http://localhost:9001

## Browser Support

The widget supports all modern browsers including:
- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

For older browsers, you may need to include polyfills for Promise and fetch.

## Security

- All communication with the API is done over HTTPS
- API keys should be kept secure and not exposed in client-side code
- Payment links can be password protected for sensitive payments
- QR codes contain only the payment information, not sensitive data

## License

MIT