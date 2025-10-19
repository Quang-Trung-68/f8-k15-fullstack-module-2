// ============================================
// FILE: components/artist/ArtistHero.js
// Copy this to: components/artist/ArtistHero.js
// ============================================

import { DEFAULT_IMAGE } from "../../utils/constants.js";
import { formatNumber } from "../../utils/helpers.js";

export const ArtistHero = () => {
  const render = (artist) => `
    <div class="hero-background">
      <img src="${artist.image_url || DEFAULT_IMAGE}" 
           alt="${artist.name}" 
           class="hero-image" />
      <div class="hero-overlay"></div>
    </div>
    <div class="hero-content" data-id="${artist.id}">
      ${
        artist.is_verified
          ? `
        <div class="verified-badge">
          <i class="fas fa-check-circle"></i>
          <span>Verified Artist</span>
        </div>
      `
          : ""
      }
      <h1 class="artist-name">${artist.name}</h1>
      <p class="monthly-listeners">${formatNumber(
        artist.monthly_listeners
      )} monthly listeners</p>
      <button 
        title="${artist.is_following ? "Unfollow artist" : "Follow artist"}" 
        class="follow-btn artist-follow-btn" 
        data-following="${artist.is_following}"
      >
        ${artist.is_following ? "Unfollow" : "Follow"}
      </button>
    </div>
  `;

  return { render };
};
