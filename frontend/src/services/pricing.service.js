import apiClient from './apiClient';

export const pricingService = {
  // Fetch all price lists
  async getPriceLists() {
    return await apiClient.get('/price-lists');
  },

  // Get single price list by ID
  async getPriceListById(id) {
    return await apiClient.get(`/price-lists/${id}`);
  },

  // Create new price list
  async createPriceList(data) {
    return await apiClient.post('/price-lists', data);
  },

  // Update price list
  async updatePriceList(id, data) {
    return await apiClient.put(`/price-lists/${id}`, data);
  },

  // Delete price list
  async deletePriceList(id) {
    return await apiClient.delete(`/price-lists/${id}`);
  },

  // Add custom product price item to price list
  async addPriceListItem(listId, itemData) {
    return await apiClient.post(`/price-lists/${listId}/items`, itemData);
  },

  // Remove item from price list
  async deletePriceListItem(listId, itemId) {
    return await apiClient.delete(`/price-lists/${listId}/items/${itemId}`);
  },
};

export default pricingService;
