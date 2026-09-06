import apiClient from './apiClient';

export const paymentService = {
  /**
   * Create Razorpay payment order for an invoice
   */
  async createRazorpayOrder(invoiceId, amount, currency = 'INR') {
    return await apiClient.post('/payments/create-order', {
      invoice_id: invoiceId,
      amount,
      currency,
    });
  },

  /**
   * Verify Razorpay HMAC signature and record payment in database
   */
  async verifyRazorpayPayment(paymentData) {
    return await apiClient.post('/payments/verify', paymentData);
  },

  /**
   * Check status of a payment record
   */
  async getPaymentStatus(paymentId) {
    return await apiClient.get(`/payments/${paymentId}/status`);
  },

  /**
   * List all payment records (for Finance Ops / Admin)
   */
  async getPayments() {
    return await apiClient.get('/payments');
  },
};

export default paymentService;
