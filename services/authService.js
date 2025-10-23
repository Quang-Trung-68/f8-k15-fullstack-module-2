// ============================================
// FILE: services/authService.js
// ============================================

import { authAPI } from "../api/endpoints.js";
import { appState } from "../state/appState.js";
import { showToast } from "../utils/helpers.js";
import { LoadingBar } from "../loadingBar.js";

export const authService = {
  handleAuth: async (isSignup, formData) => {
    try {
      LoadingBar.start();
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
    } finally {
      LoadingBar.finish();
    }
  },

  logout: async () => {
    try {
      LoadingBar.start();
      await authAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      appState.clearAuth();
      LoadingBar.finish();
    }
  },

  getCurrentUser: async () => {
    const response = await authAPI.getCurrentUser();
    return response.data.user;
  },
};
