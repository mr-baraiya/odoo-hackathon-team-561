import apiClient from './apiClient';

export const approvalService = {
  // Fetch approval rules
  async getApprovalRules() {
    return await apiClient.get('/approvals/rules');
  },

  // Create approval rule
  async createApprovalRule(data) {
    return await apiClient.post('/approvals/rules', data);
  },

  // Update approval rule
  async updateApprovalRule(id, data) {
    return await apiClient.put(`/approvals/rules/${id}`, data);
  },

  // Delete approval rule
  async deleteApprovalRule(id) {
    return await apiClient.delete(`/approvals/rules/${id}`);
  },

  // Fetch category discount ceiling rules
  async getDiscountRules() {
    return await apiClient.get('/discount/rules');
  },

  // Create category discount rule
  async createDiscountRule(data) {
    return await apiClient.post('/discount/rules', data);
  },

  // Update category discount rule
  async updateDiscountRule(id, data) {
    return await apiClient.put(`/discount/rules/${id}`, data);
  },

  // Delete category discount rule
  async deleteDiscountRule(id) {
    return await apiClient.delete(`/discount/rules/${id}`);
  },

  // Fetch role discount limits
  async getRoleLimits() {
    return await apiClient.get('/discount/role-limits');
  },

  // Update role discount limit
  async updateRoleLimit(data) {
    return await apiClient.put('/discount/role-limits', data);
  },
};

export default approvalService;
