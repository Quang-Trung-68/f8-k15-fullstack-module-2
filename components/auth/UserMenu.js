// ============================================
// FILE: components/auth/UserMenu.js
// Copy this to: components/auth/UserMenu.js
// ============================================

import { authService } from "../../services/authService.js";
import { appState } from "../../state/appState.js";

export const UserMenu = (elements, onLogout) => {
  const toggle = () => elements.userDropdown.classList.toggle("show");
  const hide = () => elements.userDropdown.classList.remove("show");

  const updateUI = (user) => {
    if (user) {
      elements.userName.textContent = user.display_name || "";
      elements.actionButtons.style.display = "none";
      elements.userAvatar.style.display = "block";
    } else {
      elements.userName.textContent = "";
      elements.actionButtons.style.display = "flex";
      elements.userAvatar.style.display = "none";
    }
  };

  const loadUser = async () => {
    try {
      const user = await authService.getCurrentUser();
      updateUI(user);
    } catch (error) {
      updateUI(null);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    updateUI(null);
    hide();
    if (onLogout) await onLogout();
  };

  const init = () => {
    elements.userAvatar.addEventListener("click", (e) => {
      e.stopPropagation();
      toggle();
    });

    elements.logoutBtn.addEventListener("click", handleLogout);

    document.addEventListener("click", (e) => {
      if (
        !elements.userAvatar.contains(e.target) &&
        !elements.userDropdown.contains(e.target)
      ) {
        hide();
      }
    });

    if (appState.isAuthenticated()) {
      loadUser();
    }
  };

  return { init, loadUser, updateUI };
};
