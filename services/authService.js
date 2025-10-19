// ============================================
// FILE: services/authService.js
// Copy this to: services/authService.js
// ============================================

import { authAPI } from "../api/endpoints.js";
import { appState } from "../state/appState.js";
import { showToast } from "../utils/helpers.js";

export const authService = {
  handleAuth: async (isSignup, formData) => {
    try {
      const response = isSignup
        ? await authAPI.register(formData)
        : await authAPI.login(formData);

      const { user, access_token, refresh_token } = response.data;

      appState.setAccessToken(access_token);
      appState.setRefreshToken(refresh_token);
      appState.setUserInfo(user);
      appState.set("isAuthentication", "true");

      showToast("Đăng nhập thành công", "success");
      return { success: true, user };
    } catch (error) {
      const { details, message } = error.response?.data?.error || {};
      showToast(message || "Đăng nhập thất bại", "error");
      return { success: false, error: details || message };
    }
  },

  logout: async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      appState.clearAuth();
    }
  },

  getCurrentUser: async () => {
    const response = await authAPI.getCurrentUser();
    return response.data.user;
  },
};
