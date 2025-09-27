// Import các API functions
import {
  registerApi,
  loginApi,
  getCurrentUser,
  getAllPlaylists,
  getAllArtists,
  getPlaylistById,
  getArtistById,
  getTrackByPlaylist,
  getArtistPopularTracks,
  followPlaylist,
  unfollowPlaylist,
  createPlaylist,
  uploadPlaylistCover,
  updatePlaylist,
  followArtist,
  unfollowArtist,
  getMyPlaylists,
  deletePlaylist,
} from "./api/main.js";

// Utility functions
const formatSeconds = (seconds) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const m = String(mins).padStart(2, "0");
  const s = String(secs).padStart(2, "0");
  return hrs > 0 ? `${hrs}:${m}:${s}` : `${mins}:${s}`;
};

const formatNumber = (num) =>
  num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

const renderMyPlaylists = async (libraryContent) => {
  const { playlists } = await getMyPlaylists();
  const libraryContentHtml = playlists
    .map(
      (playlist) => `
      <div data-id=${playlist.id} class="library-item library-item-playlist">
        <img src="${
          playlist.image_url !== null ? playlist.image_url : ""
        }" alt="${playlist.name}" class="item-image" />
        <div class="item-info">
          <div class="item-title">${playlist.name}</div>
          <div class="item-subtitle">Playlist</div>
        </div>
      </div>
    `
    )
    .join("");
  libraryContent.innerHTML = libraryContentHtml;
};

// Main application
document.addEventListener("DOMContentLoaded", async () => {
  // DOM Elements
  const elements = {
    // Auth elements
    signupBtn: document.querySelector(".signup-btn"),
    loginBtn: document.querySelector(".login-btn"),
    authModal: document.getElementById("authModal"),
    modalClose: document.getElementById("modalClose"),
    signupForm: document.getElementById("signupForm"),
    loginForm: document.getElementById("loginForm"),
    showLoginBtn: document.getElementById("showLogin"),
    showSignupBtn: document.getElementById("showSignup"),
    actionButtons: document.querySelector(".auth-buttons"),

    // User elements
    userAvatar: document.getElementById("userAvatar"),
    userDropdown: document.getElementById("userDropdown"),
    logoutBtn: document.getElementById("logoutBtn"),
    userName: document.querySelector(".user-name"),

    // Library elements
    sortBtn: document.querySelector(".sort-btn"),
    sortByTable: document.querySelector(".sort-by-table"),
    searchLibraryBtn: document.querySelector(".search-library-btn"),
    searchLibraryInput: document.querySelector(".search-library-input"),
    navTabPlaylists: document.querySelector(".nav-tab-playlists"),
    navTabArtists: document.querySelector(".nav-tab-artists"),
    libraryContent: document.querySelector(".library-content"),

    // Context menu elements
    menuPlaylist: document.getElementById("menuPlaylist"),
    menuArtist: document.getElementById("menuArtist"),

    // Main content elements
    hitsSection: document.querySelector(".hits-section"),
    artistsSection: document.querySelector(".artists-section"),
    artistHero: document.querySelector(".artist-hero"),
    artistControls: document.querySelector(".artist-controls"),
    popularSection: document.querySelector(".popular-section"),
    createPlaylistSection: document.querySelector(".create-playlist"),
    createPlaylistBtn: document.querySelector(".create-btn"),
    hitsGrid: document.querySelector(".hits-grid"),
    artistsGrid: document.querySelector(".artists-grid"),
    logoIcon: document.querySelector(".fa-spotify"),
    homeButton: document.querySelector(".home-btn"),
    trackItems: document.querySelectorAll(".track-item"),
    // Playlist modal elements
    overlay: document.querySelector(".overlay"),
    modal: document.querySelector(".modal"),
    modalCloseBtn: document.querySelector(".modal-close"),
    playlistTitle: document.querySelector(".playlist-title"),
    playlistImage: document.querySelector(".playlist-cover"),
    playlistName: document.querySelector(".playlist-name"),
    playlistDesc: document.querySelector(".playlist-desc"),
    fileInputPlaylistCover: document.querySelector("#fileInputPlaylistCover"),
    coverPreviewImage: document.querySelector(".cover-preview-image"),
    playlistCoverImage: document.querySelector(".playlist-cover-image"),
    saveBtn: document.querySelector(".btn-save"),
  };

  // State variables
  let sortByPlaylist = localStorage.getItem("sortByPlaylist");
  let currentPlaylistIdSideBar = null;
  let urlPlaylistCoverImage = null;

  // UI Helper functions
  const showAuthModal = () => {
    elements.authModal.classList.add("show");
    document.body.style.overflow = "hidden";
  };

  const hideAuthModal = () => {
    elements.authModal.classList.remove("show");
    document.body.style.overflow = "auto";
  };

  const showSignupForm = () => {
    elements.signupForm.style.display = "block";
    elements.loginForm.style.display = "none";
  };

  const showLoginForm = () => {
    elements.signupForm.style.display = "none";
    elements.loginForm.style.display = "block";
  };

  const toggleUserDropdown = () =>
    elements.userDropdown.classList.toggle("show");
  const hideUserDropdown = () => elements.userDropdown.classList.remove("show");

  const toggleSearchInput = () => {
    elements.searchLibraryInput.classList.toggle("show");
    if (elements.searchLibraryInput.classList.contains("show")) {
      elements.searchLibraryInput.focus();
    }
  };

  const toggleSortTable = () => elements.sortByTable.classList.toggle("show");

  const hideMenus = () => {
    elements.menuPlaylist.style.display = "none";
    elements.menuArtist.style.display = "none";
  };

  const showUIPopular = (isShow) => {
    const method = isShow ? "add" : "remove";
    elements.hitsSection.classList[isShow ? "add" : "remove"]("hidden");
    elements.artistsSection.classList[isShow ? "add" : "remove"]("hidden");
    elements.artistHero.classList[isShow ? "add" : "remove"]("show");
    elements.artistControls.classList[isShow ? "add" : "remove"]("show");
    elements.popularSection.classList[isShow ? "add" : "remove"]("show");
  };

  const showUICreatePlaylist = (isShow) => {
    if (isShow) {
      elements.hitsSection.classList.add("hidden");
      elements.artistsSection.classList.add("hidden");
      elements.artistHero.classList.remove("show");
      elements.artistControls.classList.remove("show");
      elements.popularSection.classList.remove("show");
      elements.createPlaylistSection.classList.add("show");
    } else {
      elements.createPlaylistSection.classList.remove("show");
    }
  };

  const openPlaylistModal = () => {
    elements.overlay.classList.remove("hidden");
    elements.modal.classList.remove("hidden");
  };

  const closePlaylistModal = () => {
    elements.overlay.classList.add("hidden");
    elements.modal.classList.add("hidden");
  };

  // Authentication functions
  const onLoadUser = async () => {
    try {
      const data = await getCurrentUser();
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      elements.userName.textContent =
        userInfo.display_name || data.user.display_name;
      elements.actionButtons.style.display = "none";
    } catch (error) {
      elements.actionButtons.style.display = "flex";
      throw error;
    }
  };

  const handleAuth = async (isSignup, formData) => {
    const formGroupEmail = document.querySelector(".form-group-email");
    const formGroupPassword = document.querySelector(".form-group-password");
    const errorMessageEmail = document.querySelector(".error-message-email");
    const errorMessagePassword = document.querySelector(
      ".error-message-password"
    );

    try {
      // Clear previous errors
      formGroupEmail.classList.remove("invalid");
      formGroupPassword.classList.remove("invalid");

      const data = isSignup
        ? await registerApi(formData)
        : await loginApi(formData);
      const { user, access_token, refresh_token } = data;

      // Save tokens and user info
      localStorage.setItem("accessToken", access_token);
      localStorage.setItem("refreshToken", refresh_token);
      localStorage.setItem("userInfo", JSON.stringify(user));

      // Update UI
      elements.userName.textContent = user.display_name;
      elements.actionButtons.style.display = "none";
      await onLoadUser();
      hideAuthModal();
    } catch (error) {
      const { details, message } = error.response.data.error;

      if (details) {
        details.forEach((element) => {
          if (element.field === "email") {
            formGroupEmail.classList.add("invalid");
            errorMessageEmail.textContent = element.message;
          }
          if (element.field === "password") {
            formGroupPassword.classList.add("invalid");
            errorMessagePassword.textContent = element.message;
          }
        });
      }

      if (message) {
        formGroupEmail.classList.add("invalid");
        errorMessageEmail.textContent = message;
      }
      throw error;
    }
  };

  const logout = () => {
    hideUserDropdown();
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userInfo");
    elements.userName.textContent = "";
    elements.actionButtons.style.display = "flex";
  };

  // Follow/Unfollow handlers
  const handleFollowToggle = async (type, id, isFollowing, btn) => {
    try {
      btn.disabled = true;

      if (type === "playlist") {
        isFollowing ? await unfollowPlaylist(id) : await followPlaylist(id);
      } else {
        isFollowing ? await unfollowArtist(id) : await followArtist(id);
      }

      btn.textContent = isFollowing ? "Follow" : "Unfollow";
      btn.dataset.following = (!isFollowing).toString();
    } catch (error) {
      console.error(`Error following/unfollowing ${type}:`, error);
      btn.textContent = isFollowing ? "Unfollow" : "Follow";
    } finally {
      btn.disabled = false;
    }
  };

  // Render functions
  const renderTracks = (tracks, artistId) => {
    if (tracks.length === 0) {
      return `<h2 class="section-title">Popular</h2><div class="track-list">No tracks in playlist</div>`;
    }

    return `
      <h2 class="section-title">Popular</h2>
      <div class="track-list">
        ${tracks
          .map(
            (track, index) => `
          <div data-artist-id="${artistId}" data-index-song="${index}" data-id="${
              track.id
            }" class="track-item ${
              index === Number(localStorage.getItem("currentIndex"))
                ? "playing"
                : ""
            }">
            <div class="track-number">${index + 1}</div>
            <div class="track-image">
              <img src="${track.image_url}" alt="${track.title}" />
            </div>
            <div class="track-info">
              <div class="track-name">${track.title}</div>
            </div>
            <div class="track-plays">${track.play_count}</div>
            <div class="track-duration">${formatSeconds(track.duration)}</div>
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

  const renderPlaylistHero = (playlist) => `
    <div class="hero-background">
      <img src="${playlist.image_url}" alt="${
    playlist.description
  }" class="hero-image" />
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
          ? `<button class="follow-btn playlist-follow-btn" data-following="${
              playlist.is_following
            }">${playlist.is_following ? "Unfollow" : "Follow"}</button>`
          : `<button type="button" class="owner-btn">Owner</button>`
      }
    </div>
  `;

  const renderArtistHero = (artist) => `
    <div class="hero-background">
      <img src="${artist.image_url}" alt="${artist.name}" class="hero-image" />
      <div class="hero-overlay"></div>
    </div>
    <div class="hero-content" data-id="${artist.id}">
      ${
        artist.is_verified
          ? `
        <div class="verified-badge">
          <i class="fas fa-check-circle"></i>
          <span>Verified Artist</span>
        </div>`
          : ""
      }
      <h1 class="artist-name">${artist.name}</h1>
      <p class="monthly-listeners">${formatNumber(
        artist.monthly_listeners
      )} monthly listeners</p>
      <button class="follow-btn artist-follow-btn" data-following="${
        artist.is_following
      }">
        ${artist.is_following ? "Unfollow" : "Follow"}
      </button>
    </div>
  `;

  const setupContextMenu = () => {
    document.querySelectorAll(".library-item").forEach((item) => {
      item.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        hideMenus();
        currentPlaylistIdSideBar = item.dataset.id;

        const menu = item.classList.contains("library-item-playlist")
          ? elements.menuPlaylist
          : elements.menuArtist;

        if (menu) {
          menu.style.display = "block";
          menu.style.left = `${e.pageX}px`;
          menu.style.top = `${e.pageY}px`;
        }
      });
    });
  };

  // Event Listeners Setup
  const setupEventListeners = () => {
    // Auth modal events
    elements.signupBtn.addEventListener("click", () => {
      showSignupForm();
      showAuthModal();
    });
    elements.loginBtn.addEventListener("click", () => {
      showLoginForm();
      showAuthModal();
    });
    elements.modalClose.addEventListener("click", hideAuthModal);
    elements.showLoginBtn.addEventListener("click", showLoginForm);
    elements.showSignupBtn.addEventListener("click", showSignupForm);

    // Modal close events
    elements.authModal.addEventListener("click", (e) => {
      if (e.target === elements.authModal) hideAuthModal();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (elements.authModal.classList.contains("show")) hideAuthModal();
        if (elements.userDropdown.classList.contains("show"))
          hideUserDropdown();
      }
    });

    // User dropdown events
    elements.userAvatar.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleUserDropdown();
    });

    elements.logoutBtn.addEventListener("click", logout);

    // Search and sort events
    elements.searchLibraryBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleSearchInput();
    });

    elements.searchLibraryInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") console.log(elements.searchLibraryInput.value);
    });

    elements.sortBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleSortTable();
    });

    // Navigation tabs
    elements.navTabPlaylists.addEventListener("click", () => {
      elements.navTabArtists.classList.remove("active");
      elements.navTabPlaylists.classList.add("active");
      sortByPlaylist = true;
      localStorage.setItem("sortByPlaylist", true);
    });

    elements.navTabArtists.addEventListener("click", () => {
      elements.navTabPlaylists.classList.remove("active");
      elements.navTabArtists.classList.add("active");
      sortByPlaylist = false;
      localStorage.setItem("sortByPlaylist", false);
    });

    // Context menu events
    [elements.menuPlaylist, elements.menuArtist].forEach((menu) => {
      menu.addEventListener("click", async (e) => {
        if (e.target.tagName === "DIV") {
          await deletePlaylist(currentPlaylistIdSideBar);
          await renderMyPlaylists(elements.libraryContent);
          await init();
          hideMenus();
          setupContextMenu();
          showUIPopular(false);
          showUICreatePlaylist(false);
          elements.createPlaylistBtn.disabled = false;
          elements.createPlaylistBtn.style.display = "block";
        }
      });
    });

    // Home navigation
    [elements.logoIcon, elements.homeButton].forEach((el) => {
      el.addEventListener("click", async () => {
        await init();
        showUIPopular(false);
        showUICreatePlaylist(false);
        elements.createPlaylistBtn.disabled = false;
        elements.createPlaylistBtn.style.display = "block";
      });
    });

    // Create playlist
    elements.createPlaylistBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        showUICreatePlaylist(true);
        const { playlist } = await createPlaylist();
        elements.createPlaylistBtn.style.display = "none";
        elements.createPlaylistBtn.disabled = true;
        elements.playlistName.value = playlist.name;
        elements.playlistDesc.value = playlist.description;
        elements.coverPreviewImage.src = playlist.image_url;
        elements.playlistCoverImage.src = playlist.image_url;
        elements.playlistTitle.textContent = playlist.name;
        elements.playlistTitle.dataset.id = playlist.id;
        await renderMyPlaylists(elements.libraryContent);
        setupContextMenu();
      } catch (error) {
        console.error(error);
      }
    });

    // Playlist modal events
    elements.playlistTitle.addEventListener("click", openPlaylistModal);
    elements.playlistImage.addEventListener("click", openPlaylistModal);
    elements.overlay.addEventListener("click", closePlaylistModal);
    elements.modalCloseBtn.addEventListener("click", closePlaylistModal);

    // File upload
    elements.coverPreviewImage.addEventListener("click", () =>
      elements.fileInputPlaylistCover.click()
    );

    elements.fileInputPlaylistCover.addEventListener("change", async () => {
      const file = elements.fileInputPlaylistCover.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          elements.coverPreviewImage.src = e.target.result;
          elements.playlistCoverImage.src = e.target.result;
          elements.coverPreviewImage.style.display = "block";
        };
        reader.readAsDataURL(file);

        const formData = new FormData();
        formData.append("cover", file);

        try {
          const response = await uploadPlaylistCover(
            elements.playlistTitle.dataset.id,
            formData
          );
          urlPlaylistCoverImage = response.file.url;
        } catch (error) {
          console.error("Upload error:", error);
        }
      }
    });

    // Save playlist changes
    elements.saveBtn.addEventListener("click", async () => {
      const playlistUpdateData = {
        name: elements.playlistName.value,
        description: elements.playlistDesc.value,
        image_url: urlPlaylistCoverImage,
      };

      try {
        await updatePlaylist(
          elements.playlistTitle.dataset.id,
          playlistUpdateData
        );
        const playlist = await getPlaylistById(
          elements.playlistTitle.dataset.id
        );
        elements.playlistName.value = playlist.name;
        elements.playlistDesc.value = playlist.description;
        elements.playlistCoverImage.src = playlist.image_url;
        elements.playlistTitle.textContent = playlist.name;
        elements.playlistTitle.dataset.id = playlist.id;
        await renderMyPlaylists(elements.libraryContent);
        setupContextMenu();
      } catch (error) {
        console.error(error);
      } finally {
        closePlaylistModal();
      }
    });

    // Form submissions
    elements.signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = {
        email: document.querySelector("#signupEmail").value,
        password: document.querySelector("#signupPassword").value,
        username: document.querySelector("#username").value,
        display_name: document.querySelector("#displayName").value,
      };
      await handleAuth(true, formData);
    });

    elements.loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = {
        email: document.querySelector("#loginEmail").value,
        password: document.querySelector("#loginPassword").value,
      };
      await handleAuth(false, formData);
    });

    // Global click handlers
    document.addEventListener("click", (e) => {
      if (
        !elements.searchLibraryInput.contains(e.target) &&
        !elements.searchLibraryBtn.contains(e.target)
      ) {
        elements.searchLibraryInput.classList.remove("show");
      }
      if (
        !elements.sortByTable.contains(e.target) &&
        !elements.sortBtn.contains(e.target)
      ) {
        elements.sortByTable.classList.remove("show");
      }
      if (
        !elements.userAvatar.contains(e.target) &&
        !elements.userDropdown.contains(e.target)
      ) {
        hideUserDropdown();
      }
      hideMenus();
    });
  };

  // Initialize application
  const init = async () => {
    // Update UI tabs based on sort state
    if (!sortByPlaylist || sortByPlaylist === "true") {
      elements.navTabPlaylists.classList.add("active");
      elements.navTabArtists.classList.remove("active");
    } else {
      elements.navTabPlaylists.classList.remove("active");
      elements.navTabArtists.classList.add("active");
    }

    // Setup event listeners
    setupEventListeners();

    // Load user and render playlists
    await onLoadUser();
    await renderMyPlaylists(elements.libraryContent);
    setupContextMenu();

    // Load and render main content
    const { playlists } = await getAllPlaylists();
    const { artists } = await getAllArtists();

    // Render playlists grid
    const hitsGridHtml = playlists
      .map(
        (playlist) => `
      <div data-id="${playlist.id}" class="hit-card">
        <div class="hit-card-cover">
          <img src="${
            playlist.image_url !== null ? playlist.image_url : ""
          }" alt="${playlist.description}" />
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
    elements.hitsGrid.innerHTML = hitsGridHtml;

    // Render artists grid
    const artistsGridHtml = artists
      .map(
        (artist) => `
      <div data-id="${artist.id}" class="artist-card">
        <div class="artist-card-cover">
          <img src="${artist.image_url}" alt="${artist.bio}" />
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
    elements.artistsGrid.innerHTML = artistsGridHtml;

    // Setup playlist card click events
    document.querySelectorAll(".hit-card").forEach((card) => {
      card.addEventListener("click", async () => {
        const playlist = await getPlaylistById(card.dataset.id);
        showUIPopular(true);

        elements.artistHero.innerHTML = renderPlaylistHero(playlist);

        // Setup follow button
        const followBtn = elements.artistHero.querySelector(
          ".playlist-follow-btn"
        );
        if (followBtn) {
          followBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            e.stopPropagation();
            const isFollowing = e.target.dataset.following === "true";
            await handleFollowToggle(
              "playlist",
              playlist.id,
              isFollowing,
              e.target
            );
          });
        }

        // Load and render tracks
        const { tracks } = await getTrackByPlaylist(playlist.id);
        elements.popularSection.innerHTML = renderTracks(tracks);
      });
    });

    // Setup artist card click events
    document.querySelectorAll(".artist-card").forEach((card) => {
      card.addEventListener("click", async () => {
        const artist = await getArtistById(card.dataset.id);
        showUIPopular(true);

        elements.artistHero.innerHTML = renderArtistHero(artist);

        // Setup follow button
        const followBtn =
          elements.artistHero.querySelector(".artist-follow-btn");
        if (followBtn) {
          followBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            e.stopPropagation();
            const isFollowing = e.target.dataset.following === "true";
            await handleFollowToggle(
              "artist",
              artist.id,
              isFollowing,
              e.target
            );
          });
        }

        // Load and render tracks
        const { tracks } = await getArtistPopularTracks(artist.id);
        elements.popularSection.innerHTML = renderTracks(tracks, artist.id);
        localStorage.setItem("currentArtistId", artist.id);
        localStorage.setItem("currentTracks", JSON.stringify(tracks));
      });
    });
  };

  // Start the application
  await init();

  // Audio player với xử lý conflict được cải thiện
  const player = {
    NEXT: 1,
    PREV: -1,
    timeToPrev: 2,

    // DOM Elements
    audio: document.querySelector(".player-audio"),
    playerImage: document.querySelector(".player-image"),
    playerTitle: document.querySelector(".player-title"),
    playerArtist: document.querySelector(".player-artist"),

    // Control buttons
    shuffleBtn: document.querySelector(".control-btn:has(.fa-random)"),
    prevBtn: document.querySelector(".control-btn:has(.fa-step-backward)"),
    playBtn: document.querySelector(".play-btn"),
    nextBtn: document.querySelector(".control-btn:has(.fa-step-forward)"),
    repeatBtn: document.querySelector(".control-btn:has(.fa-redo)"),

    // Progress elements
    currentTimeEl: document.querySelector(
      ".progress-container .time:first-child"
    ),
    totalTimeEl: document.querySelector(".progress-container .time:last-child"),
    progressBar: document.querySelector(".progress-bar"),
    progressFill: document.querySelector(".progress-fill"),
    progressHandle: document.querySelector(".progress-handle"),

    // Volume elements
    volumeBtn: document.querySelector(".control-btn:has(.fa-volume-down)"),
    volumeBar: document.querySelector(".volume-bar"),
    volumeFill: document.querySelector(".volume-fill"),
    volumeHandle: document.querySelector(".volume-handle"),

    // Player state
    songs: [],
    historySong: [],
    currentIndex: Number(localStorage.getItem("currentIndex")) || 0,
    isScrolling: false,
    isRepeat: localStorage.getItem("isRepeat") === "true",
    isShuffle: localStorage.getItem("isShuffle") === "true",
    isLoading: false,
    isTransitioning: false, // Flag để ngăn conflict

    // Utility để xử lý audio play/pause safely
    async safePlay() {
      if (this.isTransitioning) return;

      try {
        this.isTransitioning = true;

        // Pause trước khi play để tránh conflict
        this.audio.pause();

        // Đợi một chút để đảm bảo pause hoàn thành
        await new Promise((resolve) => setTimeout(resolve, 10));

        // Kiểm tra nếu có src valid
        if (this.audio.src && this.audio.readyState >= 2) {
          await this.audio.play();
        }
      } catch (error) {
        console.warn("Play was interrupted:", error.name);
        // Retry sau một khoảng thời gian ngắn
        if (error.name === "AbortError") {
          setTimeout(() => {
            if (!this.audio.paused) return;
            this.audio
              .play()
              .catch((e) => console.warn("Retry play failed:", e));
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
        setTimeout(() => {
          this.isTransitioning = false;
        }, 50);
      }
    },

    // Load new playlist/tracks safely
    async loadNewPlaylist(tracks, artistId = null) {
      // Stop current playback
      this.safePause();

      // Reset audio src để tránh conflict
      this.audio.src = "";

      // Update songs data
      this.songs = tracks.map((track) => ({
        id: track.id,
        name: track.title,
        path: track.audio_url,
        artist: track.artist_name,
        pathThumb: track.image_url || track.album_cover_image_url,
        duration: track.duration,
        albumTitle: track.album_title,
        playCount: track.play_count,
      }));

      // Reset player state
      this.currentIndex = 0;
      this.historySong = [];

      // Save to localStorage
      localStorage.setItem("currentIndex", this.currentIndex);
      localStorage.setItem("currentTracks", JSON.stringify(tracks));
      if (artistId) {
        localStorage.setItem("currentArtistId", artistId);
      }

      // Load first song
      if (this.songs.length > 0) {
        this.loadCurrentSong();
      }
    },

    getCurrentSong() {
      return this.songs[this.currentIndex];
    },

    loadCurrentSong() {
      if (this.songs.length === 0) return;

      const currentSong = this.getCurrentSong();
      this.playerTitle.textContent = currentSong.name;
      this.playerArtist.textContent = currentSong.artist;
      this.playerImage.src = currentSong.pathThumb;
      this.playerImage.alt = currentSong.name;

      // Set audio src and wait for it to load
      this.audio.src = currentSong.path;
      this.audio.load(); // Force reload
    },

    addToHistory(index) {
      if (this.historySong.length === this.songs.length) {
        this.historySong = [];
      }

      if (!this.historySong.includes(index)) {
        this.historySong.push(index);
      }
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

      // Stop current playback
      this.safePause();

      if (!this.isShuffle) {
        this.currentIndex =
          (this.currentIndex + step + this.songs.length) % this.songs.length;
      } else {
        this.currentIndex = this.getRandomSong();
      }

      this.addToHistory(this.currentIndex);
      localStorage.setItem("currentIndex", this.currentIndex);

      // Update UI
      const currentTracks = JSON.parse(
        localStorage.getItem("currentTracks") || "[]"
      );
      const currentArtistId = localStorage.getItem("currentArtistId");

      if (currentTracks.length > 0 && elements.popularSection) {
        elements.popularSection.innerHTML = renderTracks(
          currentTracks,
          currentArtistId
        );
      }

      this.loadCurrentSong();

      setTimeout(async () => {
        await this.safePlay();
      }, 200);
    },

    formatTime(sec) {
      const minutes = Math.floor(sec / 60);
      const seconds = Math.floor(sec % 60);
      return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    },

    updateProgress() {
      if (!this.isScrolling && this.audio.duration) {
        const percent = (this.audio.currentTime / this.audio.duration) * 100;
        this.progressFill.style.width = percent + "%";
        this.currentTimeEl.textContent = this.formatTime(
          this.audio.currentTime
        );
      }
    },

    updateVolume() {
      const percent = this.audio.volume * 100;
      this.volumeFill.style.width = percent + "%";
    },

    setupProgressBar() {
      this.progressBar.addEventListener("click", (e) => {
        if (!this.audio.duration) return;

        const rect = this.progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        this.audio.currentTime = percent * this.audio.duration;
      });

      // Handle drag for progress
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
        this.currentTimeEl.textContent = this.formatTime(
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
      this.volumeBar.addEventListener("click", (e) => {
        const rect = this.volumeBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        this.audio.volume = Math.max(0, Math.min(1, percent));
        this.updateVolume();
      });

      // Handle drag for volume
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
        this.updateVolume();
      });

      document.addEventListener("mouseup", () => {
        isDragging = false;
      });
    },

    init() {
      // Play/Pause button với safe handling
      this.playBtn.addEventListener("click", async () => {
        if (this.songs.length === 0) return;

        if (this.audio.paused) {
          await this.safePlay();
        } else {
          this.safePause();
        }
      });

      // Audio event listeners
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
        this.totalTimeEl.textContent = this.formatTime(this.audio.duration);
      });

      this.audio.addEventListener("timeupdate", () => {
        this.updateProgress();
      });

      this.audio.addEventListener("ended", async () => {
        if (this.isRepeat) {
          await this.safePlay();
        } else {
          await this.changeIndexSong(this.NEXT);
        }
      });

      this.audio.addEventListener("error", (e) => {
        console.error("Audio error:", e);
        // Try to play next song on error
        setTimeout(() => {
          this.changeIndexSong(this.NEXT);
        }, 1000);
      });

      // Control buttons với async handling
      this.nextBtn.addEventListener("click", async () => {
        await this.changeIndexSong(this.NEXT);
      });

      this.prevBtn.addEventListener("click", async () => {
        if (this.audio.currentTime < this.timeToPrev) {
          await this.changeIndexSong(this.PREV);
        } else {
          this.audio.currentTime = 0;
        }
      });

      // Repeat button
      this.repeatBtn.classList.toggle("active", this.isRepeat);
      this.repeatBtn.addEventListener("click", () => {
        this.isRepeat = !this.isRepeat;
        localStorage.setItem("isRepeat", this.isRepeat);
        this.repeatBtn.classList.toggle("active", this.isRepeat);
      });

      // Shuffle button
      this.shuffleBtn.classList.toggle("active", this.isShuffle);
      this.shuffleBtn.addEventListener("click", () => {
        this.isShuffle = !this.isShuffle;
        localStorage.setItem("isShuffle", this.isShuffle);
        this.shuffleBtn.classList.toggle("active", this.isShuffle);
      });

      // Volume button (mute/unmute)
      this.volumeBtn.addEventListener("click", () => {
        if (this.audio.volume > 0) {
          this.audio.volume = 0;
        } else {
          this.audio.volume = 0.7;
        }
        this.updateVolume();
      });

      // Keyboard shortcuts
      document.addEventListener("keydown", async (e) => {
        if (this.songs.length === 0) return;

        if (e.code === "Space") {
          e.preventDefault();
          if (this.audio.paused) {
            await this.safePlay();
          } else {
            this.safePause();
          }
        }
        if (e.code === "ArrowRight") {
          e.preventDefault();
          await this.changeIndexSong(this.NEXT);
        }
        if (e.code === "ArrowLeft") {
          e.preventDefault();
          await this.changeIndexSong(this.PREV);
        }
      });

      // Setup progress and volume bars
      this.setupProgressBar();
      this.setupVolumeBar();

      // Initialize volume display
      this.updateVolume();

      console.log("Player initialized");
    },
  };

  // Handle artist card clicks với improved playlist loading
  document.addEventListener("click", async (e) => {
    const artistCard = e.target.closest(".artist-card");
    if (artistCard) {
      try {
        // Get artist tracks
        const { tracks } = await getArtistPopularTracks(artistCard.dataset.id);

        // Load new playlist safely
        await player.loadNewPlaylist(tracks, artistCard.dataset.id);

        // Initialize player if not already done
        if (!player.audio.src) {
          player.init();
        }
      } catch (error) {
        console.error("Error loading artist tracks:", error);
      }
    }
  });

  // Handle individual track clicks với improved handling
  document.addEventListener("click", async (e) => {
    const trackItem = e.target.closest(".track-item");
    if (trackItem) {
      try {
        const index = Number(trackItem.dataset.indexSong);
        const artistId = trackItem.dataset.artistId;

        // Update current index
        player.currentIndex = index;
        player.addToHistory(player.currentIndex);
        localStorage.setItem("currentIndex", player.currentIndex);

        // Load current song
        player.loadCurrentSong();

        // Play the song safely
        setTimeout(async () => {
          await player.safePlay();
        }, 200);

        // Update UI
        const { tracks } = await getArtistPopularTracks(artistId);
        elements.popularSection.innerHTML = renderTracks(tracks, artistId);
      } catch (error) {
        console.error("Error playing track:", error);
      }
    }
  });

  // Initialize player
  player.init();
});
