// ============================================
// FILE: components/auth/UserMenu.js
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
      elements.userMenuDiv.style.display = "flex";
    } else {
      elements.userName.textContent = "";
      elements.actionButtons.style.display = "flex";
      elements.userAvatar.style.display = "none";
      elements.userMenuDiv.style.display = "none";
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

    // HIỂN THỊ MESSAGE TRONG LIBRARY CONTENT KHI LOGOUT
    elements.libraryContent.innerHTML = `
      <div style="padding: 24px; text-align: center; color: #b3b3b3;">
        <i class="fas fa-music" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
        <p style="font-size: 16px; font-weight: 600; margin-bottom: 8px; color: #fff;">Login or Signup to enjoy your songs</p>
        <p style="font-size: 14px;">Create playlists and follow your favorite artists</p>
      </div>
    `;

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
