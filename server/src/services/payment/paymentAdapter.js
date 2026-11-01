/**
 * Base Payment Adapter Interface
 * All payment implementations (Stripe, Razorpay, etc.) must implement these methods.
 */
export class PaymentAdapter {
  /**
   * Create a checkout session for an order
   * @param {Object} params
   * @param {Object} params.order - The order document
   * @param {string} params.clientUrl - The frontend base URL
   * @returns {Promise<{ sessionId: string, sessionUrl: string }>}
   */
  async createCheckoutSession(_params) {
    throw new Error('createCheckoutSession must be implemented by payment adapter');
  }

  /**
   * Verify incoming webhook signature and parse event
   * @param {Object} params
   * @param {Buffer|string} params.rawBody
   * @param {string} params.signature
   * @returns {Object} Verified event payload
   */
  verifyWebhookEvent(_params) {
    throw new Error('verifyWebhookEvent must be implemented by payment adapter');
  }

  /**
   * Trigger a refund for a payment
   * @param {Object} params
   * @param {string} params.paymentIntentId
   * @param {number} params.amount
   * @returns {Promise<Object>} Refund response
   */
  async refundPayment(_params) {
    throw new Error('refundPayment must be implemented by payment adapter');
  }
}
