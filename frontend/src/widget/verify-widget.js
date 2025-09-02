// Simple test to verify widget functionality in browser
console.log('Testing sBTCPay Widget functionality...');

// Test that the SBTCPayWidget class is available
if (typeof window.SBTCPayWidget !== 'undefined') {
  console.log('✓ SBTCPayWidget class is available');
  
  // Try to create an instance
  try {
    const widget = new SBTCPayWidget({
      apiKey: 'test_key',
      paymentIntentId: 'test_intent'
    });
    console.log('✓ SBTCPayWidget instance can be created');
  } catch (error) {
    console.error('✗ Error creating SBTCPayWidget instance:', error.message);
  }
} else {
  console.error('✗ SBTCPayWidget class is not available');
}

// Test that the SBTCPayPaymentLinks class is available
if (typeof window.SBTCPayPaymentLinks !== 'undefined') {
  console.log('✓ SBTCPayPaymentLinks class is available');
} else {
  console.log('? SBTCPayPaymentLinks class may be in a separate file');
}

console.log('Widget verification completed.');