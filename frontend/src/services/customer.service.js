import apiClient from './apiClient';

export const customerService = {
  // Fetch all customer companies from backend database
  async getCustomers() {
    return await apiClient.get('/customers');
  },

  // Get single customer by ID
  async getCustomerById(id) {
    return await apiClient.get(`/customers/${id}`);
  },

  // Create new customer account in database
  async createCustomer(customerData) {
    return await apiClient.post('/customers', customerData);
  },

  // Update existing customer details
  async updateCustomer(id, customerData) {
    return await apiClient.put(`/customers/${id}`, customerData);
  },

  // Delete customer account
  async deleteCustomer(id) {
    return await apiClient.delete(`/customers/${id}`);
  },

  // Get customer quotations
  async getCustomerQuotations(id) {
    return await apiClient.get(`/customers/${id}/quotations`);
  },

  // Get customer orders
  async getCustomerOrders(id) {
    return await apiClient.get(`/customers/${id}/orders`);
  },

  // Get customer invoices
  async getCustomerInvoices(id) {
    return await apiClient.get(`/customers/${id}/invoices`);
  },
};

export default customerService;
