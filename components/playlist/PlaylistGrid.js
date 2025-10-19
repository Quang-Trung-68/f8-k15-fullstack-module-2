// ============================================
// FILE: components/playlist/PlaylistGrid.js
// Copy this to: components/playlist/PlaylistGrid.js
// ============================================

import { DEFAULT_IMAGE } from "../../utils/constants.js";

export const PlaylistGrid = () => {
  const render = (playlists) =>
    playlists
      .map(
        (playlist) => `
    <div title="${playlist.name}" data-id="${playlist.id}" class="hit-card">
      <div class="hit-card-cover">
        <img src="${playlist.image_url || DEFAULT_IMAGE}" 
             alt="${playlist.description}" />
        <button class="hit-play-btn">
          <i class="fas fa-play"></i>
        </button>
      </div>
      <div class="hit-card-info">
        <h3 class="hit-card-title">${playlist.name}</h3>
        <p class="hit-card-artist">${playlist.user_display_name}</p>
      </div>
    </div>
  `
      )
      .join("");

  return { render };
};
