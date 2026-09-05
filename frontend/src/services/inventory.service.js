import apiClient from './apiClient';

export const inventoryService = {
  // --- WAREHOUSES API ---
  async getWarehouses() {
    return await apiClient.get('/warehouses');
  },

  async createWarehouse(data) {
    return await apiClient.post('/warehouses', data);
  },

  async updateWarehouse(id, data) {
    return await apiClient.put(`/warehouses/${id}`, data);
  },

  async deleteWarehouse(id) {
    return await apiClient.delete(`/warehouses/${id}`);
  },

  // --- INVENTORY STOCK API ---
  async getInventoryStock() {
    return await apiClient.get('/inventory');
  },

  async getReorderAlerts() {
    return await apiClient.get('/inventory/reorder-alerts');
  },

  async createStockAllocation(data) {
    return await apiClient.post('/inventory/stock', data);
  },

  async updateStock(id, data) {
    return await apiClient.put(`/inventory/stock/${id}`, data);
  },

  async patchStock(id, data) {
    return await apiClient.patch(`/inventory/stock/${id}`, data);
  },
};

export default inventoryService;
