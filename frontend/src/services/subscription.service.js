import apiClient from './apiClient';

export const subscriptionService = {
  // Fetch all subscription plans
  async getSubscriptionPlans() {
    return await apiClient.get('/subscription-plans');
  },

  // Create new subscription plan
  async createSubscriptionPlan(data) {
    return await apiClient.post('/subscription-plans', data);
  },

  // Update existing subscription plan
  async updateSubscriptionPlan(id, data) {
    return await apiClient.put(`/subscription-plans/${id}`, data);
  },

  // Delete subscription plan
  async deleteSubscriptionPlan(id) {
    return await apiClient.delete(`/subscription-plans/${id}`);
  },

  // Fetch active subscriptions
  async getActiveSubscriptions() {
    return await apiClient.get('/subscriptions');
  },
};

export default subscriptionService;
