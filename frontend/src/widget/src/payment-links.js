/**
 * sBTCPay Payment Links System
 * 
 * A system for generating and managing payment links
 */

class SBTCPayPaymentLinks {
  constructor(options = {}) {
    this.options = {
      apiKey: options.apiKey || null,
      baseUrl: options.baseUrl || 'http://localhost:3000/api/v1',
      ...options
    };
  }

  /**
   * Generate a payment link
   * @param {Object} paymentData - Payment information
   * @param {number} paymentData.amount - Amount in sBTC
   * @param {string} paymentData.description - Payment description
   * @param {string} paymentData.currency - Currency code (default: 'sBTC')
   * @param {Date} paymentData.expiresAt - Expiration date (optional)
   * @param {string} paymentData.password - Password protection (optional)
   * @param {Object} paymentData.metadata - Custom metadata (optional)
   * @returns {Promise<Object>} Payment link information
   */
  async generatePaymentLink(paymentData) {
    try {
      const response = await fetch(`${this.options.baseUrl}/payment-intents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.options.apiKey && { 'Authorization': `Bearer ${this.options.apiKey}` })
        },
        body: JSON.stringify({
          amount: paymentData.amount,
          description: paymentData.description,
          currency: paymentData.currency || 'sBTC',
          expiresAt: paymentData.expiresAt,
          password: paymentData.password,
          metadata: paymentData.metadata
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create payment intent: ${response.status}`);
      }

      const paymentIntent = await response.json();
      
      // Generate the payment link
      const paymentLink = `${window.location.origin}/pay/${paymentIntent.id}`;
      
      return {
        id: paymentIntent.id,
        link: paymentLink,
        qrCodeData: `sBTC://${paymentIntent.id}`,
        paymentIntent: paymentIntent
      };
    } catch (error) {
      console.error('Error generating payment link:', error);
      throw error;
    }
  }

  /**
   * Generate QR code for a payment link
   * @param {string} paymentLink - The payment link URL
   * @param {Object} options - QR code options
   * @returns {string} Data URL of the QR code
   */
  async generateQRCode(paymentLink, options = {}) {
    try {
      // Dynamically import QRCode library
      const QRCode = window.QRCode || (await import('qrcode')).default;
      
      const canvas = document.createElement('canvas');
      await QRCode.toCanvas(canvas, paymentLink, {
        width: options.width || 200,
        height: options.height || 200,
        margin: options.margin || 2,
        color: {
          dark: options.colorDark || '#000000',
          light: options.colorLight || '#ffffff'
        }
      });
      
      return canvas.toDataURL();
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  }

  /**
   * Get payment link information
   * @param {string} paymentLinkId - Payment link ID
   * @returns {Promise<Object>} Payment link information
   */
  async getPaymentLink(paymentLinkId) {
    try {
      const response = await fetch(`${this.options.baseUrl}/payment-intents/${paymentLinkId}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(this.options.apiKey && { 'Authorization': `Bearer ${this.options.apiKey}` })
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch payment link: ${response.status}`);
      }

      const paymentIntent = await response.json();
      const paymentLink = `${window.location.origin}/pay/${paymentIntent.id}`;
      
      return {
        id: paymentIntent.id,
        link: paymentLink,
        qrCodeData: `sBTC://${paymentIntent.id}`,
        paymentIntent: paymentIntent
      };
    } catch (error) {
      console.error('Error fetching payment link:', error);
      throw error;
    }
  }
}

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SBTCPayPaymentLinks;
}

// Also make it available globally
window.SBTCPayPaymentLinks = SBTCPayPaymentLinks;