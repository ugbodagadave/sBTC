// Simple test to verify widget functionality
console.log('Testing sBTCPay Widget functionality...');

// Test that the SBTCPayWidget class is available
if (typeof window.SBTCPayWidget !== 'undefined') {
  console.log('✓ SBTCPayWidget class is available');
} else {
  console.error('✗ SBTCPayWidget class is not available');
}

// Test that the SBTCPayPaymentLinks class is available
if (typeof window.SBTCPayPaymentLinks !== 'undefined') {
  console.log('✓ SBTCPayPaymentLinks class is available');
} else {
  console.error('✗ SBTCPayPaymentLinks class is not available');
}

// Test QRCode library availability
if (typeof window.QRCode !== 'undefined') {
  console.log('✓ QRCode library is available');
} else {
  console.log('? QRCode library may be loaded dynamically');
}

console.log('Widget test completed.');