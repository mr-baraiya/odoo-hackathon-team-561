import apiClient from "./apiClient";

export const authService = {
  // Login with email and password or magic token
  async login(credentials) {
    return await apiClient.post("/auth/login", credentials);
  },

  // Get current logged in user profile
  async getMe() {
    return await apiClient.get("/auth/me");
  },

  // Logout current user
  async logout() {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // Ignore network failure on logout
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },

  // Forgot password request
  async forgotPassword(email) {
    return await apiClient.post("/auth/forgot-password", { email });
  },

  // Reset password using token
  async resetPassword(token, newPassword) {
    return await apiClient.post("/auth/reset-password", { token, newPassword });
  },

  // Request passwordless magic link
  async requestMagicLink(email) {
    return await apiClient.post("/auth/magic-link", { email });
  },

  // Change password for logged-in user
  async changePassword(currentPassword, newPassword) {
    return await apiClient.post("/auth/change-password", { currentPassword, newPassword });
  },
};

export default authService;
