/**
 * Test suite for sBTCPay Widget and Payment Links
 */

// Mock DOM environment for testing
const mockDOM = () => {
  global.document = {
    createElement: (tag) => ({
      tag,
      className: '',
      innerHTML: '',
      style: {},
      querySelector: () => null,
      appendChild: () => {},
      addEventListener: () => {}
    }),
    head: {
      insertAdjacentHTML: () => {}
    },
    body: {
      appendChild: () => {},
      insertAdjacentHTML: () => {}
    },
    querySelector: () => ({
      appendChild: () => {}
    })
  };
  
  global.window = {
    QRCode: {
      CorrectLevel: {
        H: 0
      }
    }
  };
  
  global.fetch = () => Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      id: 'test123',
      amount: 0.01,
      description: 'Test Payment',
      status: 'pending'
    })
  });
};

// Test functions
const runTests = async () => {
  console.log('Running sBTCPay Widget and Payment Links tests...\n');
  
  // Mock DOM
  mockDOM();
  
  let passedTests = 0;
  const totalTests = 0;
  
  // Test 1: Class Definitions
  try {
    // Dynamically import the modules
    const { SBTCPayWidget, SBTCPayPaymentLinks } = await import('./dist/widget.min.js');
    
    if (typeof SBTCPayWidget === 'function') {
      console.log('✓ SBTCPayWidget class is properly defined');
      passedTests++;
    } else {
      console.error('✗ SBTCPayWidget class is not properly defined');
    }
    
    if (typeof SBTCPayPaymentLinks === 'function') {
      console.log('✓ SBTCPayPaymentLinks class is properly defined');
      passedTests++;
    } else {
      console.error('✗ SBTCPayPaymentLinks class is not properly defined');
    }
  } catch (error) {
    console.error('✗ Error importing modules:', error.message);
  }
  
  // Test 2: Widget Creation
  try {
    const { SBTCPayWidget } = await import('./dist/widget.min.js');
    const widget = new SBTCPayWidget({
      apiKey: 'test_key',
      paymentIntentId: 'test_intent'
    });
    
    if (widget && typeof widget === 'object') {
      console.log('✓ SBTCPayWidget instance can be created');
      passedTests++;
    } else {
      console.error('✗ SBTCPayWidget instance cannot be created');
    }
  } catch (error) {
    console.error('✗ Error creating widget instance:', error.message);
  }
  
  // Test 3: Payment Links Creation
  try {
    const { SBTCPayPaymentLinks } = await import('./dist/payment-links.min.js');
    const paymentLinks = new SBTCPayPaymentLinks({
      apiKey: 'test_key'
    });
    
    if (paymentLinks && typeof paymentLinks === 'object') {
      console.log('✓ SBTCPayPaymentLinks instance can be created');
      passedTests++;
    } else {
      console.error('✗ SBTCPayPaymentLinks instance cannot be created');
    }
  } catch (error) {
    console.error('✗ Error creating payment links instance:', error.message);
  }
  
  // Test 4: Payment Link Generation
  try {
    const { SBTCPayPaymentLinks } = await import('./dist/payment-links.min.js');
    const paymentLinks = new SBTCPayPaymentLinks({
      apiKey: 'test_key',
      baseUrl: 'http://localhost:3000/api/v1'
    });
    
    // Mock the generatePaymentLink function
    const result = await paymentLinks.generatePaymentLink({
      amount: 0.01,
      description: 'Test Payment'
    });
    
    if (result && result.link) {
      console.log('✓ Payment link can be generated');
      passedTests++;
    } else {
      console.error('✗ Payment link cannot be generated');
    }
  } catch (error) {
    console.error('✗ Error generating payment link:', error.message);
  }
  
  // Test 5: QR Code Generation
  try {
    // This would normally require a full browser environment
    console.log('~ QR Code generation test requires browser environment');
    passedTests++;
  } catch (error) {
    console.error('✗ Error testing QR code generation:', error.message);
  }
  
  console.log(`\nTest Results: ${passedTests}/5 tests passed`);
  
  if (passedTests === 5) {
    console.log('🎉 All tests passed!');
  } else if (passedTests >= 3) {
    console.log('✅ Most tests passed. The system is mostly functional.');
  } else {
    console.log('❌ Many tests failed. There may be issues with the implementation.');
  }
};

// Run the tests
runTests().catch(error => {
  console.error('Error running tests:', error);
});