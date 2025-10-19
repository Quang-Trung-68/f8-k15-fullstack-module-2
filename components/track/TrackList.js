// ============================================
// FILE: components/track/TrackList.js
// Copy this to: components/track/TrackList.js
// ============================================

import { formatSeconds } from "../../utils/helpers.js";
import { appState } from "../../state/appState.js";

export const TrackList = () => {
  const render = (tracks, artistId = null) => {
    if (!tracks || tracks.length === 0) {
      return `
        <h2 class="section-title">Popular</h2>
        <div class="track-list">No tracks available</div>
      `;
    }

    const currentIndex = appState.getCurrentIndex();

    return `
      <h2 class="section-title">Popular</h2>
      <div class="track-list">
        ${tracks
          .map(
            (track, index) => `
          <div 
            title="${track.title || track.track_title}" 
            data-artist-id="${artistId || ""}" 
            data-index-song="${index}" 
            data-id="${track.track_id || track.id}" 
            class="track-item ${index === currentIndex ? "playing" : ""}"
          >
            <div class="track-number">${index + 1}</div>
            <div class="track-image">
              <img src="${track.image_url || track.track_image_url}" 
                   alt="${track.title || track.track_title}" />
            </div>
            <div class="track-info">
              <div class="track-name">${track.title || track.track_title}</div>
            </div>
            <div class="track-plays">${
              track.play_count || track.track_play_count || 0
            }</div>
            <div title="${
              track.is_liked ? "Dislike" : "Like"
            }" class="track-is-liked">
              ${track.is_liked ? "💚" : "🩶"}
            </div>
            <div class="track-duration">${formatSeconds(
              track.duration || track.track_duration
            )}</div>
            <button class="track-menu-btn">
              <i class="fas fa-ellipsis-h"></i>
            </button>
          </div>
        `
          )
          .join("")}
      </div>
    `;
  };

  return { render };
};
