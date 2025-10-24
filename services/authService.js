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

      // Clear old errors trước khi submit
      clearFormErrors(isSignup);

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
      const { details, message, code } = error.response?.data?.error || {};

      // Nếu có validation errors (lỗi từng field)
      if (code === "VALIDATION_ERROR" && details && Array.isArray(details)) {
        displayValidationErrors(details, isSignup);
        showToast("Please check the form fields", "error");
      }
      // Nếu là lỗi tổng quát (email exists, invalid credentials, etc.)
      else if (message) {
        displayGeneralError(message, code, isSignup);
        // Vẫn giữ toast cho consistency
        showToast(getToastMessage(code, message), "error");
      }
      // Fallback nếu không có message
      else {
        displayGeneralError(
          "An error occurred. Please try again.",
          null,
          isSignup
        );
        showToast("Đăng nhập thất bại", "error");
      }

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

// Helper function: Clear tất cả errors
const clearFormErrors = (isSignup) => {
  const formPrefix = isSignup ? "signup" : "login";
  const form = document.getElementById(`${formPrefix}Form`);

  if (!form) return;

  // Clear general error
  const generalError = form.querySelector(".form-error-general");
  if (generalError) {
    generalError.classList.remove("show");
    generalError.style.display = "none";
  }

  // Clear all form-groups invalid state
  const formGroups = form.querySelectorAll(".form-group");
  formGroups.forEach((group) => {
    group.classList.remove("invalid");
  });
};

// Helper function: Display general error message
const displayGeneralError = (message, code, isSignup) => {
  const formPrefix = isSignup ? "signup" : "login";
  const form = document.getElementById(`${formPrefix}Form`);

  if (!form) return;

  const generalError = form.querySelector(".form-error-general");
  const generalErrorMessage = form.querySelector(".form-error-general-message");

  if (!generalError || !generalErrorMessage) return;

  // Customize message based on error code
  let displayMessage = message;

  if (code === "INVALID_CREDENTIALS") {
    displayMessage = "Invalid email or password. Please try again.";
  } else if (code === "EMAIL_EXISTS") {
    displayMessage =
      "This email is already registered. Please log in or use a different email.";
  } else if (code === "USER_NOT_FOUND") {
    displayMessage = "No account found with this email. Please sign up first.";
  } else if (code === "ACCOUNT_LOCKED") {
    displayMessage = "Your account has been locked. Please contact support.";
  }

  generalErrorMessage.textContent = displayMessage;
  generalError.classList.add("show");
  generalError.style.display = "flex";

  // Auto scroll to error (optional)
  generalError.scrollIntoView({ behavior: "smooth", block: "nearest" });
};

// Helper function: Get toast message based on error code
const getToastMessage = (code, defaultMessage) => {
  const messages = {
    INVALID_CREDENTIALS: "Invalid credentials",
    EMAIL_EXISTS: "Email already exists",
    USER_NOT_FOUND: "User not found",
    ACCOUNT_LOCKED: "Account locked",
    VALIDATION_ERROR: "Validation failed",
  };

  return messages[code] || defaultMessage || "An error occurred";
};

// Helper function: Display validation errors
const displayValidationErrors = (details, isSignup) => {
  const formPrefix = isSignup ? "signup" : "login";

  // Map field names to form group selectors
  const fieldMap = {
    username: "username",
    display_name: "displayName",
    email: `${formPrefix}Email`,
    password: `${formPrefix}Password`,
  };

  details.forEach((error) => {
    const field = error.field;
    const message = error.message;

    // Get mapped input ID
    const inputId = fieldMap[field];
    if (!inputId) return;

    // Find input element
    const inputEl = document.getElementById(inputId);
    if (!inputEl) return;

    // Find parent form-group
    const formGroup = inputEl.closest(".form-group");
    if (!formGroup) return;

    // Add invalid class
    formGroup.classList.add("invalid");

    // Update error message span
    const errorSpan = formGroup.querySelector(".error-message span");
    if (errorSpan) {
      // Clean up message: remove quotes and field name
      let cleanMessage = message.replace(/"/g, "");

      // Customize messages
      if (field === "email") {
        cleanMessage = "Please enter a valid email address";
      } else if (field === "password") {
        if (cleanMessage.includes("at least")) {
          cleanMessage = "Password must be at least 8 characters";
        } else if (cleanMessage.includes("empty")) {
          cleanMessage = "Please enter your password";
        }
      } else if (field === "username") {
        if (cleanMessage.includes("empty")) {
          cleanMessage = "Please enter a username";
        } else {
          cleanMessage = "Please enter a valid username";
        }
      } else if (field === "display_name") {
        if (cleanMessage.includes("empty")) {
          cleanMessage = "Please enter a display name";
        } else {
          cleanMessage = "Please enter a valid display name";
        }
      }

      errorSpan.textContent = cleanMessage;
    }
  });
};
