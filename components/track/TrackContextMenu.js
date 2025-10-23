// ============================================
// FILE: components/track/TrackContextMenu.js
// ============================================

import { playlistService } from "../../services/playlistService.js";
import { showToast } from "../../utils/helpers.js";

export const TrackContextMenu = (elements) => {
  let currentTrackId = null;
  let myPlaylists = [];
  let currentPlaylistId = null; // ID của playlist hiện tại

  const menu = document.createElement("div");
  menu.className = "track-context-menu";
  menu.style.cssText = `
    position: fixed;
    background: #282828;
    border-radius: 4px;
    padding: 4px;
    box-shadow: 0 16px 24px rgba(0,0,0,0.3), 0 6px 8px rgba(0,0,0,0.2);
    min-width: 200px;
    display: none;
    z-index: 1000;
    max-height: 400px;
    overflow-y: auto;
  `;
  document.body.appendChild(menu);

  const show = async (x, y, trackId, playlistId = null) => {
    currentTrackId = trackId;
    currentPlaylistId = playlistId;

    // Load my playlists
    try {
      myPlaylists = await playlistService.getMyPlaylists();
    } catch (error) {
      console.error("Error loading playlists:", error);
      showToast("Failed to load playlists", "error");
      return;
    }

    // Check track exists in each playlist
    const availablePlaylists = [];

    for (const playlist of myPlaylists) {
      // Skip current playlist
      if (playlist.id === currentPlaylistId) continue;

      // Check if track already in playlist
      try {
        const tracks = await playlistService.getTracks(playlist.id);
        const trackExists = tracks.some(
          (t) => String(t.track_id || t.id) === String(trackId)
        );

        if (!trackExists) {
          availablePlaylists.push(playlist);
        }
      } catch (error) {
        // If error, still show playlist
        availablePlaylists.push(playlist);
      }
    }

    // Build menu HTML
    menu.innerHTML = `
    ${
      currentPlaylistId
        ? `
        <div style="padding: 8px 12px; color: #b3b3b3; font-size: 11px; text-transform: uppercase; font-weight: 700;">
          Remove
        </div>
        <div class="track-context-menu-delete-from-playlist" 
             style="padding: 8px 12px; cursor: pointer; display: flex; align-items: center; gap: 8px; border-radius: 2px; color: #fff; border-top: 1px solid #282828; margin-top: 4px; margin-bottom: 4px;">
          <i class="fas fa-trash" style="color: #f87171;"></i>
          <span>Remove from playlist</span>
        </div> 
      `
        : ""
    }
      <div style="padding: 8px 12px; color: #b3b3b3; font-size: 11px; text-transform: uppercase; font-weight: 700;">
        Add
      </div>
      ${availablePlaylists
        .map(
          (playlist) => `
        <div class="track-context-menu-item" data-playlist-id="${playlist.id}" 
             style="padding: 8px 12px; cursor: pointer; display: flex; align-items: center; gap: 8px; border-radius: 2px;">
          <img src="${playlist.image_url}" 
               style="width: 32px; height: 32px; object-fit: cover; border-radius: 2px;" />
          <div style="flex: 1; overflow: hidden;">
            <div style="color: #fff; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${playlist.name}
            </div>
          </div>
        </div>
      `
        )
        .join("")}
      ${
        availablePlaylists.length === 0 && !currentPlaylistId
          ? '<div style="padding: 12px; color: #b3b3b3; font-size: 14px; text-align: center;">No available playlists</div>'
          : availablePlaylists.length === 0 && currentPlaylistId
          ? '<div style="padding: 12px; color: #b3b3b3; font-size: 14px; text-align: center;">Track already in all playlists</div>'
          : ""
      }
    `;

    // Position menu
    menu.style.display = "block";
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;

    // Adjust if menu goes off screen
    const rect = menu.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
      menu.style.left = `${window.innerWidth - rect.width - 10}px`;
    }
    if (rect.bottom > window.innerHeight) {
      menu.style.top = `${window.innerHeight - rect.height - 10}px`;
    }

    // Add hover effects for playlist items
    const items = menu.querySelectorAll(".track-context-menu-item");
    items.forEach((item) => {
      item.addEventListener("mouseenter", () => {
        item.style.backgroundColor = "#3e3e3e";
      });
      item.addEventListener("mouseleave", () => {
        item.style.backgroundColor = "transparent";
      });
      item.addEventListener("click", async () => {
        const playlistId = item.dataset.playlistId;
        await handleAddToPlaylist(playlistId);
      });
    });

    // Add hover effect and click handler for delete button
    const deleteBtn = menu.querySelector(
      ".track-context-menu-delete-from-playlist"
    );
    if (deleteBtn) {
      deleteBtn.addEventListener("mouseenter", () => {
        deleteBtn.style.backgroundColor = "#3e3e3e";
      });
      deleteBtn.addEventListener("mouseleave", () => {
        deleteBtn.style.backgroundColor = "transparent";
      });
      deleteBtn.addEventListener("click", async () => {
        await handleDeleteFromPlaylist();
      });
    }
  };

  const hide = () => {
    menu.style.display = "none";
    currentTrackId = null;
  };

  const handleAddToPlaylist = async (playlistId) => {
    if (!currentTrackId || !playlistId) return;

    try {
      await playlistService.addTrack(currentTrackId, playlistId);
      const playlist = myPlaylists.find((p) => p.id === playlistId);
      showToast(`Added to ${playlist?.name || "playlist"}`, "success");
      hide();
    } catch (error) {
      console.error("Error adding track:", error);
      showToast("Failed to add track to playlist", "error");
    }
  };

  const handleDeleteFromPlaylist = async () => {
    if (!currentTrackId || !currentPlaylistId) return;

    try {
      await playlistService.removeTrack(currentTrackId, currentPlaylistId);
      showToast("Removed from playlist", "success");
      hide();

      // Trigger refresh playlist
      if (window.onTrackRemovedFromPlaylist) {
        window.onTrackRemovedFromPlaylist(currentPlaylistId);
      }
    } catch (error) {
      console.error("Error removing track:", error);
      showToast("Failed to remove track from playlist", "error");
    }
  };

  const init = () => {
    // Hide on outside click
    document.addEventListener("click", (e) => {
      if (!menu.contains(e.target)) {
        hide();
      }
    });

    // Prevent default context menu
    document.addEventListener("contextmenu", (e) => {
      const trackItem = e.target.closest(".track-item");
      if (trackItem) {
        e.preventDefault();
      }
    });
  };

  // Style scrollbar
  menu.style.cssText += `
    ::-webkit-scrollbar {
      width: 8px;
    }
    ::-webkit-scrollbar-track {
      background: transparent;
    }
    ::-webkit-scrollbar-thumb {
      background: #535353;
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #606060;
    }
  `;

  return { init, show, hide };
};
