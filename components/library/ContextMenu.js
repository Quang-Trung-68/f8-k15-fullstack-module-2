// ============================================
// FILE: components/library/ContextMenu.js
// ============================================

export const ContextMenu = (elements, handlers) => {
  let currentItemId = null;
  let currentItemType = null;

  const show = (x, y, itemId, itemType) => {
    hide();
    currentItemId = itemId;
    currentItemType = itemType;

    const menu =
      itemType === "playlist" ? elements.menuPlaylist : elements.menuArtist;
    if (menu) {
      menu.style.display = "block";
      menu.style.left = `${x}px`;
      menu.style.top = `${y}px`;
    }
  };

  const hide = () => {
    elements.menuPlaylist.style.display = "none";
    elements.menuArtist.style.display = "none";
  };

  const handleAction = async (action) => {
    if (!currentItemId || !handlers[action]) return;

    await handlers[action](currentItemId, currentItemType);
    hide();
  };

  const init = () => {
    // Playlist menu actions
    elements.menuPlaylist.addEventListener("click", async (e) => {
      if (e.target.closest(".context-menu-remove")) {
        await handleAction("remove");
      } else if (e.target.closest(".context-menu-delete")) {
        await handleAction("delete");
      }
    });

    // Artist menu actions
    elements.menuArtist.addEventListener("click", async (e) => {
      if (e.target.closest(".context-menu-unfollow")) {
        await handleAction("unfollow");
      }
    });

    // Hide on outside click
    document.addEventListener("click", hide);
  };

  const attachToItems = () => {
    document.querySelectorAll(".library-item").forEach((item) => {
      item.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        const itemId = item.dataset.id;
        const itemType = item.classList.contains("library-item-playlist")
          ? "playlist"
          : "artist";
        show(e.pageX, e.pageY, itemId, itemType);
      });
    });
  };

  return { init, show, hide, attachToItems };
};
