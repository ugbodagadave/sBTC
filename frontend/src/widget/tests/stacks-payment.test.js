/**
 * Stacks Payment Integration Tests
 * Tests for Stacks blockchain payment submission and monitoring
 */

// Import the widget
const SBTCPayWidget = require('../src/widget.js');

describe('SBTCPayWidget Stacks Payment Integration', () => {
  let widget;
  let container;
  
  beforeEach(() => {
    // Clear DOM
    document.body.innerHTML = '';
    
    // Create container
    container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);
    
    // Clear mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (widget) {
      widget.disconnectWallet();
    }
    document.body.innerHTML = '';
  });

  describe('Stacks Payment Submission', () => {
    beforeEach(() => {
      // Mock fetch for payment intent
      global.fetch = jest.fn((url, options) => {
        if (url.includes('/submit-stacks-payment')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              txId: '0x123456789abcdef',
              message: 'Payment submitted to Stacks blockchain'
            })
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            id: 'test-payment-intent',
            amount: 0.01,
            status: 'requires_payment',
            description: 'Test payment'
          })
        });
      });
    });

    test('should submit Stacks payment successfully', async () => {
      // Setup
      window.btc = {
        request: jest.fn().mockResolvedValue({
          addresses: ['SP1234567890ABCDEF1234567890ABCDEF12345678']
        })
      };
      
      widget = new SBTCPayWidget({
        paymentIntentId: 'test-payment-intent',
        container: '#test-container'
      });
      
      await widget.init();
      await widget.connectWallet('leather');
      
      // Submit Stacks payment
      await widget.submitStacksPayment();
      
      // Verify payment submission
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/submit-stacks-payment'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: expect.any(String)
        })
      );
      
      expect(widget.stacksTxId).toBe('0x123456789abcdef');
    });

    test('should handle Stacks payment submission failure', async () => {
      // Mock failed payment submission
      global.fetch = jest.fn((url, options) => {
        if (url.includes('/submit-stacks-payment')) {
          return Promise.resolve({
            ok: false,
            status: 500,
            json: () => Promise.resolve({
              error: 'Internal server error'
            })
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            id: 'test-payment-intent',
            amount: 0.01,
            status: 'requires_payment',
            description: 'Test payment'
          })
        });
      });
      
      // Setup
      window.btc = {
        request: jest.fn().mockResolvedValue({
          addresses: ['SP1234567890ABCDEF1234567890ABCDEF12345678']
        })
      };
      
      widget = new SBTCPayWidget({
        paymentIntentId: 'test-payment-intent',
        container: '#test-container'
      });
      
      await widget.init();
      await widget.connectWallet('leather');
      
      // Attempt to submit Stacks payment
      await expect(widget.submitStacksPayment()).rejects.toThrow();
    });
  });

  describe('Stacks Transaction Status Checking', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      
      // Mock fetch for payment intent
      global.fetch = jest.fn((url, options) => {
        if (url.includes('/stacks-status')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              confirmed: true,
              message: 'Payment confirmed on Stacks blockchain'
            })
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            id: 'test-payment-intent',
            amount: 0.01,
            status: 'processing',
            stacksTxId: '0x123456789abcdef',
            description: 'Test payment'
          })
        });
      });
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('should check Stacks transaction status', async () => {
      widget = new SBTCPayWidget({
        paymentIntentId: 'test-payment-intent',
        container: '#test-container',
        enablePolling: true
      });
      
      widget.stacksTxId = '0x123456789abcdef';
      
      await widget.init();
      
      const paymentStatus = await widget.checkPaymentStatus();
      
      // Verify Stacks status check
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/stacks-status'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: expect.any(String)
        })
      );
      
      expect(paymentStatus.confirmed).toBe(true);
    });

    test('should handle pending Stacks transaction', async () => {
      // Mock pending transaction status
      global.fetch = jest.fn((url, options) => {
        if (url.includes('/stacks-status')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              confirmed: false,
              pending: true,
              message: 'Payment still pending on Stacks blockchain'
            })
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            id: 'test-payment-intent',
            amount: 0.01,
            status: 'processing',
            stacksTxId: '0x123456789abcdef',
            description: 'Test payment'
          })
        });
      });
      
      widget = new SBTCPayWidget({
        paymentIntentId: 'test-payment-intent',
        container: '#test-container',
        enablePolling: true
      });
      
      widget.stacksTxId = '0x123456789abcdef';
      
      await widget.init();
      
      const paymentStatus = await widget.checkPaymentStatus();
      
      expect(paymentStatus.confirmed).toBe(false);
      expect(paymentStatus.pending).toBe(true);
    });
  });

  describe('UI Integration for Stacks Payments', () => {
    beforeEach(() => {
      // Mock fetch for payment intent
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            id: 'test-payment-intent',
            amount: 0.01,
            status: 'requires_payment',
            description: 'Test payment'
          })
        })
      );
    });

    test('should show Stacks transaction ID in status', async () => {
      // Setup
      window.btc = {
        request: jest.fn().mockResolvedValue({
          addresses: ['SP1234567890ABCDEF1234567890ABCDEF12345678']
        })
      };
      
      widget = new SBTCPayWidget({
        paymentIntentId: 'test-payment-intent',
        container: '#test-container'
      });
      
      await widget.init();
      await widget.connectWallet('leather');
      
      // Mock the stacksTxId
      widget.stacksTxId = '0x123456789abcdef';
      
      // Mock the updateStatus method to avoid DOM manipulation
      const mockUpdateStatus = jest.spyOn(widget, 'updateStatus');
      
      // Call handlePayment which should show transaction info for Stacks wallets
      await widget.handlePayment();
      
      // Verify that updateStatus was called with transaction info
      expect(mockUpdateStatus).toHaveBeenCalledWith(
        expect.stringContaining('Transaction ID'),
        expect.any(String)
      );
    });
  });
});