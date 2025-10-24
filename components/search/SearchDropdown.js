// ============================================
// FILE: components/search/SearchDropdown.js
// ============================================

import { searchService } from "../../services/searchService.js";
import { debounce } from "../../utils/helpers.js";
import { SEARCH_DELAY, DEFAULT_IMAGE } from "../../utils/constants.js";

export const SearchDropdown = (elements, callbacks) => {
  let currentResults = { tracks: [], playlists: [], artists: [] };
  let isSearching = false;

  // Create dropdown element
  const dropdown = document.createElement("div");
  dropdown.className = "search-dropdown";
  dropdown.style.display = "none";

  const renderTracks = (tracks) => {
    if (tracks.length === 0) return "";

    return `
      <div class="search-section">
        <div class="search-section-title">Tracks</div>
        <div class="search-results">
          ${tracks
            .map(
              (track) => `
            <div class="search-result-item" data-type="track" data-id="${
              track.id
            }">
              <img src="${track.image_url || DEFAULT_IMAGE}" alt="${
                track.title
              }" class="search-result-image" />
              <div class="search-result-info">
                <div class="search-result-title">${track.title}</div>
                <div class="search-result-subtitle">${track.subtitle}</div>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    `;
  };

  const renderPlaylists = (playlists) => {
    if (playlists.length === 0) return "";

    return `
      <div class="search-section">
        <div class="search-section-title">Playlists</div>
        <div class="search-results">
          ${playlists
            .map(
              (playlist) => `
            <div class="search-result-item" data-type="playlist" data-id="${
              playlist.id
            }">
              <img src="${playlist.image_url || DEFAULT_IMAGE}" alt="${
                playlist.title
              }" class="search-result-image" />
              <div class="search-result-info">
                <div class="search-result-title">${playlist.title}</div>
                <div class="search-result-subtitle">${playlist.subtitle}</div>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    `;
  };

  const renderArtists = (artists) => {
    if (artists.length === 0) return "";

    return `
      <div class="search-section">
        <div class="search-section-title">Artists</div>
        <div class="search-results">
          ${artists
            .map(
              (artist) => `
            <div class="search-result-item" data-type="artist" data-id="${
              artist.id
            }">
              <img src="${artist.image_url || DEFAULT_IMAGE}" alt="${
                artist.title
              }" class="search-result-image artist-image" />
              <div class="search-result-info">
                <div class="search-result-title">${artist.title}</div>
                <div class="search-result-subtitle">${artist.subtitle}</div>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    `;
  };

  const render = (results) => {
    currentResults = results;

    const tracksHtml = renderTracks(results.tracks);
    const playlistsHtml = renderPlaylists(results.playlists);
    const artistsHtml = renderArtists(results.artists);

    if (!tracksHtml && !playlistsHtml && !artistsHtml) {
      dropdown.innerHTML = `
        <div class="search-no-results">
          <i class="fas fa-search"></i>
          <p>No results found</p>
        </div>
      `;
    } else {
      dropdown.innerHTML = tracksHtml + playlistsHtml + artistsHtml;
    }
  };

  const show = () => {
    dropdown.style.display = "block";
  };

  const hide = () => {
    dropdown.style.display = "none";
  };

  const handleSearch = debounce(async (searchTerm) => {
    if (!searchTerm || searchTerm.trim().length === 0) {
      hide();
      return;
    }

    try {
      const [tracks, playlists, artists] = await Promise.all([
        searchService.searchTracks(searchTerm),
        searchService.searchPlaylists(searchTerm),
        searchService.searchArtists(searchTerm),
      ]);

      render({ tracks, playlists, artists });
      show();
    } catch (error) {
      console.error("Search error:", error);
      hide();
    }
  }, SEARCH_DELAY);

  const init = () => {
    // Insert dropdown after search input
    const searchWrapper = elements.searchInput.closest(".search-input-wrapper");
    if (searchWrapper) {
      searchWrapper.appendChild(dropdown);
      searchWrapper.style.position = "relative";
    }

    // Handle input changes
    elements.searchInput.addEventListener("input", (e) => {
      handleSearch(e.target.value);
    });

    // Handle click on search results
    dropdown.addEventListener("click", (e) => {
      const resultItem = e.target.closest(".search-result-item");
      if (!resultItem) return;

      const type = resultItem.dataset.type;
      const id = resultItem.dataset.id;

      hide();
      elements.searchInput.value = "";

      if (callbacks && callbacks[type]) {
        callbacks[type](id);
      }
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (!searchWrapper.contains(e.target)) {
        hide();
      }
    });

    // Close dropdown on ESC key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        hide();
      }
    });
  };

  return { init, show, hide, handleSearch };
};
