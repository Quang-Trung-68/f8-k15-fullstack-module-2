// ============================================
// FILE: components/library/LibraryContent.js
// ============================================

import { playlistService } from "../../services/playlistService.js";
import { DEFAULT_IMAGE } from "../../utils/constants.js";
import { appState } from "../../state/appState.js";

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
    // KIỂM TRA AUTH - NẾU CHƯA LOGIN THÌ HIỂN THỊ MESSAGE
    if (!appState.isAuthenticated()) {
      elements.libraryContent.innerHTML = `
        <div style="padding: 24px; text-align: center; color: #b3b3b3;">
          <i class="fas fa-music" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
          <p style="font-size: 16px; font-weight: 600; margin-bottom: 8px; color: #fff;">Login or Signup to enjoy your songs</p>
          <p style="font-size: 14px;">Create playlists and follow your favorite artists</p>
        </div>
      `;
      return;
    }

    // NẾU ĐÃ LOGIN THÌ HIỂN THỊ PLAYLISTS/ARTISTS
    const { playlists, artists } = await playlistService.getAllCombined(
      filterType,
      searchField,
      sortType
    );

    const playlistHtml = renderPlaylists(playlists);
    const artistHtml = renderArtists(artists);

    elements.libraryContent.innerHTML =
      filterType === "playlist"
        ? playlistHtml ||
          '<div style="padding: 24px; text-align: center; color: #b3b3b3;">No playlists found</div>'
        : filterType === "artist"
        ? artistHtml ||
          '<div style="padding: 24px; text-align: center; color: #b3b3b3;">No artists found</div>'
        : playlistHtml + artistHtml;
  };

  return { render };
};
