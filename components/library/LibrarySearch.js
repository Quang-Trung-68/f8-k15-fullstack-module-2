// ============================================
// FILE: components/library/LibrarySearch.js
// ============================================

import { debounce } from "../../utils/helpers.js";
import { SEARCH_DELAY } from "../../utils/constants.js";

export const LibrarySearch = (elements, onSearch) => {
  const toggle = () => {
    elements.searchLibraryInput.classList.toggle("show");
    if (elements.searchLibraryInput.classList.contains("show")) {
      elements.searchLibraryInput.focus();
    }
  };

  const handleSearch = debounce(async () => {
    const value = elements.searchLibraryInput.value;
    if (onSearch) await onSearch(value);
  }, SEARCH_DELAY);

  const init = () => {
    elements.searchLibraryBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggle();
    });

    elements.searchLibraryInput.addEventListener("input", handleSearch);

    document.addEventListener("click", (e) => {
      if (
        !elements.searchLibraryInput.contains(e.target) &&
        !elements.searchLibraryBtn.contains(e.target)
      ) {
        elements.searchLibraryInput.classList.remove("show");
      }
    });
  };

  return { init, toggle };
};
