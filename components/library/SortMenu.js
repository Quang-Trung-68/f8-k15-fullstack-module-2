// ============================================
// FILE: components/library/SortMenu.js
// Copy this to: components/library/SortMenu.js
// ============================================

import { appState } from "../../state/appState.js";
import { SORT_TYPES, VIEW_MODES } from "../../utils/constants.js";

export const SortMenu = (elements, onSortChange, onViewChange) => {
  const toggle = () => elements.sortByTable.classList.toggle("show");
  const hide = () => elements.sortByTable.classList.remove("show");

  const updateButtonText = (text) => {
    const sortBtnText =
      elements.sortBtn.querySelector(".sort-btn-text") ||
      elements.sortBtn.firstChild;
    if (sortBtnText) {
      sortBtnText.textContent = text;
    }
  };

  const handleSortChange = async (sortType) => {
    appState.setSortType(sortType);
    updateButtonText(sortType);
    hide();

    if (onSortChange) await onSortChange(sortType);
  };

  const handleViewChange = (viewMode) => {
    appState.set("viewMode", viewMode);

    // Update icon in sort button
    const icons = {
      [VIEW_MODES.COMPACT_LIST]: "fa-list",
      [VIEW_MODES.DEFAULT_LIST]: "fa-list",
      [VIEW_MODES.COMPACT_GRID]: "fa-th",
      [VIEW_MODES.DEFAULT_GRID]: "fa-th-large",
    };

    const currentSort = appState.getSortType();
    elements.sortBtn.innerHTML = `${currentSort}<i class="fas ${icons[viewMode]}"></i>`;

    // Apply view mode classes
    const removeViewClasses = (selector) => {
      document.querySelectorAll(selector).forEach((el) => {
        el.classList.remove(
          "view-default-list",
          "view-compact-list",
          "view-compact-grid",
          "view-default-grid"
        );
      });
    };

    removeViewClasses(".item-image");
    removeViewClasses(".item-info");
    removeViewClasses(".library-content");
    removeViewClasses(".library-item");

    if (viewMode !== "default") {
      document.querySelectorAll(".item-image, .item-info").forEach((el) => {
        el.classList.add(`view-${viewMode}`);
      });
      document
        .querySelector(".library-content")
        ?.classList.add(`view-${viewMode}`);
      document.querySelectorAll(".library-item").forEach((el) => {
        el.classList.add(`view-${viewMode}`);
      });
    }

    hide();
    if (onViewChange) onViewChange(viewMode);
  };

  const init = () => {
    elements.sortBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggle();
    });

    // Sort options
    document.querySelectorAll(".sort-by-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const sortType = btn.dataset.sort;
        handleSortChange(sortType);
      });
    });

    // View mode options
    document.querySelectorAll(".view-mode-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const viewMode = btn.dataset.view;
        handleViewChange(viewMode);
      });
    });

    // Close on outside click
    document.addEventListener("click", (e) => {
      if (
        !elements.sortByTable.contains(e.target) &&
        !elements.sortBtn.contains(e.target)
      ) {
        hide();
      }
    });

    // Initialize button text
    updateButtonText(appState.getSortType());
  };

  return { init, toggle, hide };
};
