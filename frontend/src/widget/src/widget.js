/**
 * sBTCPay Payment Widget
 * 
 * An embeddable widget for accepting sBTC payments with multiple wallet support
 */

class SBTCPayWidget {
  constructor(options = {}) {
    this.options = {
      apiKey: options.apiKey || null,
      paymentIntentId: options.paymentIntentId || null,
      baseUrl: options.baseUrl || 'http://localhost:3000/api/v1',
      container: options.container || null,
      // Wallet configuration
      enabledWallets: options.enabledWallets || ['leather', 'xverse', 'unisat', 'okx'],
      // Customization options
      theme: {
        primaryColor: options.theme?.primaryColor || '#3498db',
        backgroundColor: options.theme?.backgroundColor || '#ffffff',
        textColor: options.theme?.textColor || '#333333',
        fontFamily: options.theme?.fontFamily || '-apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Oxygen, Ubuntu, sans-serif',
        borderRadius: options.theme?.borderRadius || '8px',
        logoUrl: options.theme?.logoUrl || null
      },
      // Accessibility options
      lang: options.lang || 'en',
      // Payment options
      showQRCode: options.showQRCode !== false,
      enablePolling: options.enablePolling !== false,
      pollingInterval: options.pollingInterval || 5000,
      ...options
    };
    
    this.container = null;
    this.paymentData = null;
    this.connectedWallet = null;
    this.userAddress = null;
    this.pollingTimer = null;
    this.qrCodeGenerated = false;
    
    // Wallet detection
    this.availableWallets = this.detectWallets();
    
    if (this.options.paymentIntentId) {
      // Use setTimeout to ensure the DOM is ready
      setTimeout(() => {
        this.init();
      }, 0);
    }
  }
  
  async init() {
    try {
      await this.fetchPaymentIntent();
      this.render();
    } catch (error) {
      console.error('Failed to initialize widget:', error);
      this.renderError('Failed to load payment information');
    }
  }
  
  /**
   * Detect available wallets in the browser
   */
  detectWallets() {
    const wallets = [];
    
    // Detect Leather Wallet (Stacks Connect)
    if (typeof window !== 'undefined') {
      try {
        // Check if Stacks Connect is available
        if (window.StacksProvider || window.btc) {
          wallets.push({
            id: 'leather',
            name: 'Leather',
            icon: 'https://leather.io/icons/leather-icon.svg',
            provider: 'stacks-connect',
            supported: ['stacks', 'bitcoin']
          });
        }
        
        // Detect Xverse Wallet (Sats Connect)
        if (window.XverseProviders || window.BitcoinProvider) {
          wallets.push({
            id: 'xverse',
            name: 'Xverse',
            icon: 'https://xverse.app/favicon.ico',
            provider: 'sats-connect',
            supported: ['bitcoin', 'stacks', 'ordinals']
          });
        }
        
        // Detect Unisat Wallet
        if (window.unisat) {
          wallets.push({
            id: 'unisat',
            name: 'Unisat',
            icon: 'https://unisat.io/favicon.ico',
            provider: 'unisat',
            supported: ['bitcoin', 'ordinals']
          });
        }
        
        // Detect OKX Wallet
        if (window.okxwallet) {
          wallets.push({
            id: 'okx',
            name: 'OKX Wallet',
            icon: 'https://www.okx.com/favicon.ico',
            provider: 'okx',
            supported: ['bitcoin', 'stacks']
          });
        }
        
      } catch (error) {
        console.warn('Error detecting wallets:', error);
      }
    }
    
    return wallets;
  }
  
  async fetchPaymentIntent() {
    const response = await fetch(
      `${this.options.baseUrl}/payment-intents/${this.options.paymentIntentId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          ...(this.options.apiKey && { 'Authorization': `Bearer ${this.options.apiKey}` })
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch payment intent: ${response.status}`);
    }
    
    this.paymentData = await response.json();
  }
  
  render() {
    // Create widget container
    this.container = document.createElement('div');
    this.container.className = 'sbtcpay-widget';
    this.container.innerHTML = this.getWidgetHTML();
    
    // Add event listeners
    this.attachEventListeners();
    
    // Inject styles
    this.injectStyles();
    
    // If we have a target element, insert the widget there
    if (this.options.container) {
      const target = document.querySelector(this.options.container);
      if (target) {
        target.appendChild(this.container);
      }
    } else {
      // If no container specified, append to body
      document.body.appendChild(this.container);
    }
  }
  
  renderError(message) {
    const errorHTML = `
      <div class="sbtcpay-widget-error">
        <div class="sbtcpay-widget-error-content">
          <h3>Error</h3>
          <p>${message}</p>
        </div>
      </div>
    `;
    
    if (this.options.container) {
      const target = document.querySelector(this.options.container);
      if (target) {
        target.innerHTML = errorHTML;
      }
    } else {
      document.body.insertAdjacentHTML('beforeend', errorHTML);
    }
  }
  
  getWidgetHTML() {
    if (!this.paymentData) return '';
    
    const logoHTML = this.options.theme.logoUrl 
      ? `<div class="sbtcpay-widget-logo"><img src="${this.options.theme.logoUrl}" alt="Merchant Logo" /></div>` 
      : '';
    
    const walletOptionsHTML = this.getWalletSelectionHTML();
    
    return `
      <div class="sbtcpay-widget-container">
        <div class="sbtcpay-widget-header">
          ${logoHTML}
          <h3>Complete Your Payment</h3>
        </div>
        <div class="sbtcpay-widget-body">
          <div class="sbtcpay-widget-payment-info">
            <div class="sbtcpay-widget-amount">
              <span class="label">Amount:</span>
              <span class="value">${this.paymentData.amount} sBTC</span>
            </div>
            <div class="sbtcpay-widget-description">
              <span class="label">Description:</span>
              <span class="value">${this.paymentData.description || 'Payment'}</span>
            </div>
          </div>
          
          ${this.connectedWallet ? this.getConnectedWalletHTML() : this.getWalletSelectionHTML()}
          
          <div class="sbtcpay-widget-qrcode" id="sbtcpay-qrcode-container" style="display: none;">
            <h4>Scan with your mobile wallet</h4>
            <div id="sbtcpay-qrcode"></div>
            <div class="sbtcpay-payment-address" id="sbtcpay-payment-address"></div>
          </div>
          
          <div class="sbtcpay-widget-status" id="sbtcpay-status"></div>
        </div>
        <div class="sbtcpay-widget-footer">
          <p>Powered by sBTCPay</p>
        </div>
      </div>
    `;
  }
  
  getWalletSelectionHTML() {
    if (this.availableWallets.length === 0) {
      return `
        <div class="sbtcpay-no-wallets">
          <p>No compatible wallets detected. Please install:</p>
          <div class="sbtcpay-wallet-recommendations">
            <a href="https://leather.io" target="_blank" rel="noopener">Leather Wallet</a>
            <a href="https://xverse.app" target="_blank" rel="noopener">Xverse Wallet</a>
            <a href="https://unisat.io" target="_blank" rel="noopener">Unisat Wallet</a>
          </div>
        </div>
      `;
    }
    
    const walletButtons = this.availableWallets
      .filter(wallet => this.options.enabledWallets.includes(wallet.id))
      .map(wallet => `
        <button class="sbtcpay-wallet-button" data-wallet-id="${wallet.id}">
          <img src="${wallet.icon}" alt="${wallet.name}" class="wallet-icon" onerror="this.style.display='none'" />
          <span>Connect ${wallet.name}</span>
        </button>
      `).join('');
    
    return `
      <div class="sbtcpay-wallet-selection">
        <h4>Choose your wallet:</h4>
        <div class="sbtcpay-wallet-buttons">
          ${walletButtons}
        </div>
        ${this.options.showQRCode ? '<p class="sbtcpay-or-text">or</p>' : ''}
        ${this.options.showQRCode ? '<button id="sbtcpay-show-qr-button" class="sbtcpay-secondary-button">Show QR Code</button>' : ''}
      </div>
    `;
  }
  
  getConnectedWalletHTML() {
    return `
      <div class="sbtcpay-connected-wallet">
        <div class="sbtcpay-wallet-info">
          <span class="wallet-name">Connected: ${this.connectedWallet.name}</span>
          <span class="wallet-address">${this.formatAddress(this.userAddress)}</span>
        </div>
        <div class="sbtcpay-widget-actions">
          <button id="sbtcpay-pay-button" class="sbtcpay-button">Pay with sBTC</button>
          <button id="sbtcpay-disconnect-button" class="sbtcpay-secondary-button">Disconnect</button>
        </div>
      </div>
    `;
  }
  
  formatAddress(address) {
    if (!address) return '';
    if (address.length <= 16) return address;
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  }
  
  attachEventListeners() {
    // Wallet connection buttons
    const walletButtons = this.container.querySelectorAll('.sbtcpay-wallet-button');
    walletButtons.forEach(button => {
      button.addEventListener('click', () => {
        const walletId = button.dataset.walletId;
        this.connectWallet(walletId);
      });
    });
    
    // QR code button
    const qrButton = this.container.querySelector('#sbtcpay-show-qr-button');
    if (qrButton) {
      qrButton.addEventListener('click', () => {
        this.showQRCode();
      });
    }
    
    // Pay button (shown when wallet is connected)
    const payButton = this.container.querySelector('#sbtcpay-pay-button');
    if (payButton) {
      payButton.addEventListener('click', () => {
        this.handlePayment();
      });
    }
    
    // Disconnect button
    const disconnectButton = this.container.querySelector('#sbtcpay-disconnect-button');
    if (disconnectButton) {
      disconnectButton.addEventListener('click', () => {
        this.disconnectWallet();
      });
    }
  }
  
  /**
   * Connect to a specific wallet
   */
  async connectWallet(walletId) {
    this.updateStatus('Connecting to wallet...');
    
    try {
      const wallet = this.availableWallets.find(w => w.id === walletId);
      if (!wallet) {
        throw new Error(`Wallet ${walletId} not found`);
      }
      
      let address;
      
      switch (wallet.provider) {
        case 'stacks-connect':
          address = await this.connectLeatherWallet();
          break;
        case 'sats-connect':
          address = await this.connectXverseWallet();
          break;
        case 'unisat':
          address = await this.connectUnisatWallet();
          break;
        case 'okx':
          address = await this.connectOKXWallet();
          break;
        default:
          throw new Error(`Unsupported wallet provider: ${wallet.provider}`);
      }
      
      this.connectedWallet = wallet;
      this.userAddress = address;
      
      this.updateStatus('Wallet connected successfully!');
      this.updateDisplay();
      
      // Start payment status polling if enabled
      if (this.options.enablePolling) {
        this.startPaymentPolling();
      }
      
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      this.updateStatus(`Failed to connect: ${error.message}`);
    }
  }
  
  /**
   * Connect to Leather Wallet using Stacks Connect
   */
  async connectLeatherWallet() {
    return new Promise((resolve, reject) => {
      try {
        // Check if @stacks/connect is available
        if (typeof showConnect === 'undefined') {
          // Fallback to direct wallet access
          if (window.btc && window.btc.request) {
            window.btc.request('getAddresses')
              .then(result => {
                if (result && result.addresses && result.addresses.length > 0) {
                  resolve(result.addresses[0]);
                } else {
                  reject(new Error('No addresses returned from Leather wallet'));
                }
              })
              .catch(reject);
          } else {
            reject(new Error('Leather wallet not detected'));
          }
          return;
        }
        
        const appDetails = {
          name: 'sBTCPay Widget',
          icon: this.options.theme.logoUrl || 'https://sbtcpay.com/icon.png'
        };
        
        showConnect({
          appDetails,
          onFinish: (authData) => {
            if (authData && authData.userSession) {
              const userData = authData.userSession.loadUserData();
              resolve(userData.profile.stxAddress.mainnet);
            } else {
              reject(new Error('Authentication failed'));
            }
          },
          onCancel: () => {
            reject(new Error('User cancelled wallet connection'));
          }
        });
        
      } catch (error) {
        reject(error);
      }
    });
  }
  
  /**
   * Connect to Xverse Wallet using Sats Connect
   */
  async connectXverseWallet() {
    try {
      // Check if sats-connect is available
      if (typeof request === 'undefined') {
        throw new Error('Sats Connect library not available');
      }
      
      const response = await request('wallet_connect', null);
      
      if (response.status === 'success') {
        const addresses = response.result.addresses;
        
        // Prefer payment address, fallback to first available
        const paymentAddress = addresses.find(addr => addr.purpose === 'payment');
        const address = paymentAddress || addresses[0];
        
        if (!address) {
          throw new Error('No addresses returned from Xverse wallet');
        }
        
        return address.address;
      } else {
        throw new Error(response.error?.message || 'Failed to connect to Xverse wallet');
      }
      
    } catch (error) {
      throw new Error(`Xverse connection failed: ${error.message}`);
    }
  }
  
  /**
   * Connect to Unisat Wallet
   */
  async connectUnisatWallet() {
    try {
      if (!window.unisat) {
        throw new Error('Unisat wallet not detected');
      }
      
      const accounts = await window.unisat.requestAccounts();
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts returned from Unisat wallet');
      }
      
      return accounts[0];
      
    } catch (error) {
      throw new Error(`Unisat connection failed: ${error.message}`);
    }
  }
  
  /**
   * Connect to OKX Wallet
   */
  async connectOKXWallet() {
    try {
      if (!window.okxwallet || !window.okxwallet.bitcoin) {
        throw new Error('OKX wallet not detected');
      }
      
      const result = await window.okxwallet.bitcoin.connect();
      
      if (!result || !result.address) {
        throw new Error('No address returned from OKX wallet');
      }
      
      return result.address;
      
    } catch (error) {
      throw new Error(`OKX connection failed: ${error.message}`);
    }
  }
  
  /**
   * Disconnect from current wallet
   */
  disconnectWallet() {
    this.connectedWallet = null;
    this.userAddress = null;
    
    // Stop polling if active
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
    
    this.updateStatus('Wallet disconnected');
    this.updateDisplay();
  }
  
  /**
   * Update the widget display
   */
  updateDisplay() {
    // Check if container exists
    if (!this.container) {
      console.warn('Widget container not found, cannot update display');
      return;
    }
    
    // Re-render the widget body
    const widgetBody = this.container.querySelector('.sbtcpay-widget-body');
    if (widgetBody) {
      const newHTML = this.getWidgetHTML();
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = newHTML;
      const newBody = tempDiv.querySelector('.sbtcpay-widget-body');
      
      widgetBody.innerHTML = newBody.innerHTML;
      this.attachEventListeners();
    }
  }
  
  /**
   * Handle payment processing
   */
  async handlePayment() {
    if (!this.connectedWallet || !this.userAddress) {
      this.updateStatus('Please connect a wallet first', 'error');
      return;
    }
    
    this.updateStatus('Processing payment...');
    
    try {
      // Here you would typically initiate the sBTC transfer
      // For now, we'll generate a QR code and show payment instructions
      await this.generateQRCode();
      
      // Show QR code
      const qrContainer = this.container.querySelector('#sbtcpay-qrcode-container');
      if (qrContainer) {
        qrContainer.style.display = 'block';
      }
      
      this.updateStatus('Please complete the payment in your wallet');
      
      // Start polling for payment confirmation
      if (!this.pollingTimer && this.options.enablePolling) {
        this.startPaymentPolling();
      }
    } catch (error) {
      console.error('Payment error:', error);
      this.updateStatus(`Payment failed: ${error.message}`, 'error');
    }
  }
  
  /**
   * Show QR code without wallet connection
   */
  async showQRCode() {
    try {
      await this.generateQRCode();
      
      const qrContainer = this.container.querySelector('#sbtcpay-qrcode-container');
      if (qrContainer) {
        qrContainer.style.display = 'block';
      }
      
      this.updateStatus('Scan QR code with your mobile wallet');
      
      // Start polling for payment confirmation
      if (!this.pollingTimer && this.options.enablePolling) {
        this.startPaymentPolling();
      }
    } catch (error) {
      console.error('QR code error:', error);
      this.updateStatus(`Failed to generate QR code: ${error.message}`, 'error');
    }
  }
  
  async generateQRCode() {
    // Clear previous QR code
    const qrContainer = this.container.querySelector('#sbtcpay-qrcode-container');
    if (qrContainer) {
      const qrElement = qrContainer.querySelector('#sbtcpay-qrcode');
      if (qrElement) {
        qrElement.innerHTML = '';
      }
    }
    
    try {
      // Generate payment data for QR code
      const paymentData = this.generatePaymentData();
      
      // Display payment address
      const addressElement = this.container.querySelector('#sbtcpay-payment-address');
      if (addressElement && paymentData.address) {
        addressElement.innerHTML = `
          <div class="payment-address-info">
            <label>Payment Address:</label>
            <div class="address-text" onclick="navigator.clipboard.writeText('${paymentData.address}')" title="Click to copy">
              ${paymentData.address}
            </div>
            <small>Click to copy address</small>
          </div>
        `;
      }
      
      // Generate QR code using the qrcode library if available
      if (typeof QRCode !== 'undefined') {
        const qrElement = this.container.querySelector('#sbtcpay-qrcode');
        if (qrElement) {
          new QRCode(qrElement, {
            text: paymentData.qrText,
            width: 200,
            height: 200,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel ? QRCode.CorrectLevel.H : 0
          });
        }
      } else {
        // Fallback to simple QR code display
        const qrElement = this.container.querySelector('#sbtcpay-qrcode');
        if (qrElement) {
          qrElement.innerHTML = `
            <div class="qr-fallback">
              <p>QR Code Library not loaded</p>
              <p>Amount: ${this.paymentData.amount} sBTC</p>
              ${paymentData.address ? `<p>To: ${paymentData.address}</p>` : ''}
            </div>
          `;
        }
      }
      
      this.qrCodeGenerated = true;
      
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      throw error;
    }
  }
  
  /**
   * Generate payment data for QR code
   */
  generatePaymentData() {
    // For sBTC payments, we would typically generate:
    // 1. A specific sBTC address for this payment
    // 2. Payment amount
    // 3. Payment memo/description
    
    // For demo purposes, using a placeholder address
    const paymentAddress = 'SP1234567890ABCDEF1234567890ABCDEF12345678';
    
    // Create payment URI (similar to bitcoin: URI scheme)
    const paymentURI = `stacks:${paymentAddress}?amount=${this.paymentData.amount}&memo=${encodeURIComponent(this.paymentData.description || 'sBTCPay Payment')}`;
    
    return {
      address: paymentAddress,
      amount: this.paymentData.amount,
      qrText: paymentURI,
      description: this.paymentData.description
    };
  }
  
  /**
   * Start polling for payment confirmation
   */
  startPaymentPolling() {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
    }
    
    this.updateStatus('Waiting for payment confirmation...');
    
    this.pollingTimer = setInterval(async () => {
      try {
        const paymentStatus = await this.checkPaymentStatus();
        
        if (paymentStatus.confirmed) {
          this.handlePaymentSuccess(paymentStatus);
        } else if (paymentStatus.failed) {
          this.handlePaymentFailure(paymentStatus);
        }
        // If still pending, continue polling
        
      } catch (error) {
        console.error('Error checking payment status:', error);
        // Continue polling despite errors
      }
    }, this.options.pollingInterval);
    
    // Stop polling after 10 minutes
    setTimeout(() => {
      if (this.pollingTimer) {
        clearInterval(this.pollingTimer);
        this.pollingTimer = null;
        this.updateStatus('Payment timeout. Please try again.', 'warning');
      }
    }, 600000); // 10 minutes
  }
  
  /**
   * Check payment status with backend
   */
  async checkPaymentStatus() {
    const response = await fetch(
      `${this.options.baseUrl}/payment-intents/${this.options.paymentIntentId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          ...(this.options.apiKey && { 'Authorization': `Bearer ${this.options.apiKey}` })
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to check payment status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      confirmed: data.status === 'succeeded',
      failed: data.status === 'failed' || data.status === 'cancelled',
      pending: data.status === 'requires_payment' || data.status === 'processing',
      data: data
    };
  }
  
  /**
   * Handle successful payment
   */
  handlePaymentSuccess(paymentStatus) {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
    
    this.updateStatus('Payment confirmed! Thank you.', 'success');
    
    // Hide QR code and show success message
    const qrContainer = this.container.querySelector('#sbtcpay-qrcode-container');
    if (qrContainer) {
      qrContainer.style.display = 'none';
    }
    
    // Show success animation or redirect
    this.showSuccessState(paymentStatus.data);
    
    // Call success callback if provided
    if (this.options.onSuccess) {
      this.options.onSuccess(paymentStatus.data);
    }
  }
  
  /**
   * Handle failed payment
   */
  handlePaymentFailure(paymentStatus) {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
    
    this.updateStatus('Payment failed. Please try again.', 'error');
    
    // Call failure callback if provided
    if (this.options.onFailure) {
      this.options.onFailure(paymentStatus.data);
    }
  }
  
  /**
   * Show success state
   */
  showSuccessState(paymentData) {
    const widgetBody = this.container.querySelector('.sbtcpay-widget-body');
    if (widgetBody) {
      widgetBody.innerHTML = `
        <div class="sbtcpay-success">
          <div class="success-icon">✓</div>
          <h3>Payment Successful!</h3>
          <p>Amount: ${paymentData.amount} sBTC</p>
          ${paymentData.stacksTxId ? `<p>Transaction ID: ${paymentData.stacksTxId}</p>` : ''}
          <p>Thank you for your payment.</p>
        </div>
      `;
    }
  }

  /**
   * Update status message
   */
  updateStatus(message, type = 'info') {
    const statusElement = this.container?.querySelector('#sbtcpay-status');
    if (statusElement) {
      statusElement.innerHTML = `<p class="status-${type}">${message}</p>`;
    }
  }

  injectStyles() {
    // Check if styles are already injected
    if (document.getElementById('sbtcpay-widget-styles')) {
      return;
    }
    
    const styles = `
      <style id="sbtcpay-widget-styles">
        .sbtcpay-widget {
          font-family: ${this.options.theme.fontFamily};
          max-width: 400px;
          margin: 0 auto;
          border: 1px solid #e1e5e9;
          border-radius: ${this.options.theme.borderRadius};
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          background: ${this.options.theme.backgroundColor};
          color: ${this.options.theme.textColor};
        }
        
        @media (max-width: 480px) {
          .sbtcpay-widget {
            max-width: 95%;
            margin: 0 10px;
          }
        }
        
        @media (max-width: 768px) {
          .sbtcpay-widget {
            max-width: 90%;
          }
        }
        
        .sbtcpay-widget-container {
          padding: 20px;
        }
        
        .sbtcpay-widget-logo {
          text-align: center;
          margin-bottom: 15px;
        }
        
        .sbtcpay-widget-logo img {
          max-height: 50px;
          max-width: 100%;
        }
        
        .sbtcpay-widget-header h3 {
          margin: 0 0 15px 0;
          font-size: 1.2em;
          text-align: center;
          color: ${this.options.theme.textColor};
        }
        
        .sbtcpay-widget-payment-info {
          margin-bottom: 20px;
        }
        
        .sbtcpay-widget-payment-info .label {
          font-weight: 600;
          color: #666;
          margin-right: 10px;
        }
        
        .sbtcpay-widget-payment-info .value {
          font-weight: bold;
          color: ${this.options.theme.textColor};
        }
        
        .sbtcpay-widget-amount,
        .sbtcpay-widget-description {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        
        /* Wallet Selection Styles */
        .sbtcpay-wallet-selection {
          margin: 20px 0;
        }
        
        .sbtcpay-wallet-selection h4 {
          margin: 0 0 15px 0;
          font-size: 1em;
          color: ${this.options.theme.textColor};
          text-align: center;
        }
        
        .sbtcpay-wallet-buttons {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .sbtcpay-wallet-button {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border: 2px solid #e1e5e9;
          border-radius: ${this.options.theme.borderRadius};
          background: ${this.options.theme.backgroundColor};
          color: ${this.options.theme.textColor};
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 14px;
          font-weight: 500;
        }
        
        .sbtcpay-wallet-button:hover {
          border-color: ${this.options.theme.primaryColor};
          background: rgba(52, 152, 219, 0.05);
        }
        
        .sbtcpay-wallet-button .wallet-icon {
          width: 24px;
          height: 24px;
          border-radius: 4px;
        }
        
        .sbtcpay-or-text {
          text-align: center;
          margin: 15px 0;
          color: #666;
          font-size: 14px;
        }
        
        .sbtcpay-no-wallets {
          text-align: center;
          padding: 20px;
          background: #f8f9fa;
          border-radius: ${this.options.theme.borderRadius};
          margin: 20px 0;
        }
        
        .sbtcpay-wallet-recommendations {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 15px;
        }
        
        .sbtcpay-wallet-recommendations a {
          color: ${this.options.theme.primaryColor};
          text-decoration: none;
          font-weight: 500;
        }
        
        .sbtcpay-wallet-recommendations a:hover {
          text-decoration: underline;
        }
        
        /* Connected Wallet Styles */
        .sbtcpay-connected-wallet {
          margin: 20px 0;
        }
        
        .sbtcpay-wallet-info {
          background: #f8f9fa;
          padding: 12px 16px;
          border-radius: ${this.options.theme.borderRadius};
          margin-bottom: 15px;
        }
        
        .sbtcpay-wallet-info .wallet-name {
          display: block;
          font-weight: 600;
          color: ${this.options.theme.textColor};
          margin-bottom: 4px;
        }
        
        .sbtcpay-wallet-info .wallet-address {
          display: block;
          font-family: monospace;
          font-size: 12px;
          color: #666;
        }
          margin-bottom: 20px;
        }
        
        .sbtcpay-widget-amount,
        .sbtcpay-widget-description {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        
        .sbtcpay-widget-amount .label,
        .sbtcpay-widget-description .label {
          font-weight: 600;
        }
        
        .sbtcpay-widget-actions {
          text-align: center;
          margin-bottom: 20px;
        }
        
        .sbtcpay-button {
          background-color: ${this.options.theme.primaryColor};
          color: white;
          border: none;
          padding: 12px 20px;
          font-size: 16px;
          border-radius: 4px;
          cursor: pointer;
          width: 100%;
          font-weight: 600;
          transition: background-color 0.3s;
        }
        
        .sbtcpay-button:hover {
          opacity: 0.9;
        }
        
        .sbtcpay-button:focus {
          outline: 2px solid ${this.options.theme.primaryColor};
          outline-offset: 2px;
        }
        
        .sbtcpay-widget-qrcode {
          display: none;
          text-align: center;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 4px;
          margin-bottom: 20px;
        }
        
        .sbtcpay-qr-info {
          margin-top: 15px;
        }
        
        .sbtcpay-qr-placeholder {
          font-size: 14px;
        }
        
        .sbtcpay-address {
          font-family: monospace;
          font-size: 12px;
          word-break: break-all;
          background: #eee;
          padding: 5px;
          border-radius: 3px;
          margin: 5px 0;
        }
        
        .sbtcpay-widget-success,
        .sbtcpay-widget-error {
          text-align: center;
        }
        
        .sbtcpay-widget-success h3,
        .sbtcpay-widget-error h3 {
          margin-top: 0;
        }
        
        .sbtcpay-widget-footer {
          text-align: center;
          font-size: 0.8em;
          color: #7f8c8d;
          border-top: 1px solid #ecf0f1;
          padding-top: 15px;
          margin-top: 15px;
        }
        
        .sbtcpay-widget-error-content {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
          border-radius: 4px;
          padding: 15px;
          margin: 10px;
        }
        
        /* Focus styles for accessibility */
        .sbtcpay-button:focus,
        .sbtcpay-widget a:focus {
          outline: 2px solid ${this.options.theme.primaryColor};
          outline-offset: 2px;
        }
      </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', styles);
  }
}

// Auto-initialize widget if script tag has data attributes
document.addEventListener('DOMContentLoaded', () => {
  const scriptTags = document.querySelectorAll('script[src*="widget.js"]');
  scriptTags.forEach(scriptTag => {
    const apiKey = scriptTag.getAttribute('data-api-key');
    const paymentIntentId = scriptTag.getAttribute('data-payment-intent-id');
    const container = scriptTag.getAttribute('data-container');
    
    // Theme customization
    const primaryColor = scriptTag.getAttribute('data-primary-color');
    const backgroundColor = scriptTag.getAttribute('data-background-color');
    const textColor = scriptTag.getAttribute('data-text-color');
    const fontFamily = scriptTag.getAttribute('data-font-family');
    const borderRadius = scriptTag.getAttribute('data-border-radius');
    const logoUrl = scriptTag.getAttribute('data-logo-url');
    
    if (paymentIntentId) {
      new SBTCPayWidget({
        apiKey,
        paymentIntentId,
        container,
        theme: {
          primaryColor,
          backgroundColor,
          textColor,
          fontFamily,
          borderRadius,
          logoUrl
        }
      });
    }
  });
});

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SBTCPayWidget;
} else if (typeof window !== 'undefined') {
    window.SBTCPayWidget = SBTCPayWidget;
}
