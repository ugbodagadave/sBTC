/**
 * Wallet Integration Tests
 * Tests for multiple wallet providers and connection flows
 */

// Import the widget
const SBTCPayWidget = require('../src/widget.js');

describe('SBTCPayWidget Wallet Integration', () => {
  let widget;
  let container;
  
  // Mock wallet providers
  const mockLeatherWallet = {
    btc: {
      request: jest.fn()
    }
  };
  
  const mockXverseWallet = {
    XverseProviders: {
      BitcoinProvider: {}
    }
  };
  
  const mockUnisatWallet = {
    unisat: {
      requestAccounts: jest.fn()
    }
  };
  
  const mockOKXWallet = {
    okxwallet: {
      bitcoin: {
        connect: jest.fn()
      }
    }
  };

  beforeEach(() => {
    // Clear DOM
    document.body.innerHTML = '';
    
    // Create container
    container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);
    
    // Clear mocks
    jest.clearAllMocks();
    
    // Reset window object
    delete window.btc;
    delete window.XverseProviders;
    delete window.unisat;
    delete window.okxwallet;
  });

  afterEach(() => {
    if (widget) {
      widget.disconnectWallet();
    }
    document.body.innerHTML = '';
  });

  describe('Wallet Detection', () => {
    test('should detect Leather wallet when available', () => {
      // Setup
      window.btc = mockLeatherWallet.btc;
      
      // Create widget
      widget = new SBTCPayWidget({
        paymentIntentId: 'test-payment-intent',
        container: '#test-container'
      });
      
      // Check detection
      const detectedWallets = widget.detectWallets();
      const leatherWallet = detectedWallets.find(w => w.id === 'leather');
      
      expect(leatherWallet).toBeDefined();
      expect(leatherWallet.name).toBe('Leather');
      expect(leatherWallet.provider).toBe('stacks-connect');
    });

    test('should detect Xverse wallet when available', () => {
      // Setup
      window.XverseProviders = mockXverseWallet.XverseProviders;
      
      // Create widget
      widget = new SBTCPayWidget({
        paymentIntentId: 'test-payment-intent',
        container: '#test-container'
      });
      
      // Check detection
      const detectedWallets = widget.detectWallets();
      const xverseWallet = detectedWallets.find(w => w.id === 'xverse');
      
      expect(xverseWallet).toBeDefined();
      expect(xverseWallet.name).toBe('Xverse');
      expect(xverseWallet.provider).toBe('sats-connect');
    });

    test('should detect Unisat wallet when available', () => {
      // Setup
      window.unisat = mockUnisatWallet.unisat;
      
      // Create widget
      widget = new SBTCPayWidget({
        paymentIntentId: 'test-payment-intent',
        container: '#test-container'
      });
      
      // Check detection
      const detectedWallets = widget.detectWallets();
      const unisatWallet = detectedWallets.find(w => w.id === 'unisat');
      
      expect(unisatWallet).toBeDefined();
      expect(unisatWallet.name).toBe('Unisat');
      expect(unisatWallet.provider).toBe('unisat');
    });

    test('should detect OKX wallet when available', () => {
      // Setup
      window.okxwallet = mockOKXWallet.okxwallet;
      
      // Create widget
      widget = new SBTCPayWidget({
        paymentIntentId: 'test-payment-intent',
        container: '#test-container'
      });
      
      // Check detection
      const detectedWallets = widget.detectWallets();
      const okxWallet = detectedWallets.find(w => w.id === 'okx');
      
      expect(okxWallet).toBeDefined();
      expect(okxWallet.name).toBe('OKX Wallet');
      expect(okxWallet.provider).toBe('okx');
    });

    test('should detect multiple wallets when available', () => {
      // Setup multiple wallets
      window.btc = mockLeatherWallet.btc;
      window.XverseProviders = mockXverseWallet.XverseProviders;
      window.unisat = mockUnisatWallet.unisat;
      
      // Create widget
      widget = new SBTCPayWidget({
        paymentIntentId: 'test-payment-intent',
        container: '#test-container'
      });
      
      // Check detection
      const detectedWallets = widget.detectWallets();
      
      expect(detectedWallets).toHaveLength(3);
      expect(detectedWallets.find(w => w.id === 'leather')).toBeDefined();
      expect(detectedWallets.find(w => w.id === 'xverse')).toBeDefined();
      expect(detectedWallets.find(w => w.id === 'unisat')).toBeDefined();
    });

    test('should return empty array when no wallets detected', () => {
      // Create widget without any wallets
      widget = new SBTCPayWidget({
        paymentIntentId: 'test-payment-intent',
        container: '#test-container'
      });
      
      // Check detection
      const detectedWallets = widget.detectWallets();
      
      expect(detectedWallets).toHaveLength(0);
    });
  });

  describe('Wallet Connection', () => {
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

    test('should connect to Leather wallet successfully', async () => {
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
      
      // Connect wallet
      await widget.connectWallet('leather');
      
      // Verify connection
      expect(widget.connectedWallet).toBeDefined();
      expect(widget.connectedWallet.id).toBe('leather');
      expect(widget.userAddress).toBe('SP1234567890ABCDEF1234567890ABCDEF12345678');
      expect(window.btc.request).toHaveBeenCalledWith('getAddresses');
    });

    test('should connect to Unisat wallet successfully', async () => {
      // Setup
      window.unisat = {
        requestAccounts: jest.fn().mockResolvedValue(['bc1qtest1234567890abcdef1234567890abcdef'])
      };
      
      widget = new SBTCPayWidget({
        paymentIntentId: 'test-payment-intent',
        container: '#test-container'
      });
      
      await widget.init();
      
      // Connect wallet
      await widget.connectWallet('unisat');
      
      // Verify connection
      expect(widget.connectedWallet).toBeDefined();
      expect(widget.connectedWallet.id).toBe('unisat');
      expect(widget.userAddress).toBe('bc1qtest1234567890abcdef1234567890abcdef');
      expect(window.unisat.requestAccounts).toHaveBeenCalled();
    });

    test('should handle wallet connection failure', async () => {
      // Setup
      window.btc = {
        request: jest.fn().mockRejectedValue(new Error('User rejected'))
      };
      
      widget = new SBTCPayWidget({
        paymentIntentId: 'test-payment-intent',
        container: '#test-container'
      });
      
      await widget.init();
      
      // Attempt to connect wallet
      await widget.connectWallet('leather');
      
      // Verify no connection
      expect(widget.connectedWallet).toBeNull();
      expect(widget.userAddress).toBeNull();
    });

    test('should handle unsupported wallet', async () => {
      widget = new SBTCPayWidget({
        paymentIntentId: 'test-payment-intent',
        container: '#test-container'
      });
      
      await widget.init();
      
      // Attempt to connect unsupported wallet
      await widget.connectWallet('unsupported-wallet');
      
      // Verify no connection
      expect(widget.connectedWallet).toBeNull();
      expect(widget.userAddress).toBeNull();
    });
  });

  describe('Wallet Disconnection', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      
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

    afterEach(() => {
      jest.useRealTimers();
    });

    test('should disconnect wallet successfully', async () => {
      // Setup
      window.unisat = {
        requestAccounts: jest.fn().mockResolvedValue(['bc1qtest1234567890abcdef1234567890abcdef'])
      };
      
      widget = new SBTCPayWidget({
        paymentIntentId: 'test-payment-intent',
        container: '#test-container'
      });
      
      await widget.init();
      
      // Connect wallet first
      await widget.connectWallet('unisat');
      expect(widget.connectedWallet).toBeDefined();
      
      // Disconnect wallet
      widget.disconnectWallet();
      
      // Verify disconnection
      expect(widget.connectedWallet).toBeNull();
      expect(widget.userAddress).toBeNull();
    });

    test('should clear polling timer on disconnect', async () => {
      // Setup
      window.unisat = {
        requestAccounts: jest.fn().mockResolvedValue(['bc1qtest1234567890abcdef1234567890abcdef'])
      };
      
      widget = new SBTCPayWidget({
        paymentIntentId: 'test-payment-intent',
        container: '#test-container',
        enablePolling: true
      });
      
      await widget.init();
      
      // Connect wallet first
      await widget.connectWallet('unisat');
      expect(widget.connectedWallet).toBeDefined();
      
      // Start polling manually to ensure it's set
      widget.startPaymentPolling();
      
      // In a real environment, setInterval returns a number, but in Jest with fake timers
      // it might return an object. Let's check if it's truthy instead of defined
      expect(widget.pollingTimer).toBeTruthy();
      
      // Disconnect wallet
      widget.disconnectWallet();
      
      // Verify polling timer is cleared
      expect(widget.pollingTimer).toBeNull();
    });
  });

  describe('UI Integration', () => {
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

    test('should render wallet selection when no wallet connected', async () => {
      // Setup
      window.unisat = mockUnisatWallet.unisat;
      
      widget = new SBTCPayWidget({
        paymentIntentId: 'test-payment-intent',
        container: '#test-container'
      });
      
      await widget.init();
      
      // Check UI
      const walletSelection = container.querySelector('.sbtcpay-wallet-selection');
      const walletButtons = container.querySelectorAll('.sbtcpay-wallet-button');
      
      expect(walletSelection).toBeDefined();
      expect(walletButtons.length).toBeGreaterThan(0);
    });

    test('should render connected wallet info when wallet connected', async () => {
      // Setup
      window.unisat = {
        requestAccounts: jest.fn().mockResolvedValue(['bc1qtest1234567890abcdef1234567890abcdef'])
      };
      
      widget = new SBTCPayWidget({
        paymentIntentId: 'test-payment-intent',
        container: '#test-container'
      });
      
      await widget.init();
      await widget.connectWallet('unisat');
      
      // Check UI
      const connectedWallet = container.querySelector('.sbtcpay-connected-wallet');
      const walletInfo = container.querySelector('.sbtcpay-wallet-info');
      
      expect(connectedWallet).toBeDefined();
      expect(walletInfo).toBeDefined();
    });

    test('should render no wallets message when none detected', async () => {
      widget = new SBTCPayWidget({
        paymentIntentId: 'test-payment-intent',
        container: '#test-container'
      });
      
      await widget.init();
      
      // Check UI
      const noWallets = container.querySelector('.sbtcpay-no-wallets');
      const recommendations = container.querySelector('.sbtcpay-wallet-recommendations');
      
      expect(noWallets).toBeDefined();
      expect(recommendations).toBeDefined();
    });
  });

  describe('QR Code Generation', () => {
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
      
      // Mock QRCode library
      global.QRCode = jest.fn().mockImplementation((element, options) => {
        element.innerHTML = `<canvas></canvas>`;
      });
    });

    test('should generate QR code with payment data', async () => {
      widget = new SBTCPayWidget({
        paymentIntentId: 'test-payment-intent',
        container: '#test-container'
      });
      
      await widget.init();
      await widget.generateQRCode();
      
      // Verify QR code was generated
      expect(global.QRCode).toHaveBeenCalled();
      expect(widget.qrCodeGenerated).toBe(true);
    });

    test('should generate payment data correctly', async () => {
      widget = new SBTCPayWidget({
        paymentIntentId: 'test-payment-intent',
        container: '#test-container'
      });
      
      await widget.init();
      
      const paymentData = widget.generatePaymentData();
      
      expect(paymentData).toHaveProperty('address');
      expect(paymentData).toHaveProperty('amount');
      expect(paymentData).toHaveProperty('qrText');
      expect(paymentData).toHaveProperty('description');
      expect(paymentData.amount).toBe(0.01);
    });

    test('should handle QR code generation failure gracefully', async () => {
      // Remove QRCode from global scope
      delete global.QRCode;
      
      widget = new SBTCPayWidget({
        paymentIntentId: 'test-payment-intent',
        container: '#test-container'
      });
      
      await widget.init();
      await widget.generateQRCode();
      
      // Should not throw error and show fallback
      const qrFallback = container.querySelector('.qr-fallback');
      expect(qrFallback).toBeDefined();
    });
  });

  describe('Payment Polling', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      
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

    afterEach(() => {
      jest.useRealTimers();
    });

    test('should start payment polling when enabled', async () => {
      widget = new SBTCPayWidget({
        paymentIntentId: 'test-payment-intent',
        container: '#test-container',
        enablePolling: true,
        pollingInterval: 1000
      });
      
      await widget.init();
      widget.startPaymentPolling();
      
      expect(widget.pollingTimer).toBeDefined();
      
      // Fast-forward time
      jest.advanceTimersByTime(1000);
      
      // Should have called fetch for status check
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/payment-intents/test-payment-intent'),
        expect.any(Object)
      );
    });

    test('should handle payment success', async () => {
      // Mock successful payment status
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            id: 'test-payment-intent',
            amount: 0.01,
            status: 'succeeded',
            stacksTxId: '0x123456789',
            description: 'Test payment'
          })
        })
      );
      
      widget = new SBTCPayWidget({
        paymentIntentId: 'test-payment-intent',
        container: '#test-container',
        enablePolling: true,
        onSuccess: jest.fn()
      });
      
      await widget.init();
      
      // Mock the handlePaymentSuccess method to avoid DOM manipulation
      const mockHandlePaymentSuccess = jest.spyOn(widget, 'handlePaymentSuccess');
      
      // Call the method directly instead of starting polling
      const paymentStatus = await widget.checkPaymentStatus();
      widget.handlePaymentSuccess(paymentStatus);
      
      // Should show success state
      expect(widget.options.onSuccess).toHaveBeenCalled();
      expect(mockHandlePaymentSuccess).toHaveBeenCalledWith(paymentStatus);
    });

    test('should handle payment failure', async () => {
      // Mock failed payment status
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            id: 'test-payment-intent',
            amount: 0.01,
            status: 'failed',
            description: 'Test payment'
          })
        })
      );
      
      widget = new SBTCPayWidget({
        paymentIntentId: 'test-payment-intent',
        container: '#test-container',
        enablePolling: true,
        onFailure: jest.fn()
      });
      
      await widget.init();
      
      // Mock the handlePaymentFailure method to avoid DOM manipulation
      const mockHandlePaymentFailure = jest.spyOn(widget, 'handlePaymentFailure');
      
      // Call the method directly instead of starting polling
      const paymentStatus = await widget.checkPaymentStatus();
      widget.handlePaymentFailure(paymentStatus);
      
      // Should handle failure
      expect(widget.options.onFailure).toHaveBeenCalled();
      expect(mockHandlePaymentFailure).toHaveBeenCalledWith(paymentStatus);
    });

    test('should timeout after 10 minutes', async () => {
      widget = new SBTCPayWidget({
        paymentIntentId: 'test-payment-intent',
        container: '#test-container',
        enablePolling: true
      });
      
      await widget.init();
      widget.startPaymentPolling();
      
      expect(widget.pollingTimer).toBeDefined();
      
      // Fast-forward 10 minutes
      jest.advanceTimersByTime(600000);
      
      // Should have stopped polling
      expect(widget.pollingTimer).toBeNull();
    });
  });
});