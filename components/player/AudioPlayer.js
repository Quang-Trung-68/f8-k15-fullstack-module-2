// ============================================
// FILE: components/player/AudioPlayer.js
// ============================================

import { appState } from "../../state/appState.js";
import { formatTime } from "../../utils/helpers.js";
import { DEFAULT_IMAGE } from "../../utils/constants.js";

export const AudioPlayer = (elements) => {
  const player = {
    audio: document.querySelector(".player-audio"),
    playerImage: document.querySelector(".player-image"),
    playerTitle: document.querySelector(".player-title"),
    playerArtist: document.querySelector(".player-artist"),

    shuffleBtn: document.querySelector(".control-btn:has(.fa-random)"),
    prevBtn: document.querySelector(".control-btn:has(.fa-step-backward)"),
    playBtn: document.querySelector(".play-btn"),
    nextBtn: document.querySelector(".control-btn:has(.fa-step-forward)"),
    repeatBtn: document.querySelector(".control-btn:has(.fa-redo)"),

    currentTimeEl: document.querySelector(
      ".progress-container .time:first-child"
    ),
    totalTimeEl: document.querySelector(".progress-container .time:last-child"),
    progressBar: document.querySelector(".progress-bar"),
    progressFill: document.querySelector(".progress-fill"),
    progressHandle: document.querySelector(".progress-handle"),

    volumeBtn: document.querySelector(".control-btn:has(.fa-volume-down)"),
    volumeBar: document.querySelector(".volume-bar"),
    volumeFill: document.querySelector(".volume-fill"),
    volumeHandle: document.querySelector(".volume-handle"),

    songs: [],
    currentIndex: 0,
    isRepeat: false,
    isShuffle: false,
    isScrolling: false,
    isTransitioning: false,
    historySong: [],
    onTrackChange: null, // Callback when track changes

    async safePlay() {
      if (this.isTransitioning) return;

      try {
        this.isTransitioning = true;
        this.audio.pause();
        await new Promise((resolve) => setTimeout(resolve, 10));

        if (this.audio.src && this.audio.readyState >= 2) {
          await this.audio.play();
        }
      } catch (error) {
        console.warn("Play interrupted:", error.name);
        if (error.name === "AbortError") {
          setTimeout(() => {
            if (!this.audio.paused) return;
            this.audio.play().catch((e) => console.warn("Retry failed:", e));
          }, 100);
        }
      } finally {
        this.isTransitioning = false;
      }
    },

    safePause() {
      if (this.isTransitioning) return;

      try {
        this.isTransitioning = true;
        this.audio.pause();
      } finally {
        setTimeout(() => (this.isTransitioning = false), 50);
      }
    },

    loadFromStorage() {
      const tracks = appState.getCurrentTracks();
      const index = appState.getCurrentIndex();

      if (tracks.length > 0) {
        this.songs = tracks.map((track) => ({
          id: track.id || track.track_id,
          name: track.title || track.track_title,
          path: track.audio_url || track.track_audio_url,
          artist: track.artist_name || track.track_artist_name,
          pathThumb:
            track.image_url || track.album_cover_image_url || DEFAULT_IMAGE,
          duration: track.duration || track.track_duration,
        }));

        this.currentIndex = Math.min(index, this.songs.length - 1);
        this.loadCurrentSong();
      }
    },

    getCurrentSong() {
      return this.songs[this.currentIndex];
    },

    loadCurrentSong() {
      if (this.songs.length === 0) return;

      const song = this.getCurrentSong();
      this.playerTitle.textContent = song.name;
      this.playerArtist.textContent = song.artist;
      this.playerImage.src = song.pathThumb;
      this.audio.src = song.path;
      this.audio.load();

      // Update document title
      document.title = `${song.name}`;
    },

    async loadNewPlaylist(tracks, artistId = null) {
      this.safePause();
      this.audio.src = "";

      this.songs = tracks.map((track) => ({
        id: track.id || track.track_id,
        name: track.title || track.track_title,
        path: track.audio_url || track.track_audio_url,
        artist: track.artist_name || track.track_artist_name,
        pathThumb:
          track.image_url || track.album_cover_image_url || DEFAULT_IMAGE,
        duration: track.duration || track.track_duration,
      }));

      this.currentIndex = 0;
      this.historySong = [];

      appState.setCurrentIndex(0);
      appState.setCurrentTracks(tracks);
      if (artistId) appState.setCurrentArtistId(artistId);

      if (this.songs.length > 0) this.loadCurrentSong();
    },

    getRandomSong() {
      if (this.historySong.length === this.songs.length) {
        this.historySong = [];
      }

      let index;
      do {
        index = Math.floor(Math.random() * this.songs.length);
      } while (this.historySong.includes(index) && this.songs.length > 1);

      return index;
    },

    async changeIndexSong(step) {
      if (this.songs.length === 0 || this.isTransitioning) return;

      this.safePause();

      if (!this.isShuffle) {
        this.currentIndex =
          (this.currentIndex + step + this.songs.length) % this.songs.length;
      } else {
        this.currentIndex = this.getRandomSong();
      }

      this.historySong.push(this.currentIndex);
      appState.setCurrentIndex(this.currentIndex);

      this.loadCurrentSong();
      setTimeout(() => this.safePlay(), 200);

      // Trigger callback if defined
      if (this.onTrackChange) {
        this.onTrackChange(this.currentIndex);
      }
    },

    updateProgress() {
      if (!this.isScrolling && this.audio.duration) {
        const percent = (this.audio.currentTime / this.audio.duration) * 100;
        this.progressFill.style.width = percent + "%";
        this.currentTimeEl.textContent = formatTime(this.audio.currentTime);
      }
    },

    setupProgressBar() {
      this.progressBar.addEventListener("click", (e) => {
        if (!this.audio.duration) return;
        const rect = this.progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        this.audio.currentTime = percent * this.audio.duration;
      });

      let isDragging = false;

      this.progressHandle.addEventListener("mousedown", (e) => {
        isDragging = true;
        this.isScrolling = true;
        e.preventDefault();
      });

      document.addEventListener("mousemove", (e) => {
        if (!isDragging || !this.audio.duration) return;

        const rect = this.progressBar.getBoundingClientRect();
        let percent = (e.clientX - rect.left) / rect.width;
        percent = Math.max(0, Math.min(1, percent));

        this.progressFill.style.width = percent * 100 + "%";
        this.currentTimeEl.textContent = formatTime(
          percent * this.audio.duration
        );
      });

      document.addEventListener("mouseup", (e) => {
        if (isDragging) {
          const rect = this.progressBar.getBoundingClientRect();
          let percent = (e.clientX - rect.left) / rect.width;
          percent = Math.max(0, Math.min(1, percent));

          this.audio.currentTime = percent * this.audio.duration;
          isDragging = false;
          this.isScrolling = false;
        }
      });
    },

    setupVolumeBar() {
      const updateVolume = () => {
        const percent = this.audio.volume * 100;
        this.volumeFill.style.width = percent + "%";
      };

      this.volumeBar.addEventListener("click", (e) => {
        const rect = this.volumeBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        this.audio.volume = Math.max(0, Math.min(1, percent));
        updateVolume();
      });

      let isDragging = false;

      this.volumeHandle.addEventListener("mousedown", (e) => {
        isDragging = true;
        e.preventDefault();
      });

      document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;

        const rect = this.volumeBar.getBoundingClientRect();
        let percent = (e.clientX - rect.left) / rect.width;
        percent = Math.max(0, Math.min(1, percent));

        this.audio.volume = percent;
        updateVolume();
      });

      document.addEventListener("mouseup", () => {
        isDragging = false;
      });

      this.volumeBtn.addEventListener("click", () => {
        this.audio.volume = this.audio.volume > 0 ? 0 : 0.7;
        updateVolume();
      });

      updateVolume();
    },

    setTrackChangeCallback(callback) {
      this.onTrackChange = callback;
    },

    init() {
      this.loadFromStorage();

      // Play/Pause
      this.playBtn.addEventListener("click", async () => {
        if (this.songs.length === 0) return;
        this.audio.paused ? await this.safePlay() : this.safePause();
      });

      // Audio events
      this.audio.addEventListener("play", () => {
        const icon = this.playBtn.querySelector("i");
        icon.classList.remove("fa-play");
        icon.classList.add("fa-pause");
      });

      this.audio.addEventListener("pause", () => {
        const icon = this.playBtn.querySelector("i");
        icon.classList.remove("fa-pause");
        icon.classList.add("fa-play");
      });

      this.audio.addEventListener("loadedmetadata", () => {
        this.totalTimeEl.textContent = formatTime(this.audio.duration);
      });

      this.audio.addEventListener("timeupdate", () => this.updateProgress());

      this.audio.addEventListener("ended", async () => {
        if (this.isRepeat) {
          await this.safePlay();
        } else {
          await this.changeIndexSong(1);
        }
      });

      // Controls
      this.nextBtn.addEventListener("click", () => this.changeIndexSong(1));
      this.prevBtn.addEventListener("click", () => {
        if (this.audio.currentTime < 2) {
          this.changeIndexSong(-1);
        } else {
          this.audio.currentTime = 0;
        }
      });

      // Repeat
      this.isRepeat = appState.get("isRepeat") === "true";
      this.repeatBtn.classList.toggle("active", this.isRepeat);
      this.repeatBtn.addEventListener("click", () => {
        this.isRepeat = !this.isRepeat;
        appState.set("isRepeat", this.isRepeat);
        this.repeatBtn.classList.toggle("active", this.isRepeat);
      });

      // Shuffle
      this.isShuffle = appState.get("isShuffle") === "true";
      this.shuffleBtn.classList.toggle("active", this.isShuffle);
      this.shuffleBtn.addEventListener("click", () => {
        this.isShuffle = !this.isShuffle;
        appState.set("isShuffle", this.isShuffle);
        this.shuffleBtn.classList.toggle("active", this.isShuffle);
      });

      // Keyboard shortcuts
      document.addEventListener("keydown", async (e) => {
        if (this.songs.length === 0) return;

        const isInputFocused =
          document.activeElement &&
          (document.activeElement.tagName === "INPUT" ||
            document.activeElement.tagName === "TEXTAREA");

        if (e.code === "Space" && !isInputFocused) {
          e.preventDefault();
          this.audio.paused ? await this.safePlay() : this.safePause();
        }
        if (e.code === "ArrowRight" && !isInputFocused) {
          e.preventDefault();
          await this.changeIndexSong(1);
        }
        if (e.code === "ArrowLeft" && !isInputFocused) {
          e.preventDefault();
          await this.changeIndexSong(-1);
        }
      });

      this.audio.addEventListener("play", () => {
        const icon = this.playBtn.querySelector("i");
        icon.classList.remove("fa-play");
        icon.classList.add("fa-pause");

        // Đồng bộ large play button
        const largeBtn = document.querySelector(".play-btn-large");
        if (largeBtn) {
          const largeIcon = largeBtn.querySelector("i");
          largeIcon.classList.remove("fa-play");
          largeIcon.classList.add("fa-pause");
        }
      });

      this.audio.addEventListener("pause", () => {
        const icon = this.playBtn.querySelector("i");
        icon.classList.remove("fa-pause");
        icon.classList.add("fa-play");

        // Đồng bộ large play button
        const largeBtn = document.querySelector(".play-btn-large");
        if (largeBtn) {
          const largeIcon = largeBtn.querySelector("i");
          largeIcon.classList.remove("fa-pause");
          largeIcon.classList.add("fa-play");
        }
      });

      this.setupProgressBar();
      this.setupVolumeBar();
    },
  };

  player.init();
  return player;
};
