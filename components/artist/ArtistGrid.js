// ============================================
// FILE: components/artist/ArtistGrid.js
// Copy this to: components/artist/ArtistGrid.js
// ============================================

import { DEFAULT_IMAGE } from "../../utils/constants.js";

export const ArtistGrid = () => {
  const render = (artists) =>
    artists
      .map(
        (artist) => `
    <div title="${artist.name}" data-id="${artist.id}" class="artist-card">
      <div class="artist-card-cover">
        <img src="${artist.image_url || DEFAULT_IMAGE}" alt="${artist.bio}" />
        <button class="artist-play-btn">
          <i class="fas fa-play"></i>
        </button>
      </div>
      <div class="artist-card-info">
        <h3 class="artist-card-name">${artist.name}</h3>
        <p class="artist-card-type">${artist.bio}</p>
      </div>
    </div>
  `
      )
      .join("");

  return { render };
};
