import apiClient from "./apiClient";

export const userService = {
  // Fetch all users from database
  async getUsers() {
    return await apiClient.get("/users");
  },

  // Get single user by ID
  async getUserById(id) {
    return await apiClient.get(`/users/${id}`);
  },

  // Create new user account in database
  async createUser(userData) {
    return await apiClient.post("/users", userData);
  },

  // Update existing user account in database
  async updateUser(id, userData) {
    return await apiClient.put(`/users/${id}`, userData);
  },

  // Toggle or set user active status in database
  async updateUserStatus(id, is_active) {
    return await apiClient.patch(`/users/${id}/status`, { is_active });
  },

  // Delete user account from database
  async deleteUser(id) {
    return await apiClient.delete(`/users/${id}`);
  },

  // Reset user password
  async resetPassword(id, new_password) {
    return await apiClient.post(`/users/${id}/reset-password`, { new_password });
  },
};

export default userService;
