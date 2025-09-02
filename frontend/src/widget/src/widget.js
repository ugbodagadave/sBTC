/**
 * sBTCPay Payment Widget
 * 
 * An embeddable widget for accepting sBTC payments with multiple wallet support
 */

// Import QR code library
let QRCode;
if (typeof window !== 'undefined') {
  try {
    QRCode = require('qrcode');
    console.log('QRCode library loaded successfully');
  } catch (e) {
    console.warn('QRCode library failed to load:', e);
  }
}

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
        fontFamily: options.theme?.fontFamily || "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif",
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

        // Detect Hiro Wallet
        if (window.HiroWalletProvider) {
          wallets.push({
            id: 'hiro',
            name: 'Hiro Wallet',
            icon: 'https://wallet.hiro.so/favicon.ico',
            provider: 'hiro',
            supported: ['stacks', 'bitcoin']
          });
        }

        // Detect Bitcoin Connect
        if (window.webln || window.WebLNProvider) {
          wallets.push({
            id: 'bitcoin-connect',
            name: 'Bitcoin Connect',
            icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNGODlDMzUiLz4KPHBhdGggZD0iTTI4LjQ5MzIgMTcuODQ3MUMyOC45MDIzIDE1LjY2MTUgMjcuMjI0OCAxNC40MTQyIDI0Ljk0OTcgMTMuNTg2NEwyNS44NTY0IDEwLjEwMDFMMjMuODI3IDkuNTgxMDdMMjIuOTQzNyAxMi45NzY0QzIyLjM3ODMgMTIuODM2NCAyMS43OTUzIDEyLjcwMzggMjEuMjE0NyAxMi41NzIzTDIyLjEwMzQgOS4xNTI4OUwyMC4wNzQ2IDguNjMzODVMMTkuMTY3OSAxMi4xMjAyQzE4LjY5OTYgMTIuMDEzIDE4LjI0IDE5Ljc0NzQgMTguMjQgMTkuNzQ3NEwxOC4yNDAzIDE5Ljc0NjNDMTYuNzU2OCAxOS4zNzc2IDE1LjczIDE4Ljk0IDE1LjYwNyAxNi43Njk5TDEzLjU3NzcgMTcuMjkwMUwxMi41ODMzIDIxLjA1NzlDMTIuNTgzMyAyMS4wNTc5IDEzLjU3ODEgMjEuMjkxIDE0LjUzNjkgMjEuNDk2OEMxNS4zOTM4IDIxLjY4MTcgMTUuMzI1OSAyMS42MzQzIDE1LjMyNTkgMjEuNjM0M0wxNC4xODMyIDI2LjAzNzRMMTYuMjEzIDI2LjU1NjRMMTcuMTE5NyAyMy4wNzExQzE3LjcwMzcgMjMuMjIzIDE4LjI2OTIgMjMuMzYzIDAxOS40NTQgMjMuNjk2NEMxNi4wMTUzIDIzLjMwNDIgMTYuMDE1MyAyMy4zMDQyIDE2LjMxNTMgMjMuMzA0MkMxNy44MDkgMjYuMDA4MSAyMC4zNjkyIDI1LjQ0NjkgMjEuMjUwMyAyMy4wNTUxQzIyLjEzMTMgMjAuNjYzMiAyMS4yNTI0IDE5LjA4MDggMTkuNDA0NCAxOC4wMzMyQzIwLjgwNzEgMTcuNzAxNCwyMS44ODkxIDE2Ljk1MTcgMjIuMjM3NyAxNS40MjE0QzIyLjcwMDYgMTMuMzk0MSAyMS40MjI4IDEyLjIxOTkgMTkuNjIxOCAxMS42MTgxTDIwLjUzMDEgOC4xMjk5NEwxOC41IDcuNjExMDJMMTcuNTkzMyAxMS4wOTc0QzE3LjAyNzkgMTAuOTU3NCAxNi40NDQ5IDEwLjgyNDcgMTUuODc1NCAxMC42OTExTDE2Ljc4NjYgNy4yMjE0OUwxNC43NTc4IDYuNzAyNDVMMTMuODQ5NSAxMC4xODlDMTMuMzgxMiAxMC4wODE4IDEyLjkyMTYgOS45NzQ1MiAxMi40ODE4IDkuODYyNzRMMTIuNDkwNyA5LjgyNDE5TDkuNjMyNzkgOS4xMTQ1N7w5LjA3ODk2IDExLjI4NzFDOS4wNzg5NiAxMS4yODcxIDEwLjU2MyAxMS42NTUxIDEwLjUyMiAxMS42OTM3QzExLjM3ODkgMTEuODc4NiAxMS41NjExIDIuNDEwNCAxMS41NjExIDEyLjQxMDRDMTEuNDM4IDEyLjc1OTMgMTEuMjcyMyAxMi45OTg0IDEwLjc4MjggMTMuMDc2N0MxMC44MjQgMTMuMDM4IDkuMzM4MDYgMTIuNzQ5MiA5LjMzODA2IDEyLjc0OTJMOC4zNDM3IDE1LjE0MTdMMTAuOTkwNSAxNS43ODU0QzExLjUwODEgMTUuOTE3OSAxMi4wMTU1IDE2LjA1ODEgMTIuNTE0NSAxNi4xOTI5TDExLjYwMzMgMTkuNzAzNEwxMy42MzIxIDIwLjIyMjRMMTQuNTM4OCA2LjczNTk5QzE1LjExOTYgMTYuODg3NSAxNS43MDcgMTcuMDI1IDE2LjI4OCAxNy4xNTc3TDE1LjM4MSAyMC42NDIxTDE3LjQxIDIxLjE2MUwxOC4zMjEyIDE3LjY1NzNDMjEuMzE3MyAxOC4yNDI1IDIzLjUxMDYgMTguMDE3MyAyNC40NTYxIDE1LjM3MUMyNS4yMDA3IDEzLjI3NzggMjQuNTYyOCAxMi4xMDQ0IDIzLjEyMzMgMTEuMzU2NkMyNC4xODA3IDExLjE1NyAyNC45NzU0IDEwLjQ0MjUgMjUuMjU2MyA5LjA0MTc5QzI1LjY0MTggNy4xMzExOCAyNC4xOTQ1IDYuMjI3NzMgMjIuMzM2NCA1LjY5ODA0TDIzLjI0NDggMi4yMTA3NUwyMS4yMTU5IDEuNjkxN7wyMC4zMTI2IDUuMTYyNDJDMTkuNzQ4MiA1LjAyMTQ4IDE5LjE2MzkgNC44OTA0MSAxOC41ODI0IDQuNzU2NTdMMTkuNDkwNyAxLjMwMTYxTDE3LjQ2MTkgMC43ODI1NjhMMTYuNTUzNSA0LjI2OTg0QzE2LjA5MTEgNC4xNjQxNCAxNS42MzY2IDQuMDYwNzMgMTUuMTk4NyAzLjk0OTc5TDE1LjIwNjkgMy45MTU0MUwxMi4zNDk1IDMuMjA1NzlMMTEuNzk1NiA1LjM3ODM0QzExLjc5NTYgNS4zNzgzNCAxMy4yNzk2IDUuNzQ2MzMgMTMuMjM4NiA1Ljc4NDkyQzE0LjA5NTQgNS45Njk4NSAxNC4yNzc2IDYuNTAxNjQgMTQuMjc3NiA2LjUwMTY0TDEyLjM0OTkgMTMuMDM0OEwxMS4yMDY1IDE3LjQzNzlMMTMuMjM2MyAxNy45NTY5TDE0LjE0MyAxNC40NzE2QzE0LjcyOCAxNC42MjM2IDE1LjI5MzMgMTQuNzYzOSAxNS44NDkgMTQuODk3MkwxNC45NDc1IDE4LjM2OTFMMTYuOTc2MyAxOC44ODhMMTcuODgzIDE1LjQwMTdDMjAuODc5MSAxNS45ODY4IDIzLjA3MjUgMTUuNzYxNiAyNC4wMTggMTMuMTE1NEMyNC43NjI2IDExLjAyMTggMjQuMTI0NiA5Ljg0ODQxIDIyLjY4NTIgOS4xMDA2QzIzLjc0MjYgOC45MDA5NyAyNC41MzczIDguMTg2NDcgMjQuODE4MiA2Ljc4NThDMjUuMjExNCA0Ljg2NDQyIDIzLjc2MDQgMy45NTczNCAyMS44OTQ5IDMuNDMwODhMMjEuODk1IDMuNDMwN0wyMi44MDMzIDAgMjAuNzc0NSAtMC41MTkwNDNMMTkuODcxMyAyLjk1MTY5QzE5LjMwNjkgMi44MTA3NSAxOC43MjI1IDIuNjc5NjggMTguMTQxMSAyLjU0NTg0TDE5LjA0ODQgLTAuOTA5MTQ1TDE3LjAxOTYgLTEuNDI4MjFMMTYuMTExMyAyLjA1OTA4QzE1LjY0MjggMS45NTE3OSAxNS4xODQgMS44NDU3MyAxNC43NDQ2IDEuNzMzMDhMMTQuNzU0MyAxLjY5MjYxTDExLjg5NTkgMC45ODQwNjJMMTEuMzQyMiAzLjE1NjUxQzExLjM0MjIgMy4xNTY1MSAxMi44MjYyIDMuNTI0NSAxMi43ODUyIDMuNTYzMDhDMTMuNjQyIDMuNzQ4MDIgMTMuODI0MyA0LjI3OTgxIDEzLjgyNDMgNC4yNzk4MUwxMS44OTY2IDEwLjgxM0wxMC43NTMyIDE1LjIxNjFMMTIuNzgzIDE1LjczNTFMMTMuNjg5NyAxMi4yNDk4QzE0LjI3NDcgMTIuNDAxOCAxNC44NCAxMi41NDIxIDE1LjM5NTcgMTIuNjc1NEwxNC40ODg3IDE2LjE0NjNMMTYuNTE3NSAxNi42NjUzTDE3LjY2MDkgMTEuMjYyMkwxNy42NjA3IDExLjI2MjZDMTkuNDU0NSAxMy45NjY1IDIyLjAxNDcgMTMuNDA1MyAyMi44OTU4IDExLjAxMzRDMjMuNzc2OSA4LjYyMTU0IDIyLjg5OCA3LjAzOTE0IDIxLjA1IDUuOTkxNTVDMjIuNDUyNyA1LjY1OTc1IDIzLjUzNDcgNC45MSAyMy44ODMzIDMuMzc5N0MyNC4zNDYyIDEuMzUyNDMgMjMuMDY4NCAwLjE3ODIyOCAyMS4yNjc0IC0wLjQyMzU5MUwyMS44OTUgMy40MzA3QzIwLjc0MSAzLjA5MzcgMTkuMjU2NyAyLjgwMzkgMTYuNTUzNSA0LjI2OThMMTcuODgzIDEyLjE5OTZaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K',
            provider: 'webln',
            supported: ['bitcoin', 'lightning']
          });
        }
        
        // Detect WalletConnect
        if (typeof window.WalletConnectProvider !== 'undefined') {
          wallets.push({
            id: 'walletconnect',
            name: 'WalletConnect',
            icon: 'https://walletconnect.org/walletconnect-logo.png',
            provider: 'walletconnect',
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
    try {
      // Try to fetch from server
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
    } catch (error) {
      console.warn('Using mock payment data for demo purposes:', error);
      // For demo/development: use mock data if server request fails
      this.paymentData = {
        id: this.options.paymentIntentId || 'mock-payment-intent',
        amount: 0.01,
        status: 'requires_payment',
        description: 'Test payment',
        merchant_id: 'mock-merchant'
      };
    }
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
          
          <div class="sbtcpay-qrcode-container" id="sbtcpay-qrcode-container" style="display: none;">
            <h4 class="sbtcpay-qrcode-header">Scan with your mobile wallet</h4>
            <div id="sbtcpay-qrcode"></div>
            <div class="sbtcpay-qr-details">Scan this code with your sBTC compatible wallet</div>
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
        <div style="text-align: center; margin: 16px 0 8px;">
          <span style="display: inline-block; color: #888;">or</span>
        </div>
        <button id="sbtcpay-show-qr-button" class="sbtcpay-wallet-button primary">Show QR Code</button>
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
        <div style="text-align: center; margin: 16px 0 8px;">
          <span style="display: inline-block; color: #888;">or</span>
        </div>
        <button id="sbtcpay-show-qr-button" class="sbtcpay-wallet-button primary">Show QR Code</button>
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
        case 'hiro':
          address = await this.connectHiroWallet();
          break;
        case 'webln':
          address = await this.connectBitcoinConnectWallet();
          break;
        case 'walletconnect':
          address = await this.connectWalletConnectWallet();
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
   * Connect to Hiro Wallet
   */
  async connectHiroWallet() {
    try {
      if (!window.HiroWalletProvider) {
        throw new Error('Hiro wallet not detected');
      }
      
      const provider = window.HiroWalletProvider;
      await provider.connect();
      
      const accounts = await provider.getAddresses();
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts returned from Hiro wallet');
      }
      
      return accounts[0];
      
    } catch (error) {
      throw new Error(`Hiro wallet connection failed: ${error.message}`);
    }
  }
  
  /**
   * Connect to Bitcoin Connect (WebLN)
   */
  async connectBitcoinConnectWallet() {
    try {
      if (typeof window.webln === 'undefined' && typeof window.WebLNProvider === 'undefined') {
        throw new Error('WebLN provider not detected');
      }
      
      // Use existing WebLN provider or initialize if not already enabled
      let weblnProvider = window.webln;
      
      if (!weblnProvider && window.WebLNProvider) {
        weblnProvider = new window.WebLNProvider();
      }
      
      // Enable WebLN
      await weblnProvider.enable();
      
      // Get node info to identify the wallet
      const info = await weblnProvider.getInfo();
      console.log('WebLN wallet connected:', info);
      
      // For Bitcoin Connect, we use the node public key as the "address"
      // since we don't have a direct Bitcoin address method
      return info.node?.publicKey || 'webln-user';
      
    } catch (error) {
      throw new Error(`Bitcoin Connect wallet connection failed: ${error.message}`);
    }
  }
  
  /**
   * Connect to wallet using WalletConnect
   */
  async connectWalletConnectWallet() {
    try {
      if (typeof window.WalletConnectProvider === 'undefined') {
        throw new Error('WalletConnect provider not detected');
      }
      
      // Initialize WalletConnect provider
      const provider = new window.WalletConnectProvider({
        rpc: {
          1: 'https://cloudflare-eth.com', // Ethereum
          // Add other chain RPC endpoints as needed
        },
      });
      
      // Enable session
      const accounts = await provider.enable();
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts returned from WalletConnect');
      }
      
      // Store provider for later use
      this._walletConnectProvider = provider;
      
      return accounts[0];
      
    } catch (error) {
      throw new Error(`WalletConnect connection failed: ${error.message}`);
    }
  }
  
  /**
   * Disconnect from current wallet
   */
  disconnectWallet() {
    // Clean up WalletConnect provider if it exists
    if (this._walletConnectProvider) {
      try {
        this._walletConnectProvider.disconnect();
      } catch (error) {
        console.warn('Error disconnecting WalletConnect:', error);
      }
      this._walletConnectProvider = null;
    }

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
        
        // Ensure the QR code is visible
        const qrElement = this.container.querySelector('#sbtcpay-qrcode');
        if (qrElement) {
          qrElement.style.display = 'block';
        }
        
        // Ensure the text below QR code is visible
        const qrDetails = this.container.querySelector('.sbtcpay-qr-details');
        if (qrDetails) {
          qrDetails.style.display = 'block';
        }
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
      const qrElement = this.container.querySelector('#sbtcpay-qrcode');
      if (qrElement) {
        try {
          if (QRCode && QRCode.toCanvas) {
            // Use QRCode from npm package
            const canvas = document.createElement('canvas');
            QRCode.toCanvas(canvas, paymentData.qrText, {
              width: 200,
              margin: 1,
              color: {
                dark: '#000000',
                light: '#ffffff'
              },
              errorCorrectionLevel: 'H'
            });
            qrElement.appendChild(canvas);
            console.log('QR code generated using imported library');
          } else if (window.QRCode) {
            // Use global QRCode if available
            new window.QRCode(qrElement, {
              text: paymentData.qrText,
              width: 200,
              height: 200,
              colorDark: "#000000",
              colorLight: "#ffffff",
              correctLevel: window.QRCode.CorrectLevel ? window.QRCode.CorrectLevel.H : 0
            });
            console.log('QR code generated using global library');
          } else {
            throw new Error('No QR code library available');
          }
        } catch (qrError) {
          console.error('QR code generation failed:', qrError);
          // Fallback to simple QR code display
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
    // Add styles to the document
    const styleId = 'sbtcpay-widget-styles';
    
    // Check if styles are already injected
    if (document.getElementById(styleId)) {
      return;
    }
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      /* Import Poppins font */
      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
      
      .sbtcpay-widget {
        font-family: ${this.options.theme.fontFamily};
        background-color: ${this.options.theme.backgroundColor};
        color: ${this.options.theme.textColor};
        border-radius: ${this.options.theme.borderRadius};
        padding: 20px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        max-width: 500px;
        width: 100%;
        box-sizing: border-box;
        position: relative;
      }
      
      .sbtcpay-widget * {
        box-sizing: border-box;
      }
      
      .sbtcpay-widget-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        padding-bottom: 12px;
      }
      
      .sbtcpay-widget-title {
        font-size: 1.4rem;
        font-weight: 600;
        margin: 0;
        color: ${this.options.theme.textColor};
      }
      
      .sbtcpay-logo {
        max-height: 40px;
        max-width: 100px;
      }
      
      .sbtcpay-widget-body {
        margin-bottom: 16px;
      }
      
      .sbtcpay-payment-info {
        margin-bottom: 24px;
      }
      
      .sbtcpay-payment-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        font-size: 1rem;
      }
      
      .sbtcpay-payment-label {
        font-weight: 500;
        color: ${this.options.theme.textColor};
        opacity: 0.8;
      }
      
      .sbtcpay-payment-value {
        font-weight: 600;
      }
      
      .sbtcpay-wallet-selection {
        margin-top: 16px;
      }
      
      .sbtcpay-wallet-options {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 8px;
      }
      
      .sbtcpay-wallet-option {
        display: flex;
        align-items: center;
        gap: 10px;
        border: 1px solid rgba(0, 0, 0, 0.1);
        border-radius: 8px;
        padding: 10px 12px;
        cursor: pointer;
        transition: all 0.2s ease;
        background-color: #ffffff;
      }
      
      .sbtcpay-wallet-option:hover {
        border-color: ${this.options.theme.primaryColor};
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        transform: translateY(-1px);
      }
      
      .sbtcpay-wallet-icon {
        width: 24px;
        height: 24px;
        object-fit: contain;
      }
      
      .sbtcpay-wallet-name {
        font-weight: 500;
        color: ${this.options.theme.textColor};
      }
      
      .sbtcpay-wallet-button {
        background-color: transparent;
        border: 1px solid ${this.options.theme.primaryColor};
        color: ${this.options.theme.primaryColor};
        border-radius: 6px;
        padding: 10px 16px;
        font-family: ${this.options.theme.fontFamily};
        font-weight: 500;
        font-size: 0.95rem;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 100%;
        margin-top: 8px;
      }
      
      .sbtcpay-wallet-button:hover {
        background-color: ${this.options.theme.primaryColor}10;
      }
      
      .sbtcpay-wallet-button.primary {
        background-color: ${this.options.theme.primaryColor};
        color: white;
      }
      
      .sbtcpay-wallet-button.primary:hover {
        filter: brightness(1.1);
      }
      
      .sbtcpay-connected-wallet {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 12px;
        background-color: ${this.options.theme.backgroundColor};
        border-radius: 8px;
        border: 1px solid rgba(0, 0, 0, 0.1);
      }
      
      .sbtcpay-wallet-info {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
        width: 100%;
      }
      
      .sbtcpay-address-display {
        font-family: 'Roboto Mono', monospace;
        font-size: 0.85rem;
        background-color: rgba(0, 0, 0, 0.05);
        padding: 6px 10px;
        border-radius: 4px;
        word-break: break-all;
        flex: 1;
        text-align: center;
        cursor: pointer;
      }
      
      .sbtcpay-status {
        margin-top: 16px;
        padding: 10px;
        border-radius: 6px;
        background-color: rgba(0, 0, 0, 0.05);
        font-size: 0.9rem;
        text-align: center;
      }
      
      .sbtcpay-status.error {
        background-color: rgba(220, 53, 69, 0.1);
        color: #dc3545;
      }
      
      .sbtcpay-status.success {
        background-color: rgba(40, 167, 69, 0.1);
        color: #28a745;
      }
      
      .sbtcpay-status.warning {
        background-color: rgba(255, 193, 7, 0.1);
        color: #ffc107;
      }
      
      .sbtcpay-qrcode-container {
        display: none;
        background-color: white;
        padding: 16px;
        border-radius: 8px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
        margin-top: 16px;
        text-align: center;
      }
      
      .sbtcpay-qrcode-header {
        font-weight: 600;
        margin-bottom: 16px;
        color: ${this.options.theme.textColor};
      }
      
      #sbtcpay-qrcode {
        margin: 0 auto 16px;
        width: 200px;
        height: 200px;
        border: 1px solid rgba(0, 0, 0, 0.1);
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: white;
        padding: 8px;
      }
      
      .sbtcpay-qr-details {
        font-size: 0.9rem;
        margin: 12px 0;
        color: ${this.options.theme.textColor};
        font-weight: 500;
        text-align: center;
      }
      
      .payment-address-info {
        margin-top: 12px;
        padding: 8px;
        background-color: rgba(0, 0, 0, 0.03);
        border-radius: 6px;
      }
      
      .payment-address-info label {
        display: block;
        font-size: 0.8rem;
        color: ${this.options.theme.textColor};
        opacity: 0.7;
        margin-bottom: 4px;
      }
      
      .address-text {
        font-family: 'Roboto Mono', monospace;
        font-size: 0.85rem;
        word-break: break-all;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: background-color 0.2s ease;
      }
      
      .address-text:hover {
        background-color: rgba(0, 0, 0, 0.05);
      }
      
      .payment-address-info small {
        display: block;
        font-size: 0.75rem;
        opacity: 0.7;
        margin-top: 4px;
      }
      
      .sbtcpay-widget-footer {
        font-size: 0.8rem;
        text-align: center;
        color: ${this.options.theme.textColor};
        opacity: 0.7;
        margin-top: 16px;
        padding-top: 12px;
        border-top: 1px solid rgba(0, 0, 0, 0.1);
      }
      
      .sbtcpay-widget a {
        color: ${this.options.theme.primaryColor};
        text-decoration: none;
      }
      
      .sbtcpay-widget a:hover {
        text-decoration: underline;
      }
      
      .sbtcpay-no-wallets {
        padding: 16px;
        text-align: center;
        background-color: rgba(0, 0, 0, 0.03);
        border-radius: 8px;
        margin-bottom: 16px;
      }
      
      .sbtcpay-no-wallets-title {
        font-weight: 600;
        margin-bottom: 8px;
      }
      
      .sbtcpay-wallet-recommendations {
        margin-top: 12px;
        font-size: 0.9rem;
      }
      
      .sbtcpay-wallet-recommendations a {
        display: inline-block;
        margin: 4px 8px;
      }
      
      .sbtcpay-success-animation {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 24px 0;
      }
      
      .sbtcpay-success-circle {
        width: 60px;
        height: 60px;
        background-color: #28a745;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 30px;
        margin-bottom: 16px;
      }
      
      .sbtcpay-success-title {
        font-weight: 600;
        font-size: 1.2rem;
        margin-bottom: 8px;
      }
      
      .sbtcpay-tx-details {
        margin-top: 16px;
        font-size: 0.9rem;
        width: 100%;
      }
      
      .sbtcpay-tx-detail-row {
        display: flex;
        justify-content: space-between;
        padding: 4px 0;
      }
      
      .sbtcpay-tx-detail-label {
        opacity: 0.8;
      }
      
      .sbtcpay-tx-hash {
        font-family: 'Roboto Mono', monospace;
        font-size: 0.85rem;
        word-break: break-all;
        cursor: pointer;
      }
      
      /* Responsive styles */
      @media (max-width: 480px) {
        .sbtcpay-widget {
          padding: 16px;
        }
        
        .sbtcpay-widget-title {
          font-size: 1.2rem;
        }
      }
    `;
    
    document.head.appendChild(style);
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
    module.exports.default = SBTCPayWidget;
}

// Always make available globally when in browser
if (typeof window !== 'undefined') {
    window.SBTCPayWidget = SBTCPayWidget;
    console.log('SBTCPayWidget registered globally:', SBTCPayWidget.name);
}
