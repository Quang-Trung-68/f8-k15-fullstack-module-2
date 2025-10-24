// ============================================
// FILE: components/track/TrackList.js - UPDATED
// ============================================

import { formatSeconds } from "../../utils/helpers.js";
import { appState } from "../../state/appState.js";

export const TrackList = () => {
  const render = (tracks, artistId = null, playlistId = null) => {
    if (!tracks || tracks.length === 0) {
      return `
        <h2 class="section-title">Popular</h2>
        <div class="track-list">No tracks available</div>
      `;
    }

    const currentIndex = appState.getCurrentIndex();
    const currentPlayingSourceId = appState.getCurrentPlayingSourceId();
    const currentPlayingSourceType = appState.getCurrentPlayingSourceType();
    const isPlaying = window.player && !window.player.audio.paused;

    // Determine if we're viewing the currently playing source
    const isCurrentSource =
      (playlistId &&
        currentPlayingSourceType === "playlist" &&
        String(currentPlayingSourceId) === String(playlistId)) ||
      (artistId &&
        currentPlayingSourceType === "artist" &&
        String(currentPlayingSourceId) === String(artistId));

    return `
      <h2 class="section-title">Popular</h2>
      <div class="track-list">
        ${tracks
          .map((track, index) => {
            // Only highlight if we're in the same source
            const isCurrentTrack = isCurrentSource && index === currentIndex;

            return `
          <div 
            title="${track.title || track.track_title}" 
            data-artist-id="${artistId || ""}" 
            data-playlist-id="${playlistId || ""}"
            data-index-song="${index}" 
            data-id="${track.track_id || track.id}" 
            class="track-item ${isCurrentTrack ? "playing" : ""}"
          >
            <div class="track-number">
              ${
                isCurrentTrack && isPlaying
                  ? '<i class="fas fa-pause playing-icon"></i>'
                  : isCurrentTrack && !isPlaying
                  ? '<i class="fas fa-play playing-icon"></i>'
                  : index + 1
              }
            </div>
            <div class="track-image">
              <img src="${track.image_url || track.track_image_url}" 
                   alt="${track.title || track.track_title}" 
                   onerror="this.src='./public/img/image.png'" />
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
        `;
          })
          .join("")}
      </div>
    `;
  };

  return { render };
};
