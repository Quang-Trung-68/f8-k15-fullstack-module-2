// ============================================
// FILE: main.js
// ============================================

import { AuthModal } from "./components/auth/AuthModal.js";
import { UserMenu } from "./components/auth/UserMenu.js";
import { AudioPlayer } from "./components/player/AudioPlayer.js";
import { PlaylistGrid } from "./components/playlist/PlaylistGrid.js";
import { PlaylistHero } from "./components/playlist/PlaylistHero.js";
import { PlaylistModal } from "./components/playlist/PlaylistModal.js";
import { ArtistGrid } from "./components/artist/ArtistGrid.js";
import { ArtistHero } from "./components/artist/ArtistHero.js";
import { TrackList } from "./components/track/TrackList.js";
import { TrackContextMenu } from "./components/track/TrackContextMenu.js";
import { LibraryContent } from "./components/library/LibraryContent.js";
import { LibrarySearch } from "./components/library/LibrarySearch.js";
import { SortMenu } from "./components/library/SortMenu.js";
import { ContextMenu } from "./components/library/ContextMenu.js";
import { SearchDropdown } from "./components/search/SearchDropdown.js";

import { appState } from "./state/appState.js";
import { playlistAPI, artistAPI } from "./api/endpoints.js";
import { playlistService } from "./services/playlistService.js";
import { artistService } from "./services/artistService.js";
import { trackService } from "./services/trackService.js";
import { showToast } from "./utils/helpers.js";

document.addEventListener("DOMContentLoaded", async () => {
  // ============================================
  // ELEMENT REFERENCES
  // ============================================
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
    userAvatar: document.querySelector(".user-avatar"),
    userDropdown: document.getElementById("userDropdown"),
    logoutBtn: document.getElementById("logoutBtn"),
    userName: document.querySelector(".user-name"),
    userMenuDiv: document.querySelector(".user-menu"),
    // Library elements
    libraryContent: document.querySelector(".library-content"),
    navTabPlaylists: document.querySelector(".nav-tab-playlists"),
    navTabArtists: document.querySelector(".nav-tab-artists"),
    searchLibraryBtn: document.querySelector(".search-library-btn"),
    searchLibraryInput: document.querySelector(".search-library-input"),
    sortBtn: document.querySelector(".sort-btn"),
    sortByTable: document.querySelector(".sort-by-table"),
    menuPlaylist: document.getElementById("menuPlaylist"),
    menuArtist: document.getElementById("menuArtist"),

    // Content sections
    hitsSection: document.querySelector(".hits-section"),
    artistsSection: document.querySelector(".artists-section"),
    hitsGrid: document.querySelector(".hits-grid"),
    artistsGrid: document.querySelector(".artists-grid"),
    artistHero: document.querySelector(".artist-hero"),
    artistControls: document.querySelector(".artist-controls"),
    popularSection: document.querySelector(".popular-section"),
    playBtnLarge: document.querySelector(".play-btn-large"),

    // Playlist creation
    createPlaylistSection: document.querySelector(".create-playlist"),
    createPlaylistBtn: document.querySelector(".create-btn"),
    playlistTitle: document.querySelector(".playlist-title"),
    playlistCoverImage: document.querySelector(".playlist-cover-image"),

    // Playlist modal
    overlay: document.querySelector(".overlay"),
    modal: document.querySelector(".modal"),
    modalCloseBtn: document.querySelector(".modal-close"),
    playlistName: document.querySelector(".playlist-name"),
    playlistDesc: document.querySelector(".playlist-desc"),
    fileInputPlaylistCover: document.querySelector("#fileInputPlaylistCover"),
    coverPreviewImage: document.querySelector(".cover-preview-image"),
    saveBtn: document.querySelector(".btn-save"),

    // Search and navigation
    searchInput: document.querySelector(".search-input"),
    logoIcon: document.querySelector(".fa-spotify"),
    backBtn: document.querySelector(".back-btn"),
    homeButton: document.querySelector(".home-btn"),
    menuBtn: document.getElementById("menuBtn"),
    sidebar: document.querySelector(".sidebar"),
    closeMenuBtn: document.querySelector(".close-menu-icon"),

    // Player
    addBtn: document.querySelector(".add-btn"),
  };

  // ============================================
  // Update back button visibility
  // ============================================
  const updateBackButton = () => {
    if (!elements.backBtn) return;

    const playingSourceId = appState.getCurrentPlayingSourceId();
    const playingSourceType = appState.getCurrentPlayingSourceType();

    // Check if we have a playing source
    if (!playingSourceId || !playingSourceType) {
      elements.backBtn.style.display = "none";
      return;
    }

    // Check if we're already at the playing source
    const isAtPlayingSource =
      (playingSourceType === "playlist" &&
        String(currentViewingPlaylistId) === String(playingSourceId)) ||
      (playingSourceType === "artist" &&
        String(appState.getCurrentArtistId()) === String(playingSourceId));

    elements.backBtn.style.display = isAtPlayingSource ? "none" : "block";
  };

  // ============================================
  // STATE VARIABLES
  // ============================================
  let isCreatingPlaylist = false;
  let eventListenersAdded = false;
  let currentViewingPlaylistId = null; // Track which playlist we're viewing

  // ============================================
  // INITIALIZE COMPONENTS
  // ============================================

  // Initialize Player
  const player = AudioPlayer(elements);
  window.player = player;

  // Make updateBackButton globally accessible for AudioPlayer
  window.updateBackButton = updateBackButton;

  // Update player.setTrackChangeCallback to include back button update
  player.setTrackChangeCallback((newIndex) => {
    const currentTracks = appState.getCurrentTracks();
    const artistId = appState.getCurrentArtistId();

    if (elements.popularSection && currentTracks.length > 0) {
      // Determine if we're viewing playlist or artist
      const playlistId = currentViewingPlaylistId;

      elements.popularSection.innerHTML = trackList.render(
        currentTracks,
        artistId,
        playlistId
      );
      attachTrackEvents();
    }

    // Update back button when track changes
    updateBackButton();
  });

  // Hàm cập nhật UI dựa vào auth status
  const updatePlayerUIBasedOnAuth = () => {
    const isAuth = appState.isAuthenticated();

    // Ẩn/hiện add button trong player
    if (elements.addBtn) {
      elements.addBtn.style.display = isAuth ? "flex" : "none";
    }

    // Nếu chưa auth, ẩn like buttons và track menu buttons
    if (!isAuth) {
      // Thêm style để ẩn các nút
      const style = document.createElement("style");
      style.id = "no-auth-style";
      style.textContent = `
      .track-is-liked {
        display: none !important;
      }
      .track-menu-btn {
        display: none !important;
      }
    `;

      // Xóa style cũ nếu có
      const oldStyle = document.getElementById("no-auth-style");
      if (oldStyle) {
        oldStyle.remove();
      }

      document.head.appendChild(style);
    } else {
      // Xóa style khi đã auth
      const oldStyle = document.getElementById("no-auth-style");
      if (oldStyle) {
        oldStyle.remove();
      }
    }
  };

  // Initialize Grid Components
  const playlistGrid = PlaylistGrid();
  const artistGrid = ArtistGrid();
  const trackList = TrackList();
  const playlistHero = PlaylistHero();
  const artistHero = ArtistHero();

  // Initialize Track Context Menu
  const trackContextMenu = TrackContextMenu(elements);
  trackContextMenu.init();
  window.onTrackRemovedFromPlaylist = async (playlistId) => {
    if (currentViewingPlaylistId === playlistId) {
      await renderPlaylistDetail(playlistId);
    }
  };
  // Initialize Library Components
  const libraryContent = LibraryContent(elements);
  const librarySearch = LibrarySearch(elements, async (searchValue) => {
    await libraryContent.render(
      appState.getFilterType(),
      searchValue,
      appState.getSortType()
    );
    attachLibraryEvents();
  });

  const sortMenu = SortMenu(
    elements,
    async (sortType) => {
      await libraryContent.render(
        appState.getFilterType(),
        elements.searchLibraryInput?.value || null,
        sortType
      );
      attachLibraryEvents();
    },
    (viewMode) => {
      // View change is handled inside SortMenu
    }
  );

  const contextMenu = ContextMenu(elements, {
    remove: async (id) => {
      await playlistService.unfollow(id);
      await libraryContent.render(
        appState.getFilterType(),
        null,
        appState.getSortType()
      );
      attachLibraryEvents();
      resetToHome();
      showToast("Playlist removed from library", "success");
    },
    delete: async (id) => {
      await playlistService.delete(id);
      await initHomePage();
      await libraryContent.render(
        appState.getFilterType(),
        null,
        appState.getSortType()
      );
      attachLibraryEvents();
      resetToHome();
      showToast("Playlist deleted", "success");
    },
    unfollow: async (id, type) => {
      await artistService.unfollow(id);
      await libraryContent.render(
        appState.getFilterType(),
        null,
        appState.getSortType()
      );
      attachLibraryEvents();
      resetToHome();
      showToast("Artist unfollowed", "success");
    },
  });

  // Initialize Playlist Modal
  const playlistModal = PlaylistModal(elements);

  // Set callback for when playlist is saved
  playlistModal.onSave(async (updatedPlaylist) => {
    await libraryContent.render(
      appState.getFilterType(),
      null,
      appState.getSortType()
    );
    attachLibraryEvents();

    // Update hero if we're viewing this playlist
    if (currentViewingPlaylistId === updatedPlaylist.id) {
      elements.artistHero.innerHTML = playlistHero.render(updatedPlaylist);
      attachHeroEvents();
    }
  });

  // Initialize Auth Components
  const authModal = AuthModal(elements, async (user) => {
    userMenu.updateUI(user);
    await libraryContent.render(
      appState.getFilterType(),
      null,
      appState.getSortType()
    );
    attachLibraryEvents();
    await initHomePage();
    updatePlayerUIBasedOnAuth();
  });

  const userMenu = UserMenu(elements, async () => {
    elements.libraryContent.innerHTML = "";
    await initHomePage();
    updatePlayerUIBasedOnAuth();
  });

  // Initialize all components
  authModal.init();
  userMenu.init();
  librarySearch.init();
  sortMenu.init();
  contextMenu.init();
  playlistModal.init();

  // Initialize Search Dropdown
  const searchDropdown = SearchDropdown(elements, {
    // Handle track click - play track immediately
    track: async (trackId) => {
      try {
        // Fetch track data
        const trackData = await trackService.getById(trackId);

        // Create single track playlist
        const singleTrackPlaylist = [trackData];

        // Stop current playback first
        player.safePause();
        player.audio.src = "";

        // Load new track
        await player.loadNewPlaylist(singleTrackPlaylist, trackData.artist_id);
        player.currentIndex = 0;
        appState.setCurrentIndex(0);

        // Clear playing source
        appState.setCurrentPlayingSourceId(null);
        appState.setCurrentPlayingSourceType(null);

        player.loadCurrentSong();

        // Force play after short delay to ensure audio is loaded
        setTimeout(async () => {
          try {
            player.isTransitioning = false; // Reset transitioning flag
            await player.audio.play();
            showToast("Playing track", "success");
          } catch (error) {
            console.error("Play error:", error);
            showToast("Failed to play track", "error");
          }
        }, 300);

        updateBackButton();
      } catch (error) {
        console.error("Error playing track:", error);
        showToast("Failed to play track", "error");
      }
    },

    // Handle playlist click - navigate to playlist detail
    playlist: async (playlistId) => {
      await renderPlaylistDetail(playlistId);
    },

    // Handle artist click - navigate to artist detail
    artist: async (artistId) => {
      await renderArtistDetail(artistId);
    },
  });

  searchDropdown.init();

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  const requireAuth = (callback) => {
    return async (e) => {
      if (!appState.isAuthenticated()) {
        e?.preventDefault?.();
        e?.stopPropagation?.();
        authModal.showLogin();
        authModal.show();
        showToast("Please login to use this feature", "error");
        return;
      }
      await callback(e);
    };
  };

  // Thêm hàm mới để cho phép view mà không cần auth
  const allowViewWithoutAuth = (callback) => {
    return async (e) => {
      await callback(e);
    };
  };

  const showUIPopular = (isShow) => {
    elements.hitsSection?.classList[isShow ? "add" : "remove"]("hidden");
    elements.artistsSection?.classList[isShow ? "add" : "remove"]("hidden");
    elements.createPlaylistSection?.classList.remove("show");
    elements.artistHero?.classList[isShow ? "add" : "remove"]("show");
    elements.artistControls?.classList[isShow ? "add" : "remove"]("show");
    elements.popularSection?.classList[isShow ? "add" : "remove"]("show");
  };

  const showUICreatePlaylist = (isShow) => {
    elements.hitsSection?.classList[isShow ? "add" : "remove"]("hidden");
    elements.artistsSection?.classList[isShow ? "add" : "remove"]("hidden");
    elements.artistHero?.classList.remove("show");
    elements.artistControls?.classList.remove("show");
    elements.popularSection?.classList.remove("show");
    elements.createPlaylistSection?.classList[isShow ? "add" : "remove"](
      "show"
    );
  };

  const resetToHome = () => {
    document.title = "Spotify";
    showUIPopular(false);
    showUICreatePlaylist(false);
    elements.createPlaylistBtn.disabled = false;
    elements.createPlaylistBtn.style.display = "block";
    currentViewingPlaylistId = null;
    removeAllLibraryActiveClasses();
    updateBackButton();
  };

  const removeAllLibraryActiveClasses = () => {
    document.querySelectorAll(".library-item").forEach((item) => {
      item.classList.remove("active");
    });
  };

  const setActiveLibraryItem = (itemId, itemType) => {
    removeAllLibraryActiveClasses();
    const selector =
      itemType === "playlist"
        ? `.library-item-playlist[data-id="${itemId}"]`
        : `.library-item-artist[data-id="${itemId}"]`;
    const item = document.querySelector(selector);
    if (item) {
      item.classList.add("active");
    }
  };

  // ============================================
  // RENDER FUNCTIONS
  // ============================================

  const renderPlaylistDetail = async (playlistId) => {
    try {
      const playlist = await playlistService.getById(playlistId);
      currentViewingPlaylistId = playlistId;
      showUIPopular(true);

      elements.artistHero.innerHTML = playlistHero.render(playlist);

      const tracks = await playlistService.getTracks(playlist.id);
      elements.popularSection.innerHTML = trackList.render(
        tracks,
        null,
        playlistId
      ); // Pass playlistId

      appState.setCurrentTracks(tracks);
      appState.setCurrentArtistId(null);

      setActiveLibraryItem(playlistId, "playlist");

      // Update back button visibility
      updateBackButton();

      attachHeroEvents();
      attachTrackEvents();
    } catch (error) {
      console.error("Load playlist error:", error);
      showToast("Failed to load playlist", "error");
    }
  };

  const renderArtistDetail = async (artistId) => {
    try {
      const artist = await artistService.getById(artistId);
      currentViewingPlaylistId = null;
      showUIPopular(true);

      elements.artistHero.innerHTML = artistHero.render(artist);

      const tracks = await artistService.getPopularTracks(artist.id);
      elements.popularSection.innerHTML = trackList.render(
        tracks,
        artist.id,
        null
      ); // Pass artistId

      appState.setCurrentArtistId(artist.id);
      appState.setCurrentTracks(tracks);

      setActiveLibraryItem(artistId, "artist");

      // Update back button visibility
      updateBackButton();

      attachHeroEvents();
      attachTrackEvents();
    } catch (error) {
      console.error("Load artist error:", error);
      showToast("Failed to load artist", "error");
    }
  };

  // ============================================
  // EVENT ATTACHMENT FUNCTIONS
  // ============================================

  const attachLibraryEvents = () => {
    contextMenu.attachToItems();

    // Playlist click events - CHO PHÉP VIEW KHÔNG CẦN AUTH
    document.querySelectorAll(".library-item-playlist").forEach((item) => {
      item.addEventListener(
        "click",
        allowViewWithoutAuth(async () => {
          const playlistId = item.dataset.id;
          await renderPlaylistDetail(playlistId);
        })
      );
    });

    // Artist click events - CHO PHÉP VIEW KHÔNG CẦN AUTH
    document.querySelectorAll(".library-item-artist").forEach((item) => {
      item.addEventListener(
        "click",
        allowViewWithoutAuth(async () => {
          const artistId = item.dataset.id;
          await renderArtistDetail(artistId);
        })
      );
    });
  };

  const attachHeroEvents = () => {
    // Playlist follow button
    const playlistFollowBtn = document.querySelector(".playlist-follow-btn");
    if (playlistFollowBtn) {
      playlistFollowBtn.addEventListener(
        "click",
        requireAuth(async () => {
          try {
            const heroContent = document.querySelector(".hero-content");
            const playlistId = heroContent?.dataset.id;

            if (!playlistId) {
              console.error("Playlist ID not found");
              showToast("Cannot find playlist ID", "error");
              return;
            }

            const isFollowing = playlistFollowBtn.dataset.following === "true";

            if (isFollowing) {
              await playlistService.unfollow(playlistId);
              playlistFollowBtn.textContent = "Follow";
              playlistFollowBtn.dataset.following = "false";
              showToast("Unfollowed playlist", "success");
            } else {
              await playlistService.follow(playlistId);
              playlistFollowBtn.textContent = "Following";
              playlistFollowBtn.dataset.following = "true";
              showToast("Following playlist", "success");
            }

            await libraryContent.render(
              appState.getFilterType(),
              null,
              appState.getSortType()
            );
            attachLibraryEvents();
          } catch (error) {
            console.error("Toggle follow error:", error);
            showToast("Failed to update follow status", "error");
          }
        })
      );
    }

    // Owner button - REQUIRE AUTH
    const ownerBtn = document.querySelector(".owner-btn");
    if (ownerBtn) {
      ownerBtn.addEventListener(
        "click",
        requireAuth(async () => {
          const heroContent = document.querySelector(".hero-content");
          const playlistId = heroContent?.dataset.id;

          if (!playlistId) return;

          try {
            const playlist = await playlistService.getById(playlistId);
            playlistModal.open(playlist);
          } catch (error) {
            console.error("Error opening playlist modal:", error);
            showToast("Failed to open playlist editor", "error");
          }
        })
      );
    }

    // Artist follow button
    const artistFollowBtn = document.querySelector(".artist-follow-btn");
    if (artistFollowBtn) {
      artistFollowBtn.addEventListener(
        "click",
        requireAuth(async () => {
          try {
            const heroContent = document.querySelector(".hero-content");
            const artistId = heroContent?.dataset.id;

            if (!artistId) {
              console.error("Artist ID not found");
              showToast("Cannot find artist ID", "error");
              return;
            }

            const isFollowing = artistFollowBtn.dataset.following === "true";

            if (isFollowing) {
              await artistService.unfollow(artistId);
              artistFollowBtn.textContent = "Follow";
              artistFollowBtn.dataset.following = "false";
              showToast("Unfollowed artist", "success");
            } else {
              await artistService.follow(artistId);
              artistFollowBtn.textContent = "Following";
              artistFollowBtn.dataset.following = "true";
              showToast("Following artist", "success");
            }

            await libraryContent.render(
              appState.getFilterType(),
              null,
              appState.getSortType()
            );
            attachLibraryEvents();
          } catch (error) {
            console.error("Toggle follow error:", error);
            showToast("Failed to update follow status", "error");
          }
        })
      );
    }
  };

  const attachTrackEvents = () => {
    // Remove old listeners first by cloning and replacing
    const oldPopularSection = elements.popularSection;
    const newPopularSection = oldPopularSection.cloneNode(true);
    oldPopularSection.parentNode.replaceChild(
      newPopularSection,
      oldPopularSection
    );
    elements.popularSection = newPopularSection;

    updatePlayerUIBasedOnAuth();

    // CLICK VÀO TRACK ĐỂ PLAY
    elements.popularSection.addEventListener("click", async (e) => {
      // Handle like/unlike - REQUIRE AUTH
      const likeBtn = e.target.closest(".track-is-liked");
      if (likeBtn) {
        e.stopPropagation();

        if (!appState.isAuthenticated()) {
          authModal.showLogin();
          authModal.show();
          showToast("Please login to like songs", "error");
          return;
        }

        const trackItem = likeBtn.closest(".track-item");
        const trackId = trackItem.dataset.id;
        const isLiked = likeBtn.textContent.trim() === "💚";

        try {
          await trackService.toggleLike(trackId, isLiked);

          const currentTracks = appState.getCurrentTracks();
          const trackIndex = currentTracks.findIndex(
            (t) => String(t.track_id || t.id) === String(trackId)
          );

          if (trackIndex !== -1) {
            currentTracks[trackIndex].is_liked = !isLiked;
            appState.setCurrentTracks(currentTracks);

            elements.popularSection.innerHTML = trackList.render(
              currentTracks,
              appState.getCurrentArtistId()
            );
            attachTrackEvents();

            showToast(
              isLiked ? "Removed from Liked Songs" : "Added to Liked Songs",
              "success"
            );
          }
        } catch (error) {
          console.error("Error toggling like:", error);
          showToast("Failed to update like status", "error");
        }
        return;
      }

      // Handle track click to play
      const trackItem = e.target.closest(".track-item");
      if (trackItem && !e.target.closest(".track-menu-btn")) {
        const clickedIndex = Number(trackItem.dataset.indexSong);
        const artistId = trackItem.dataset.artistId || null;
        const playlistId = trackItem.dataset.playlistId || null;
        const currentTracks = appState.getCurrentTracks();
        const currentIndex = appState.getCurrentIndex();

        if (currentTracks.length === 0) return;

        const isPlayingTrack = trackItem.classList.contains("playing");

        if (isPlayingTrack && clickedIndex === currentIndex) {
          if (player.audio.paused) {
            await player.safePlay();
          } else {
            player.safePause();
          }

          updateTrackPlayIcon(trackItem);
          updateLargePlayButton();
          return;
        }

        await player.loadNewPlaylist(currentTracks, artistId);
        player.currentIndex = clickedIndex;
        appState.setCurrentIndex(clickedIndex);

        // Save playing source
        if (playlistId) {
          appState.setCurrentPlayingSourceId(playlistId);
          appState.setCurrentPlayingSourceType("playlist");
        } else if (artistId) {
          appState.setCurrentPlayingSourceId(artistId);
          appState.setCurrentPlayingSourceType("artist");
        }

        player.loadCurrentSong();
        setTimeout(() => player.safePlay(), 200);

        elements.popularSection.innerHTML = trackList.render(
          currentTracks,
          artistId,
          playlistId
        );
        attachTrackEvents();

        updateLargePlayButton();
        updateBackButton();
      }
    });

    // Context menu - CHỈ YÊU CẦU AUTH KHI THỰC SỰ CLICK VÀO MENU
    elements.popularSection.addEventListener("contextmenu", async (e) => {
      const trackItem = e.target.closest(".track-item");
      if (trackItem) {
        e.preventDefault();

        // CHỈ KIỂM TRA AUTH KHI USER MUỐN MỞ MENU
        if (!appState.isAuthenticated()) {
          authModal.showLogin();
          authModal.show();
          showToast("Please login to add songs to playlist", "error");
          return;
        }

        const trackId = trackItem.dataset.id;
        await trackContextMenu.show(
          e.pageX,
          e.pageY,
          trackId,
          currentViewingPlaylistId
        );
      }
    });

    // Track menu button - CHỈ YÊU CẦU AUTH KHI CLICK
    elements.popularSection.addEventListener("click", async (e) => {
      const menuBtn = e.target.closest(".track-menu-btn");
      if (menuBtn) {
        e.stopPropagation();

        // CHỈ KIỂM TRA AUTH KHI USER CLICK VÀO NÚT MENU
        if (!appState.isAuthenticated()) {
          authModal.showLogin();
          authModal.show();
          showToast("Please login to add songs to playlist", "error");
          return;
        }

        const trackItem = menuBtn.closest(".track-item");
        const trackId = trackItem.dataset.id;
        const rect = menuBtn.getBoundingClientRect();
        await trackContextMenu.show(
          rect.right,
          rect.top,
          trackId,
          currentViewingPlaylistId
        );
      }
    });
  };

  const updateTrackPlayIcon = (trackItem) => {
    const trackNumber = trackItem.querySelector(".track-number");
    if (!trackNumber) return;

    if (player.audio.paused) {
      // Hiển thị icon play
      trackNumber.innerHTML = '<i class="fas fa-play playing-icon"></i>';
    } else {
      // Hiển thị icon pause hoặc volume
      trackNumber.innerHTML = '<i class="fas fa-pause playing-icon"></i>';
    }
  };

  const attachCardEvents = () => {
    // Playlist cards - CHO PHÉP VIEW KHÔNG CẦN AUTH
    document.querySelectorAll(".hit-card").forEach((card) => {
      card.addEventListener(
        "click",
        allowViewWithoutAuth(async () => {
          const playlistId = card.dataset.id;
          await renderPlaylistDetail(playlistId);
        })
      );
    });

    // Artist cards - CHO PHÉP VIEW KHÔNG CẦN AUTH
    document.querySelectorAll(".artist-card").forEach((card) => {
      card.addEventListener(
        "click",
        allowViewWithoutAuth(async () => {
          const artistId = card.dataset.id;
          await renderArtistDetail(artistId);
        })
      );
    });
  };

  const updateLargePlayButton = () => {
    const largeBtn = elements.playBtnLarge;
    if (!largeBtn) return;

    const icon = largeBtn.querySelector("i");
    if (!icon) return;

    if (player.audio.paused) {
      icon.classList.remove("fa-pause");
      icon.classList.add("fa-play");
    } else {
      icon.classList.remove("fa-play");
      icon.classList.add("fa-pause");
    }
  };

  // ============================================
  // SETUP EVENT LISTENERS
  // ============================================

  const handlePlaySingleTrack = async (trackId) => {
    try {
      // Tìm track trong current tracks
      const currentTracks = appState.getCurrentTracks();
      const trackIndex = currentTracks.findIndex(
        (t) => String(t.id || t.track_id) === String(trackId)
      );

      if (trackIndex !== -1) {
        // Track đã có trong playlist hiện tại
        const artistId = appState.getCurrentArtistId();
        const playlistId = currentViewingPlaylistId;

        player.currentIndex = trackIndex;
        appState.setCurrentIndex(trackIndex);

        // Save playing source
        if (playlistId) {
          appState.setCurrentPlayingSourceId(playlistId);
          appState.setCurrentPlayingSourceType("playlist");
        } else if (artistId) {
          appState.setCurrentPlayingSourceId(artistId);
          appState.setCurrentPlayingSourceType("artist");
        }

        player.loadCurrentSong();
        await player.safePlay();

        // Update UI
        if (elements.popularSection) {
          elements.popularSection.innerHTML = trackList.render(
            currentTracks,
            artistId,
            playlistId
          );
          attachTrackEvents();
        }

        updateLargePlayButton();
        updateBackButton();

        showToast("Playing track", "success");
      } else {
        // Track không có trong current playlist
        // Fetch track từ API
        const trackData = await trackService.getById(trackId);

        // Tạo array chỉ có 1 track này
        const singleTrackPlaylist = [trackData];

        // Load như một playlist mới
        await player.loadNewPlaylist(singleTrackPlaylist, trackData.artist_id);
        player.currentIndex = 0;
        appState.setCurrentIndex(0);

        // Clear playing source vì đây là single track
        appState.setCurrentPlayingSourceId(null);
        appState.setCurrentPlayingSourceType(null);

        player.loadCurrentSong();
        await player.safePlay();

        // Update popular section với track mới
        showUIPopular(true);
        currentViewingPlaylistId = null;

        elements.popularSection.innerHTML = trackList.render(
          singleTrackPlaylist,
          trackData.artist_id,
          null
        );
        attachTrackEvents();

        updateLargePlayButton();
        updateBackButton();

        showToast("Playing track", "success");
      }
    } catch (error) {
      console.error("Error playing track:", error);
      showToast("Failed to play track", "error");
    }
  };

  const setupEventListeners = () => {
    if (eventListenersAdded) return;

    // Back button handler
    elements.backBtn?.addEventListener("click", async () => {
      const playingSourceId = appState.getCurrentPlayingSourceId();
      const playingSourceType = appState.getCurrentPlayingSourceType();

      if (!playingSourceId || !playingSourceType) return;

      if (playingSourceType === "playlist") {
        await renderPlaylistDetail(playingSourceId);
      } else if (playingSourceType === "artist") {
        await renderArtistDetail(playingSourceId);
      }
    });

    // Mobile menu
    elements.closeMenuBtn?.addEventListener("click", () => {
      elements.sidebar.classList.add("hide");
      elements.sidebar.classList.remove("show");
    });

    elements.menuBtn?.addEventListener("click", () => {
      elements.sidebar.classList.toggle("hide");
      elements.sidebar.classList.toggle("show");
    });

    // Update home button and logo to reset back button
    [elements.logoIcon, elements.homeButton].forEach((el) => {
      el?.addEventListener("click", async () => {
        resetToHome();
        await initHomePage();
        updateBackButton();
      });
    });

    // Library tabs - REQUIRE AUTH
    elements.navTabPlaylists?.addEventListener(
      "click",
      requireAuth(async () => {
        elements.navTabArtists.classList.remove("active");
        elements.navTabPlaylists.classList.add("active");
        appState.setFilterType("playlist");
        await libraryContent.render("playlist", null, appState.getSortType());
        attachLibraryEvents();
      })
    );

    elements.navTabArtists?.addEventListener(
      "click",
      requireAuth(async () => {
        elements.navTabPlaylists.classList.remove("active");
        elements.navTabArtists.classList.add("active");
        appState.setFilterType("artist");
        await libraryContent.render("artist", null, appState.getSortType());
        attachLibraryEvents();
      })
    );

    // Create playlist - REQUIRE AUTH
    elements.createPlaylistBtn?.addEventListener(
      "click",
      requireAuth(async () => {
        if (isCreatingPlaylist) return;

        try {
          isCreatingPlaylist = true;
          elements.createPlaylistBtn.disabled = true;

          showUICreatePlaylist(true);
          const playlist = await playlistService.create();

          elements.createPlaylistBtn.style.display = "none";
          elements.playlistName.value = playlist.name;
          elements.playlistDesc.value = playlist.description;
          elements.coverPreviewImage.src = playlist.image_url;
          elements.playlistCoverImage.src = playlist.image_url;
          elements.playlistTitle.textContent = playlist.name;
          elements.playlistTitle.dataset.id = playlist.id;
          elements.playlistTitle.dataset.imageUrl = playlist.image_url;

          await libraryContent.render(
            appState.getFilterType(),
            null,
            appState.getSortType()
          );
          attachLibraryEvents();
          showToast("Playlist created successfully", "success");
        } catch (error) {
          console.error("Error creating playlist:", error);
          elements.createPlaylistBtn.disabled = false;
          elements.createPlaylistBtn.style.display = "block";
          showUICreatePlaylist(false);
          showToast("Failed to create playlist", "error");
        } finally {
          isCreatingPlaylist = false;
        }
      })
    );

    // Open playlist modal - REQUIRE AUTH
    elements.playlistTitle?.addEventListener(
      "click",
      requireAuth(() => {
        const playlist = {
          id: elements.playlistTitle.dataset.id,
          name: elements.playlistName.value,
          description: elements.playlistDesc.value,
          image_url: elements.coverPreviewImage.src,
        };
        playlistModal.open(playlist);
      })
    );

    elements.playlistCoverImage?.addEventListener(
      "click",
      requireAuth(() => {
        const playlist = {
          id: elements.playlistTitle.dataset.id,
          name: elements.playlistName.value,
          description: elements.playlistDesc.value,
          image_url: elements.coverPreviewImage.src,
        };
        playlistModal.open(playlist);
      })
    );

    // Add button - CHỈ YÊU CẦU AUTH KHI CLICK
    elements.addBtn?.addEventListener("click", async (e) => {
      e.stopPropagation();

      // KIỂM TRA AUTH KHI CLICK
      if (!appState.isAuthenticated()) {
        authModal.showLogin();
        authModal.show();
        showToast("Please login to add songs to playlist", "error");
        return;
      }

      const currentTracks = appState.getCurrentTracks();
      const currentIndex = appState.getCurrentIndex();

      if (currentTracks.length === 0 || currentIndex < 0) {
        showToast("No track is currently playing", "error");
        return;
      }

      const currentTrack = currentTracks[currentIndex];
      const trackId = currentTrack.id || currentTrack.track_id;

      const rect = elements.addBtn.getBoundingClientRect();
      await trackContextMenu.show(rect.left, rect.top - 10, trackId, null);
    });

    // Update large play button to save source
    elements.playBtnLarge?.addEventListener("click", async (e) => {
      e.preventDefault();

      const currentTracks = appState.getCurrentTracks();
      if (currentTracks.length === 0) return;

      const icon = elements.playBtnLarge.querySelector("i");

      const isSamePlaylist =
        player.songs.length > 0 &&
        player.audio.src !== "" &&
        JSON.stringify(currentTracks.map((t) => t.id || t.track_id)) ===
          JSON.stringify(player.songs.map((s) => s.id));

      if (!isSamePlaylist) {
        await player.loadNewPlaylist(
          currentTracks,
          appState.getCurrentArtistId()
        );
        player.currentIndex = 0;
        appState.setCurrentIndex(0);

        // Save playing source
        if (currentViewingPlaylistId) {
          appState.setCurrentPlayingSourceId(currentViewingPlaylistId);
          appState.setCurrentPlayingSourceType("playlist");
        } else if (appState.getCurrentArtistId()) {
          appState.setCurrentPlayingSourceId(appState.getCurrentArtistId());
          appState.setCurrentPlayingSourceType("artist");
        }

        player.loadCurrentSong();

        icon.classList.remove("fa-play");
        icon.classList.add("fa-pause");

        setTimeout(() => player.safePlay(), 200);

        elements.popularSection.innerHTML = trackList.render(
          currentTracks,
          appState.getCurrentArtistId(),
          currentViewingPlaylistId
        );
        attachTrackEvents();
        updateBackButton(); 
      } else {
        if (player.audio.paused) {
          await player.safePlay();
          icon.classList.remove("fa-play");
          icon.classList.add("fa-pause");
        } else {
          player.safePause();
          icon.classList.remove("fa-pause");
          icon.classList.add("fa-play");
        }
      }
    });

    eventListenersAdded = true;
  };

  // ============================================
  // INITIALIZE HOME PAGE
  // ============================================

  const initHomePage = async () => {
    try {
      const [
        {
          data: { playlists },
        },
        {
          data: { artists },
        },
      ] = await Promise.all([playlistAPI.getAll(), artistAPI.getAll()]);

      elements.hitsGrid.innerHTML = playlistGrid.render(playlists);
      elements.artistsGrid.innerHTML = artistGrid.render(artists);

      attachCardEvents();

      // HIỂN THỊ LIBRARY CONTENT DỰA VÀO AUTH STATUS
      if (appState.isAuthenticated()) {
        const filterType = appState.getFilterType();
        const sortType = appState.getSortType();

        if (filterType === "playlist") {
          elements.navTabPlaylists.classList.add("active");
          elements.navTabArtists.classList.remove("active");
        } else if (filterType === "artist") {
          elements.navTabArtists.classList.add("active");
          elements.navTabPlaylists.classList.remove("active");
        }

        await libraryContent.render(filterType, null, sortType);
        attachLibraryEvents();
      } else {
        // NẾU CHƯA LOGIN - HIỂN THỊ MESSAGE
        elements.libraryContent.innerHTML = `
        <div style="padding: 24px; text-align: center; color: #b3b3b3;">
          <i class="fas fa-music" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
          <p style="font-size: 16px; font-weight: 600; margin-bottom: 8px; color: #fff;">Login or Signup to enjoy your songs</p>
          <p style="font-size: 14px;">Create playlists and follow your favorite artists</p>
        </div>
      `;
      }

      setupEventListeners();
      updatePlayerUIBasedOnAuth();
      updateBackButton(); 
    } catch (error) {
      console.error("Init error:", error);
      showToast("Failed to initialize app", "error");
    }
  };

  // ============================================
  // START APPLICATION
  // ============================================

  await initHomePage();
  console.log("✅ Spotify App Initialized");
});
