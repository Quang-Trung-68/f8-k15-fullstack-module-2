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
import { LibraryContent } from "./components/library/LibraryContent.js";
import { LibrarySearch } from "./components/library/LibrarySearch.js";
import { SortMenu } from "./components/library/SortMenu.js";
import { ContextMenu } from "./components/library/ContextMenu.js";

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
    homeButton: document.querySelector(".home-btn"),
    menuBtn: document.getElementById("menuBtn"),
    sidebar: document.querySelector(".sidebar"),
    closeMenuBtn: document.querySelector(".close-menu-icon"),

    // View mode
    viewModeButtons: document.querySelectorAll(".view-mode-btn"),
    viewAsIcon: document.querySelector(".fas-view-as"),
    sortByMode: document.querySelector(".sort-by-mode"),
  };

  // ============================================
  // STATE VARIABLES
  // ============================================
  let isCreatingPlaylist = false;
  let eventListenersAdded = false;

  // ============================================
  // INITIALIZE COMPONENTS
  // ============================================

  // Initialize Player
  const player = AudioPlayer(elements);
  window.player = player; // Expose globally for debugging

  // Set callback for when track changes
  player.setTrackChangeCallback((newIndex) => {
    const currentTracks = appState.getCurrentTracks();
    const artistId = appState.getCurrentArtistId();

    if (elements.popularSection && currentTracks.length > 0) {
      elements.popularSection.innerHTML = trackList.render(
        currentTracks,
        artistId
      );
      attachTrackEvents();
    }
  });

  // Initialize Grid Components
  const playlistGrid = PlaylistGrid();
  const artistGrid = ArtistGrid();
  const trackList = TrackList();
  const playlistHero = PlaylistHero();
  const artistHero = ArtistHero();

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
  });

  const userMenu = UserMenu(elements, async () => {
    elements.libraryContent.innerHTML = "";
    await initHomePage();
  });

  // Initialize all components
  authModal.init();
  userMenu.init();
  librarySearch.init();
  sortMenu.init();
  contextMenu.init();
  playlistModal.init();

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
        return;
      }
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

    // Remove active class from all library items
    removeAllLibraryActiveClasses();
  };

  // Helper function to remove active class from library items
  const removeAllLibraryActiveClasses = () => {
    document.querySelectorAll(".library-item").forEach((item) => {
      item.classList.remove("active");
    });
  };

  // Helper function to set active library item
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
      showUIPopular(true);

      elements.artistHero.innerHTML = playlistHero.render(playlist);

      const tracks = await playlistService.getTracks(playlist.id);
      elements.popularSection.innerHTML = trackList.render(tracks, null);

      appState.setCurrentTracks(tracks);
      appState.setCurrentArtistId(null);

      // Set active library item
      setActiveLibraryItem(playlistId, "playlist");

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
      showUIPopular(true);

      elements.artistHero.innerHTML = artistHero.render(artist);

      const tracks = await artistService.getPopularTracks(artist.id);
      elements.popularSection.innerHTML = trackList.render(tracks, artist.id);

      appState.setCurrentArtistId(artist.id);
      appState.setCurrentTracks(tracks);

      // Set active library item
      setActiveLibraryItem(artistId, "artist");

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
    // Attach context menu to items
    contextMenu.attachToItems();

    // Playlist click events
    document.querySelectorAll(".library-item-playlist").forEach((item) => {
      item.addEventListener("click", async () => {
        const playlistId = item.dataset.id;
        await renderPlaylistDetail(playlistId);
      });
    });

    // Artist click events
    document.querySelectorAll(".library-item-artist").forEach((item) => {
      item.addEventListener("click", async () => {
        const artistId = item.dataset.id;
        await renderArtistDetail(artistId);
      });
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

    elements.popularSection.addEventListener("click", async (e) => {
      // Handle like/unlike
      const likeBtn = e.target.closest(".track-is-liked");
      if (likeBtn) {
        e.stopPropagation();

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
      if (trackItem) {
        const index = Number(trackItem.dataset.indexSong);
        const artistId = trackItem.dataset.artistId || null;
        const currentTracks = appState.getCurrentTracks();

        if (currentTracks.length === 0) return;

        await player.loadNewPlaylist(currentTracks, artistId);
        player.currentIndex = index;
        appState.setCurrentIndex(index);

        player.loadCurrentSong();
        setTimeout(() => player.safePlay(), 200);

        elements.popularSection.innerHTML = trackList.render(
          currentTracks,
          artistId
        );
        attachTrackEvents();

        // Update large play button icon
        updateLargePlayButton();
      }
    });
  };

  const attachCardEvents = () => {
    // Playlist cards
    document.querySelectorAll(".hit-card").forEach((card) => {
      card.addEventListener(
        "click",
        requireAuth(async () => {
          const playlistId = card.dataset.id;
          await renderPlaylistDetail(playlistId);
        })
      );
    });

    // Artist cards
    document.querySelectorAll(".artist-card").forEach((card) => {
      card.addEventListener(
        "click",
        requireAuth(async () => {
          const artistId = card.dataset.id;
          await renderArtistDetail(artistId);
        })
      );
    });
  };

  // Helper function to update large play button icon
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

  const setupEventListeners = () => {
    if (eventListenersAdded) return;

    // Mobile menu
    elements.closeMenuBtn?.addEventListener("click", () => {
      elements.sidebar.classList.add("hide");
      elements.sidebar.classList.remove("show");
    });

    elements.menuBtn?.addEventListener("click", () => {
      elements.sidebar.classList.toggle("hide");
      elements.sidebar.classList.toggle("show");
    });

    // Home navigation
    [elements.logoIcon, elements.homeButton].forEach((el) => {
      el?.addEventListener("click", async () => {
        resetToHome();
        await initHomePage();
      });
    });

    // Library tabs
    elements.navTabPlaylists?.addEventListener("click", async () => {
      elements.navTabArtists.classList.remove("active");
      elements.navTabPlaylists.classList.add("active");
      appState.setFilterType("playlist");
      await libraryContent.render("playlist", null, appState.getSortType());
      attachLibraryEvents();
    });

    elements.navTabArtists?.addEventListener("click", async () => {
      elements.navTabPlaylists.classList.remove("active");
      elements.navTabArtists.classList.add("active");
      appState.setFilterType("artist");
      await libraryContent.render("artist", null, appState.getSortType());
      attachLibraryEvents();
    });

    // Search in main content
    elements.searchInput?.addEventListener("input", async (e) => {
      const searchValue = e.target.value.toLowerCase().trim();

      if (!searchValue) {
        await initHomePage();
        return;
      }

      try {
        const [
          {
            data: { playlists },
          },
          {
            data: { artists },
          },
        ] = await Promise.all([playlistAPI.getAll(), artistAPI.getAll()]);

        const filteredPlaylists = playlists.filter((p) =>
          p.name.toLowerCase().includes(searchValue)
        );
        const filteredArtists = artists.filter((a) =>
          a.name.toLowerCase().includes(searchValue)
        );

        elements.hitsGrid.innerHTML = playlistGrid.render(filteredPlaylists);
        elements.artistsGrid.innerHTML = artistGrid.render(filteredArtists);

        attachCardEvents();
      } catch (error) {
        console.error("Search error:", error);
      }
    });

    // Create playlist
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

    // Open playlist modal
    elements.playlistTitle?.addEventListener("click", () => {
      const playlist = {
        id: elements.playlistTitle.dataset.id,
        name: elements.playlistName.value,
        description: elements.playlistDesc.value,
        image_url: elements.coverPreviewImage.src,
      };
      playlistModal.open(playlist);
    });

    elements.playlistCoverImage?.addEventListener("click", () => {
      const playlist = {
        id: elements.playlistTitle.dataset.id,
        name: elements.playlistName.value,
        description: elements.playlistDesc.value,
        image_url: elements.coverPreviewImage.src,
      };
      playlistModal.open(playlist);
    });

    // UPDATED: Large play button with proper state checking
    elements.playBtnLarge?.addEventListener("click", async (e) => {
      e.preventDefault();

      const currentTracks = appState.getCurrentTracks();
      if (currentTracks.length === 0) return;

      const icon = elements.playBtnLarge.querySelector("i");

      // Check if we're playing the same playlist/artist
      const isSamePlaylist =
        player.songs.length > 0 &&
        player.audio.src !== "" &&
        JSON.stringify(currentTracks.map((t) => t.id || t.track_id)) ===
          JSON.stringify(player.songs.map((s) => s.id));

      if (!isSamePlaylist) {
        // Load new playlist
        await player.loadNewPlaylist(
          currentTracks,
          appState.getCurrentArtistId()
        );
        player.currentIndex = 0;
        appState.setCurrentIndex(0);
        player.loadCurrentSong();

        // Change icon to pause
        icon.classList.remove("fa-play");
        icon.classList.add("fa-pause");

        setTimeout(() => player.safePlay(), 200);

        elements.popularSection.innerHTML = trackList.render(
          currentTracks,
          appState.getCurrentArtistId()
        );
        attachTrackEvents();
      } else {
        // Toggle play/pause for same playlist
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
      }

      setupEventListeners();
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
