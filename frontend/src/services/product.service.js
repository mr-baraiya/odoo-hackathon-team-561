import apiClient from './apiClient';

export const productService = {
  // Fetch all products
  async getProducts() {
    return await apiClient.get('/products');
  },

  // Get single product
  async getProductById(id) {
    return await apiClient.get(`/products/${id}`);
  },

  // Create new product
  async createProduct(productData) {
    return await apiClient.post('/products', productData);
  },

  // Update existing product
  async updateProduct(id, productData) {
    return await apiClient.put(`/products/${id}`, productData);
  },

  // Delete product
  async deleteProduct(id) {
    return await apiClient.delete(`/products/${id}`);
  },

  // Toggle product status (active/inactive/draft)
  async updateProductStatus(id, is_active) {
    return await apiClient.patch(`/products/${id}/status`, { is_active });
  },

  // Toggle promotion status
  async updateProductPromotion(id, is_promoted) {
    return await apiClient.patch(`/products/${id}/promotion`, { is_promoted });
  },

  // Fetch product categories
  async getCategories() {
    return await apiClient.get('/categories');
  },

  // Create product category
  async createCategory(categoryData) {
    return await apiClient.post('/categories', categoryData);
  },
};

export default productService;
