// ============================================
// FILE: components/auth/AuthModal.js
// ============================================

import { authService } from "../../services/authService.js";

export const AuthModal = (elements, onAuthSuccess) => {
  const show = () => {
    elements.authModal.classList.add("show");
    document.body.style.overflow = "hidden";
  };

  const hide = () => {
    elements.authModal.classList.remove("show");
    document.body.style.overflow = "auto";
  };

  const showSignup = () => {
    elements.signupForm.style.display = "block";
    elements.loginForm.style.display = "none";
  };

  const showLogin = () => {
    elements.signupForm.style.display = "none";
    elements.loginForm.style.display = "block";
  };

  const handleSubmit = async (e, isSignup) => {
    e.preventDefault();

    const formData = isSignup
      ? {
          email: document.querySelector("#signupEmail").value,
          password: document.querySelector("#signupPassword").value,
          username: document.querySelector("#username").value,
          display_name: document.querySelector("#displayName").value,
        }
      : {
          email: document.querySelector("#loginEmail").value,
          password: document.querySelector("#loginPassword").value,
        };

    const result = await authService.handleAuth(isSignup, formData);

    if (result.success) {
      hide();
      if (onAuthSuccess) await onAuthSuccess(result.user);
      return result;
    }
  };

  const init = () => {
    // Clear general error when user starts typing
    const clearGeneralErrorOnInput = (formId) => {
      const form = document.getElementById(formId);
      if (!form) return;

      form.addEventListener("input", (e) => {
        if (e.target.classList.contains("form-input")) {
          const generalError = form.querySelector(".form-error-general");
          if (generalError) {
            generalError.classList.remove("show");
            generalError.style.display = "none";
          }

          // Also clear field-specific error
          const formGroup = e.target.closest(".form-group");
          if (formGroup) {
            formGroup.classList.remove("invalid");
          }
        }
      });
    };

    clearGeneralErrorOnInput("signupForm");
    clearGeneralErrorOnInput("loginForm");
    elements.signupBtn.addEventListener("click", () => {
      showSignup();
      show();
    });

    elements.loginBtn.addEventListener("click", () => {
      showLogin();
      show();
    });

    elements.modalClose.addEventListener("click", hide);
    elements.showLoginBtn.addEventListener("click", showLogin);
    elements.showSignupBtn.addEventListener("click", showSignup);

    elements.signupForm.addEventListener("submit", (e) =>
      handleSubmit(e, true)
    );
    elements.loginForm.addEventListener("submit", (e) =>
      handleSubmit(e, false)
    );

    elements.authModal.addEventListener("click", (e) => {
      if (e.target === elements.authModal) hide();
    });
  };

  return { init, show, hide, showLogin, showSignup };
};
