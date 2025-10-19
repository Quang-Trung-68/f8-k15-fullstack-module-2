// ============================================
// FILE: components/playlist/PlaylistHero.js
// Copy this to: components/playlist/PlaylistHero.js
// ============================================

import { DEFAULT_IMAGE } from "../../utils/constants.js";

export const PlaylistHero = () => {
  const render = (playlist) => `
    <div class="hero-background">
      <img src="${playlist.image_url || DEFAULT_IMAGE}" 
           alt="${playlist.description}" 
           class="hero-image" />
      <div class="hero-overlay"></div>
    </div>
    <div class="hero-content" data-id="${playlist.id}">
      <div class="verified-badge">
        <span>Public playlist - ${playlist.description}</span>
      </div>
      <h1 class="artist-name">${playlist.name}</h1>
      <p class="monthly-listeners">1,021,833 monthly listeners</p>
      ${
        !playlist.is_owner
          ? `
        <button 
          title="${
            playlist.is_following ? "Unfollow playlist" : "Follow playlist"
          }" 
          class="follow-btn playlist-follow-btn" 
          data-following="${playlist.is_following}"
        >
          ${playlist.is_following ? "Unfollow" : "Follow"}
        </button>
      `
          : `
        <button type="button" class="owner-btn">Owner</button>
      `
      }
    </div>
  `;

  return { render };
};
