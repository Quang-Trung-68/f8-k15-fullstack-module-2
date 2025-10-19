// ============================================
// FILE: components/library/LibraryContent.js
// Copy this to: components/library/LibraryContent.js
// ============================================

import { playlistService } from "../../services/playlistService.js";
import { DEFAULT_IMAGE } from "../../utils/constants.js";

export const LibraryContent = (elements) => {
  const renderPlaylists = (playlists) =>
    playlists
      .map(
        (p) => `
    <div title="${p.name}" data-id="${
          p.id
        }" class="library-item library-item-playlist">
      <img src="${p.image_url || DEFAULT_IMAGE}" alt="${
          p.name
        }" class="item-image" />
      <div class="item-info">
        <div class="item-title">${p.name}</div>
        <div class="item-subtitle">Playlist • ${p.user_display_name}</div>
      </div>
    </div>
  `
      )
      .join("");

  const renderArtists = (artists) =>
    artists
      .map(
        (a) => `
    <div title="${a.name}" data-id="${
          a.id
        }" class="library-item library-item-artist">
      <img src="${a.image_url || DEFAULT_IMAGE}" alt="${
          a.name
        }" class="item-image" />
      <div class="item-info">
        <div class="item-title">${a.name}</div>
        <div class="item-subtitle">Artist</div>
      </div>
    </div>
  `
      )
      .join("");

  const render = async (filterType, searchField = null, sortType = null) => {
    const { playlists, artists } = await playlistService.getAllCombined(
      filterType,
      searchField,
      sortType
    );

    const playlistHtml = renderPlaylists(playlists);
    const artistHtml = renderArtists(artists);

    elements.libraryContent.innerHTML =
      filterType === "playlist"
        ? playlistHtml
        : filterType === "artist"
        ? artistHtml
        : playlistHtml + artistHtml;
  };

  return { render };
};
