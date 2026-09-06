import apiClient from './apiClient';

export const productService = {
  // Fetch all products
  async getProducts() {
    return await apiClient.get('/catalog/products');
  },

  // Get single product
  async getProductById(id) {
    return await apiClient.get(`/catalog/products/${id}`);
  },

  // Create new product
  async createProduct(productData) {
    return await apiClient.post('/catalog/products', productData);
  },

  // Update existing product
  async updateProduct(id, productData) {
    return await apiClient.put(`/catalog/products/${id}`, productData);
  },

  // Delete product
  async deleteProduct(id) {
    return await apiClient.delete(`/catalog/products/${id}`);
  },

  // Toggle product status (active/inactive/draft)
  async updateProductStatus(id, is_active) {
    return await apiClient.patch(`/catalog/products/${id}/status`, { is_active });
  },

  // Toggle promotion status
  async updateProductPromotion(id, is_promoted) {
    return await apiClient.patch(`/catalog/products/${id}/promotion`, { is_promoted });
  },

  // Fetch product categories
  async getCategories() {
    return await apiClient.get('/catalog/categories');
  },

  // Create product category
  async createCategory(categoryData) {
    return await apiClient.post('/catalog/categories', categoryData);
  },

  // Update category
  async updateCategory(id, categoryData) {
    return await apiClient.put(`/catalog/categories/${id}`, categoryData);
  },

  // Delete category
  async deleteCategory(id) {
    return await apiClient.delete(`/catalog/categories/${id}`);
  },
};

export default productService;
