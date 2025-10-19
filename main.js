import { AuthModal } from "./components/auth/AuthModal.js";
import { UserMenu } from "./components/auth/UserMenu.js";
import { appState } from "./state/appState.js";
import { playlistAPI, artistAPI } from "./api/endpoints.js";
import { playlistService } from "./services/playlistService.js";
import { artistService } from "./services/artistService.js";
import { trackService } from "./services/trackService.js";
import { DEFAULT_IMAGE } from "./utils/constants.js";
import {
  debounce,
  showToast,
  formatSeconds,
  formatNumber,
  formatTime,
} from "./utils/helpers.js";

document.addEventListener("DOMContentLoaded", async () => {
  const elements = {
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
    libraryContent: document.querySelector(".library-content"),
    navTabPlaylists: document.querySelector(".nav-tab-playlists"),
    navTabArtists: document.querySelector(".nav-tab-artists"),
    sortBtn: document.querySelector(".sort-btn"),
    sortByTable: document.querySelector(".sort-by-table"),
    searchLibraryBtn: document.querySelector(".search-library-btn"),
    searchLibraryInput: document.querySelector(".search-library-input"),
    menuPlaylist: document.getElementById("menuPlaylist"),
    menuArtist: document.getElementById("menuArtist"),
    hitsSection: document.querySelector(".hits-section"),
    artistsSection: document.querySelector(".artists-section"),
    hitsGrid: document.querySelector(".hits-grid"),
    artistsGrid: document.querySelector(".artists-grid"),
    searchInput: document.querySelector(".search-input"),
    logoIcon: document.querySelector(".fa-spotify"),
    homeButton: document.querySelector(".home-btn"),
    artistHero: document.querySelector(".artist-hero"),
    artistControls: document.querySelector(".artist-controls"),
    popularSection: document.querySelector(".popular-section"),
    playBtnLarge: document.querySelector(".play-btn-large"),
    createPlaylistSection: document.querySelector(".create-playlist"),
    createPlaylistBtn: document.querySelector(".create-btn"),
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
    menuBtn: document.getElementById("menuBtn"),
    sidebar: document.querySelector(".sidebar"),
    closeMenuBtn: document.querySelector(".close-menu-icon"),
    // ✅ View Mode elements
    viewModeButtons: document.querySelectorAll(".view-mode-btn"),
    viewAsIcon: document.querySelector(".fas-view-as"),
    sortByMode: document.querySelector(".sort-by-mode"),
  };

  let isCreatingPlaylist = false;
  let eventListenersAdded = false;
  let currentContextMenuId = null;
  let currentViewMode = appState.get("viewMode", "default-list"); // ✅ Lưu view mode

  const player = initializePlayer();
  window.player = player;

  const authModal = AuthModal(elements, async (user) => {
    userMenu.updateUI(user);
    await renderLibrary(appState.getFilterType(), null, appState.getSortType());
    await init();
  });

  const userMenu = UserMenu(elements, async () => {
    elements.libraryContent.innerHTML = "";
    await init();
  });

  authModal.init();
  userMenu.init();

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

  const renderLibrary = async (
    filterType,
    searchField = null,
    sortType = null
  ) => {
    try {
      const { playlists, artists } = await playlistService.getAllCombined(
        filterType,
        searchField,
        sortType
      );

      // ✅ Áp dụng view mode
      const viewClass = currentViewMode;
      elements.libraryContent.className = `library-content view-${viewClass}`;

      const playlistHtml = playlists
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

      const artistHtml = artists
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

      elements.libraryContent.innerHTML =
        filterType === "playlist"
          ? playlistHtml
          : filterType === "artist"
          ? artistHtml
          : playlistHtml + artistHtml;

      attachLibraryEvents();
    } catch (error) {
      console.error("Render library error:", error);
      elements.libraryContent.innerHTML =
        '<p style="padding: 20px; color: #999;">Failed to load library</p>';
    }
  };

  const renderTracks = (tracks, artistId = null) => {
    if (!tracks || tracks.length === 0) {
      return `<h2 class="section-title">Popular</h2><div class="track-list"><p style="color: #999;">No tracks available</p></div>`;
    }

    const currentIndex = appState.getCurrentIndex();
    const currentArtistId = appState.getCurrentArtistId();
    const currentTracks = appState.getCurrentTracks();
    const isCurrentPlaylist =
      JSON.stringify(currentTracks) === JSON.stringify(tracks);

    return `
      <h2 class="section-title">Popular</h2>
      <div class="track-list">
        ${tracks
          .map((track, index) => {
            const trackId = track.track_id || track.id;
            const isCurrentTrack =
              isCurrentPlaylist &&
              index === currentIndex &&
              (!artistId || artistId === currentArtistId);

            return `
            <div 
              title="${track.title || track.track_title}" 
              data-artist-id="${artistId || ""}" 
              data-index-song="${index}" 
              data-id="${trackId}" 
              class="track-item ${isCurrentTrack ? "playing" : ""}"
            >
              <div class="track-number">${index + 1}</div>
              <div class="track-image">
                <img src="${
                  track.image_url || track.track_image_url || DEFAULT_IMAGE
                }" 
                     alt="${track.title || track.track_title}" />
              </div>
              <div class="track-info">
                <div class="track-name">${
                  track.title || track.track_title
                }</div>
              </div>
              <div class="track-plays">${formatNumber(
                track.play_count || track.track_play_count || 0
              )}</div>
              <div title="${
                track.is_liked ? "Unlike" : "Like"
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

  const attachLibraryEvents = () => {
    document.querySelectorAll(".library-item-playlist").forEach((item) => {
      item.addEventListener("click", async () => {
        try {
          const playlistId = item.dataset.id;
          const playlist = await playlistService.getById(playlistId);

          showUIPopular(true);

          elements.artistHero.innerHTML = `
            <div class="hero-background">
              <img src="${playlist.image_url || DEFAULT_IMAGE}" alt="${
            playlist.name
          }" class="hero-image" />
              <div class="hero-overlay"></div>
            </div>
            <div class="hero-content" data-id="${
              playlist.id
            }" data-type="playlist">
              <div class="verified-badge"><span>Public playlist</span></div>
              <h1 class="artist-name">${playlist.name}</h1>
              <p class="monthly-listeners">${
                playlist.description || playlist.user_display_name
              }</p>
              ${
                !playlist.is_owner
                  ? `
                <button class="follow-btn playlist-follow-btn" data-id="${
                  playlist.id
                }" data-following="${playlist.is_following}">
                  ${playlist.is_following ? "Following" : "Follow"}
                </button>
              `
                  : '<button type="button" class="owner-btn">Owner</button>'
              }
            </div>
          `;

          const tracks = await playlistService.getTracks(playlist.id);
          elements.popularSection.innerHTML = renderTracks(tracks, null);

          appState.setCurrentTracks(tracks);
          appState.setCurrentArtistId(null);

          attachHeroEvents();
        } catch (error) {
          console.error("Load playlist error:", error);
          showToast("Failed to load playlist", "error");
        }
      });

      item.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        currentContextMenuId = item.dataset.id;
        elements.menuPlaylist.style.display = "block";
        elements.menuPlaylist.style.left = `${e.pageX}px`;
        elements.menuPlaylist.style.top = `${e.pageY}px`;
      });
    });

    document.querySelectorAll(".library-item-artist").forEach((item) => {
      item.addEventListener("click", async () => {
        try {
          const artistId = item.dataset.id;
          const artist = await artistService.getById(artistId);

          showUIPopular(true);

          elements.artistHero.innerHTML = `
            <div class="hero-background">
              <img src="${artist.image_url || DEFAULT_IMAGE}" alt="${
            artist.name
          }" class="hero-image" />
              <div class="hero-overlay"></div>
            </div>
            <div class="hero-content" data-id="${artist.id}" data-type="artist">
              ${
                artist.is_verified
                  ? '<div class="verified-badge"><i class="fas fa-check-circle"></i><span>Verified Artist</span></div>'
                  : ""
              }
              <h1 class="artist-name">${artist.name}</h1>
              <p class="monthly-listeners">${formatNumber(
                artist.monthly_listeners || 0
              )} monthly listeners</p>
              <button class="follow-btn artist-follow-btn" data-id="${
                artist.id
              }" data-following="${artist.is_following}">
                ${artist.is_following ? "Following" : "Follow"}
              </button>
            </div>
          `;

          const tracks = await artistService.getPopularTracks(artist.id);
          elements.popularSection.innerHTML = renderTracks(tracks, artist.id);

          appState.setCurrentArtistId(artist.id);
          appState.setCurrentTracks(tracks);

          attachHeroEvents();
        } catch (error) {
          console.error("Load artist error:", error);
          showToast("Failed to load artist", "error");
        }
      });

      item.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        currentContextMenuId = item.dataset.id;
        elements.menuArtist.style.display = "block";
        elements.menuArtist.style.left = `${e.pageX}px`;
        elements.menuArtist.style.top = `${e.pageY}px`;
      });
    });
  };

  const attachHeroEvents = () => {
    const playlistFollowBtn = document.querySelector(".playlist-follow-btn");
    if (playlistFollowBtn) {
      playlistFollowBtn.addEventListener(
        "click",
        requireAuth(async () => {
          try {
            const playlistId = playlistFollowBtn.dataset.id;
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

            await renderLibrary(
              appState.getFilterType(),
              null,
              appState.getSortType()
            );
          } catch (error) {
            console.error("Toggle follow error:", error);
            showToast("Failed to update follow status", "error");
          }
        })
      );
    }

    const artistFollowBtn = document.querySelector(".artist-follow-btn");
    if (artistFollowBtn) {
      artistFollowBtn.addEventListener(
        "click",
        requireAuth(async () => {
          try {
            const artistId = artistFollowBtn.dataset.id;
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

            await renderLibrary(
              appState.getFilterType(),
              null,
              appState.getSortType()
            );
          } catch (error) {
            console.error("Toggle follow error:", error);
            showToast("Failed to update follow status", "error");
          }
        })
      );
    }
  };

  const setupEventListeners = () => {
    if (eventListenersAdded) return;

    elements.closeMenuBtn?.addEventListener("click", () => {
      elements.sidebar.classList.add("hide");
      elements.sidebar.classList.remove("show");
    });

    elements.menuBtn?.addEventListener("click", () => {
      elements.sidebar.classList.toggle("hide");
      elements.sidebar.classList.toggle("show");
    });

    [elements.logoIcon, elements.homeButton].forEach((el) => {
      el?.addEventListener("click", async () => {
        document.title = "Spotify";
        showUIPopular(false);
        await init();
        elements.createPlaylistBtn.disabled = false;
        elements.createPlaylistBtn.style.display = "block";
        showUICreatePlaylist(false);
      });
    });

    elements.navTabPlaylists?.addEventListener("click", async () => {
      elements.navTabArtists.classList.remove("active");
      elements.navTabPlaylists.classList.add("active");
      appState.setFilterType("playlist");
      await renderLibrary("playlist", null, appState.getSortType());
    });

    elements.navTabArtists?.addEventListener("click", async () => {
      elements.navTabPlaylists.classList.remove("active");
      elements.navTabArtists.classList.add("active");
      appState.setFilterType("artist");
      await renderLibrary("artist", null, appState.getSortType());
    });

    elements.searchLibraryBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      elements.searchLibraryInput.classList.toggle("show");
      if (elements.searchLibraryInput.classList.contains("show")) {
        elements.searchLibraryInput.focus();
      }
    });

    elements.searchLibraryInput?.addEventListener(
      "input",
      debounce(async () => {
        const searchValue = elements.searchLibraryInput.value;
        await renderLibrary(
          appState.getFilterType(),
          searchValue,
          appState.getSortType()
        );
      }, 800)
    );

    elements.sortBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      elements.sortByTable.classList.toggle("show");
    });

    document.querySelectorAll(".sort-by-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const sortType = btn.dataset.sort;
        appState.setSortType(sortType);
        elements.sortByMode.textContent = sortType;
        await renderLibrary(
          appState.getFilterType(),
          elements.searchLibraryInput.value,
          sortType
        );
        elements.sortByTable.classList.remove("show");
      });
    });

    elements.menuPlaylist?.addEventListener("click", async (e) => {
      if (e.target.closest(".context-menu-remove")) {
        try {
          await playlistService.unfollow(currentContextMenuId);
          await renderLibrary(
            appState.getFilterType(),
            null,
            appState.getSortType()
          );
          showUIPopular(false);
          await init();
          elements.createPlaylistBtn.disabled = false;
          elements.createPlaylistBtn.style.display = "block";
          showToast("Playlist removed from library", "success");
        } catch (error) {
          console.error("Unfollow error:", error);
          showToast("Failed to remove playlist", "error");
        }
      } else if (e.target.closest(".context-menu-delete")) {
        try {
          await playlistService.delete(currentContextMenuId);
          await renderLibrary(
            appState.getFilterType(),
            null,
            appState.getSortType()
          );
          showUIPopular(false);
          await init();
          elements.createPlaylistBtn.disabled = false;
          elements.createPlaylistBtn.style.display = "block";
          showToast("Playlist deleted", "success");
        } catch (error) {
          console.error("Delete error:", error);
          showToast("Failed to delete playlist", "error");
        }
      }
      elements.menuPlaylist.style.display = "none";
    });

    elements.menuArtist?.addEventListener("click", async (e) => {
      if (e.target.closest(".context-menu-unfollow")) {
        try {
          await artistService.unfollow(currentContextMenuId);
          await renderLibrary(
            appState.getFilterType(),
            null,
            appState.getSortType()
          );
          showUIPopular(false);
          await init();
          elements.createPlaylistBtn.disabled = false;
          elements.createPlaylistBtn.style.display = "block";
          showToast("Artist unfollowed", "success");
        } catch (error) {
          console.error("Unfollow error:", error);
          showToast("Failed to unfollow artist", "error");
        }
      }
      elements.menuArtist.style.display = "none";
    });

    document.addEventListener("click", () => {
      elements.menuPlaylist.style.display = "none";
      elements.menuArtist.style.display = "none";
      elements.sortByTable?.classList.remove("show");
    });

    // ✅ View Mode buttons
    elements.viewModeButtons?.forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const viewMode = btn.dataset.view;

        if (!viewMode) return;

        currentViewMode = viewMode;
        appState.set("viewMode", viewMode);

        // Cập nhật active state
        elements.viewModeButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        elements.sortByTable.classList.remove("show");
        if (viewMode === "compact-list")
          elements.viewAsIcon.className = "fas fa-list";
        else if (viewMode === "default-list")
          elements.viewAsIcon.className = "fas fa-bars";
        else if (viewMode === "compact-grid")
          elements.viewAsIcon.className = "fas fa-th";
        else if (viewMode === "default-grid")
          elements.viewAsIcon.className = "fas fa-th-large";
        // Re-render với view mode mới
        await renderLibrary(
          appState.getFilterType(),
          elements.searchLibraryInput?.value || null,
          appState.getSortType()
        );
      });
    });

    elements.searchInput?.addEventListener(
      "input",
      debounce(async () => {
        const searchValue = elements.searchInput.value.toLowerCase().trim();

        if (!searchValue) {
          await init();
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

          elements.hitsGrid.innerHTML = filteredPlaylists
            .map(
              (p) => `
          <div title="${p.name}" data-id="${p.id}" class="hit-card">
            <div class="hit-card-cover">
              <img src="${p.image_url || DEFAULT_IMAGE}" alt="${p.name}" />
              <button class="hit-play-btn"><i class="fas fa-play"></i></button>
            </div>
            <div class="hit-card-info">
              <h3 class="hit-card-title">${p.name}</h3>
              <p class="hit-card-artist">${p.user_display_name}</p>
            </div>
          </div>
        `
            )
            .join("");

          elements.artistsGrid.innerHTML = filteredArtists
            .map(
              (a) => `
          <div title="${a.name}" data-id="${a.id}" class="artist-card">
            <div class="artist-card-cover">
              <img src="${a.image_url || DEFAULT_IMAGE}" alt="${a.name}" />
              <button class="artist-play-btn"><i class="fas fa-play"></i></button>
            </div>
            <div class="artist-card-info">
              <h3 class="artist-card-name">${a.name}</h3>
              <p class="artist-card-type">${a.bio || "Artist"}</p>
            </div>
          </div>
        `
            )
            .join("");

          attachCardEvents();
        } catch (error) {
          console.error("Search error:", error);
        }
      }, 800)
    );

    elements.createPlaylistBtn?.addEventListener(
      "click",
      requireAuth(async (e) => {
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

          // ✅ Lưu image_url hiện tại vào dataset để dùng khi save
          elements.playlistTitle.dataset.imageUrl = playlist.image_url;

          await renderLibrary(
            appState.getFilterType(),
            null,
            appState.getSortType()
          );
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

    // ✅ Click vào cả image thumbnail và title đều mở modal
    elements.playlistTitle?.addEventListener("click", () => {
      elements.overlay.classList.remove("hidden");
      elements.modal.classList.remove("hidden");
    });

    elements.playlistCoverImage?.addEventListener("click", () => {
      elements.overlay.classList.remove("hidden");
      elements.modal.classList.remove("hidden");
    });

    elements.overlay?.addEventListener("click", () => {
      elements.overlay.classList.add("hidden");
      elements.modal.classList.add("hidden");
    });

    elements.modalCloseBtn?.addEventListener("click", () => {
      elements.overlay.classList.add("hidden");
      elements.modal.classList.add("hidden");
    });

    elements.coverPreviewImage?.addEventListener("click", () => {
      elements.fileInputPlaylistCover.click();
    });

    elements.fileInputPlaylistCover?.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // ✅ Preview ảnh ngay lập tức
      const reader = new FileReader();
      reader.onload = (e) => {
        elements.coverPreviewImage.src = e.target.result;
        elements.playlistCoverImage.src = e.target.result;
      };
      reader.readAsDataURL(file);

      try {
        const url = await playlistService.uploadCover(
          elements.playlistTitle.dataset.id,
          file
        );
        // ✅ Lưu URL mới vào dataset để dùng khi save
        elements.playlistTitle.dataset.imageUrl = url;
        showToast("Cover uploaded successfully", "success");
      } catch (error) {
        console.error("Upload error:", error);
        showToast("Failed to upload cover", "error");
      } finally {
        // ✅ Reset input để có thể chọn lại cùng file
        e.target.value = "";
      }
    });

    elements.saveBtn?.addEventListener("click", async () => {
      const playlistId = elements.playlistTitle.dataset.id;
      const imageUrl = elements.playlistTitle.dataset.imageUrl; // ✅ Lấy URL đã upload

      const data = {
        name: elements.playlistName.value,
        description: elements.playlistDesc.value,
      };

      // ✅ Chỉ gửi image_url nếu đã thay đổi
      if (imageUrl) {
        data.image_url = imageUrl;
      }

      try {
        await playlistService.update(playlistId, data);
        elements.playlistTitle.textContent = data.name;
        elements.overlay.classList.add("hidden");
        elements.modal.classList.add("hidden");
        await renderLibrary(
          appState.getFilterType(),
          null,
          appState.getSortType()
        );
        showToast("Playlist updated successfully", "success");
      } catch (error) {
        console.error("Save error:", error);
        showToast("Failed to update playlist", "error");
      }
    });

    document.addEventListener("click", async (e) => {
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

            elements.popularSection.innerHTML = renderTracks(
              currentTracks,
              appState.getCurrentArtistId()
            );

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

      const trackItem = e.target.closest(".track-item");
      if (trackItem) {
        const index = Number(trackItem.dataset.indexSong);
        const artistId = trackItem.dataset.artistId || null;
        const currentTracks = appState.getCurrentTracks();

        if (currentTracks.length === 0) return;

        await player.loadNewPlaylist(currentTracks, artistId);

        player.currentIndex = index;
        appState.setCurrentIndex(index);

        if (artistId) {
          appState.setCurrentArtistId(artistId);
        }

        player.loadCurrentSong();
        setTimeout(() => player.safePlay(), 200);

        elements.popularSection.innerHTML = renderTracks(
          currentTracks,
          artistId
        );
      }
    });

    elements.playBtnLarge?.addEventListener("click", async (e) => {
      e.preventDefault();

      const currentTracks = appState.getCurrentTracks();
      if (currentTracks.length === 0) return;

      if (player.songs.length === 0 || player.audio.src === "") {
        await player.loadNewPlaylist(
          currentTracks,
          appState.getCurrentArtistId()
        );
        player.currentIndex = 0;
        appState.setCurrentIndex(0);
        player.loadCurrentSong();
        setTimeout(() => player.safePlay(), 200);

        elements.popularSection.innerHTML = renderTracks(
          currentTracks,
          appState.getCurrentArtistId()
        );
      } else {
        player.audio.paused ? await player.safePlay() : player.safePause();
      }
    });

    eventListenersAdded = true;
  };

  const attachCardEvents = () => {
    document.querySelectorAll(".hit-card").forEach((card) => {
      card.addEventListener(
        "click",
        requireAuth(async () => {
          try {
            const playlistId = card.dataset.id;
            const playlist = await playlistService.getById(playlistId);

            showUIPopular(true);

            elements.artistHero.innerHTML = `
            <div class="hero-background">
              <img src="${playlist.image_url || DEFAULT_IMAGE}" alt="${
              playlist.name
            }" class="hero-image" />
              <div class="hero-overlay"></div>
            </div>
            <div class="hero-content" data-id="${
              playlist.id
            }" data-type="playlist">
              <div class="verified-badge"><span>Public playlist</span></div>
              <h1 class="artist-name">${playlist.name}</h1>
              <p class="monthly-listeners">${
                playlist.description || playlist.user_display_name
              }</p>
              ${
                !playlist.is_owner
                  ? `
                <button class="follow-btn playlist-follow-btn" data-id="${
                  playlist.id
                }" data-following="${playlist.is_following}">
                  ${playlist.is_following ? "Following" : "Follow"}
                </button>
              `
                  : '<button type="button" class="owner-btn">Owner</button>'
              }
            </div>
          `;

            const tracks = await playlistService.getTracks(playlist.id);
            elements.popularSection.innerHTML = renderTracks(tracks, null);

            appState.setCurrentTracks(tracks);
            appState.setCurrentArtistId(null);

            attachHeroEvents();
          } catch (error) {
            console.error("Load playlist error:", error);
            showToast("Failed to load playlist", "error");
          }
        })
      );
    });

    document.querySelectorAll(".artist-card").forEach((card) => {
      card.addEventListener(
        "click",
        requireAuth(async () => {
          try {
            const artistId = card.dataset.id;
            const artist = await artistService.getById(artistId);

            showUIPopular(true);

            elements.artistHero.innerHTML = `
            <div class="hero-background">
              <img src="${artist.image_url || DEFAULT_IMAGE}" alt="${
              artist.name
            }" class="hero-image" />
              <div class="hero-overlay"></div>
            </div>
            <div class="hero-content" data-id="${artist.id}" data-type="artist">
              ${
                artist.is_verified
                  ? '<div class="verified-badge"><i class="fas fa-check-circle"></i><span>Verified Artist</span></div>'
                  : ""
              }
              <h1 class="artist-name">${artist.name}</h1>
              <p class="monthly-listeners">${formatNumber(
                artist.monthly_listeners || 0
              )} monthly listeners</p>
              <button class="follow-btn artist-follow-btn" data-id="${
                artist.id
              }" data-following="${artist.is_following}">
                ${artist.is_following ? "Following" : "Follow"}
              </button>
            </div>
          `;

            const tracks = await artistService.getPopularTracks(artist.id);
            elements.popularSection.innerHTML = renderTracks(tracks, artist.id);

            appState.setCurrentArtistId(artist.id);
            appState.setCurrentTracks(tracks);

            attachHeroEvents();
          } catch (error) {
            console.error("Load artist error:", error);
            showToast("Failed to load artist", "error");
          }
        })
      );
    });
  };

  const init = async () => {
    try {
      const [
        {
          data: { playlists },
        },
        {
          data: { artists },
        },
      ] = await Promise.all([playlistAPI.getAll(), artistAPI.getAll()]);

      elements.hitsGrid.innerHTML = playlists
        .map(
          (p) => `
        <div title="${p.name}" data-id="${p.id}" class="hit-card">
          <div class="hit-card-cover">
            <img src="${p.image_url || DEFAULT_IMAGE}" alt="${p.name}" />
            <button class="hit-play-btn"><i class="fas fa-play"></i></button>
          </div>
          <div class="hit-card-info">
            <h3 class="hit-card-title">${p.name}</h3>
            <p class="hit-card-artist">${p.user_display_name}</p>
          </div>
        </div>
      `
        )
        .join("");

      elements.artistsGrid.innerHTML = artists
        .map(
          (a) => `
        <div title="${a.name}" data-id="${a.id}" class="artist-card">
          <div class="artist-card-cover">
            <img src="${a.image_url || DEFAULT_IMAGE}" alt="${a.name}" />
            <button class="artist-play-btn"><i class="fas fa-play"></i></button>
          </div>
          <div class="artist-card-info">
            <h3 class="artist-card-name">${a.name}</h3>
            <p class="artist-card-type">${a.bio || "Artist"}</p>
          </div>
        </div>
      `
        )
        .join("");

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

        // ✅ Set active view mode
        const savedViewMode = appState.get("viewMode", "default-list");
        currentViewMode = savedViewMode;
        elements.viewModeButtons.forEach((btn) => {
          if (btn.dataset.view === savedViewMode) {
            btn.classList.add("active");
          }
        });

        await renderLibrary(filterType, null, sortType);
      }

      setupEventListeners();
    } catch (error) {
      console.error("Init error:", error);
      showToast("Failed to initialize app", "error");
    }
  };

  function initializePlayer() {
    const player = {
      audio: document.querySelector(".player-audio"),
      playerImage: document.querySelector(".player-image"),
      playerTitle: document.querySelector(".player-title"),
      playerArtist: document.querySelector(".player-artist"),
      playBtn: document.querySelector(".play-btn"),
      nextBtn: document.querySelector(".control-btn:has(.fa-step-forward)"),
      prevBtn: document.querySelector(".control-btn:has(.fa-step-backward)"),
      shuffleBtn: document.querySelector(".control-btn:has(.fa-random)"),
      repeatBtn: document.querySelector(".control-btn:has(.fa-redo)"),
      progressBar: document.querySelector(".progress-bar"),
      progressFill: document.querySelector(".progress-fill"),
      currentTimeEl: document.querySelector(
        ".progress-container .time:first-child"
      ),
      totalTimeEl: document.querySelector(
        ".progress-container .time:last-child"
      ),
      volumeBar: document.querySelector(".volume-bar"),
      volumeFill: document.querySelector(".volume-fill"),

      songs: [],
      currentIndex: 0,
      isRepeat: false,
      isShuffle: false,
      isTransitioning: false,

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

      loadCurrentSong() {
        if (this.songs.length === 0) return;
        const song = this.songs[this.currentIndex];
        this.playerTitle.textContent = song.name;
        this.playerArtist.textContent = song.artist;
        this.playerImage.src = song.pathThumb;
        this.audio.src = song.path;
        this.audio.load();
      },

      async loadNewPlaylist(tracks, artistId = null) {
        this.safePause();
        this.audio.src = "";

        this.songs = tracks.map((track) => ({
          id: track.id || track.track_id,
          name: track.title || track.track_title,
          path: track.audio_url || track.track_audio_url,
          artist: track.artist_name || track.track_artist_name,
          pathThumb: track.image_url || track.track_image_url || DEFAULT_IMAGE,
          duration: track.duration || track.track_duration,
        }));

        this.currentIndex = 0;
        appState.setCurrentIndex(0);
        appState.setCurrentTracks(tracks);
        if (artistId) appState.setCurrentArtistId(artistId);

        if (this.songs.length > 0) this.loadCurrentSong();
      },

      async changeIndexSong(step) {
        if (this.songs.length === 0 || this.isTransitioning) return;
        this.safePause();

        if (!this.isShuffle) {
          this.currentIndex =
            (this.currentIndex + step + this.songs.length) % this.songs.length;
        } else {
          this.currentIndex = Math.floor(Math.random() * this.songs.length);
        }

        appState.setCurrentIndex(this.currentIndex);
        this.loadCurrentSong();

        const currentTracks = appState.getCurrentTracks();
        const artistId = appState.getCurrentArtistId();
        if (elements.popularSection && currentTracks.length > 0) {
          elements.popularSection.innerHTML = renderTracks(
            currentTracks,
            artistId
          );
        }

        setTimeout(() => this.safePlay(), 200);
      },

      init() {
        const tracks = appState.getCurrentTracks();
        if (tracks.length > 0) {
          this.songs = tracks.map((track) => ({
            id: track.id || track.track_id,
            name: track.title || track.track_title,
            path: track.audio_url || track.track_audio_url,
            artist: track.artist_name || track.track_artist_name,
            pathThumb:
              track.image_url || track.track_image_url || DEFAULT_IMAGE,
            duration: track.duration || track.track_duration,
          }));
          this.currentIndex = appState.getCurrentIndex();
          this.loadCurrentSong();
        }

        this.playBtn?.addEventListener("click", async () => {
          if (this.songs.length === 0) return;
          this.audio.paused ? await this.safePlay() : this.safePause();
        });

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

        this.audio.addEventListener("timeupdate", () => {
          if (this.audio.duration) {
            const percent =
              (this.audio.currentTime / this.audio.duration) * 100;
            this.progressFill.style.width = percent + "%";
            this.currentTimeEl.textContent = formatTime(this.audio.currentTime);
          }
        });

        this.audio.addEventListener("ended", async () => {
          if (this.isRepeat) {
            await this.safePlay();
          } else {
            await this.changeIndexSong(1);
          }
        });

        this.nextBtn?.addEventListener("click", () => this.changeIndexSong(1));
        this.prevBtn?.addEventListener("click", () => this.changeIndexSong(-1));

        this.repeatBtn?.addEventListener("click", () => {
          this.isRepeat = !this.isRepeat;
          this.repeatBtn.classList.toggle("active", this.isRepeat);
        });

        this.shuffleBtn?.addEventListener("click", () => {
          this.isShuffle = !this.isShuffle;
          this.shuffleBtn.classList.toggle("active", this.isShuffle);
        });

        this.progressBar?.addEventListener("click", (e) => {
          if (!this.audio.duration) return;
          const rect = this.progressBar.getBoundingClientRect();
          const percent = (e.clientX - rect.left) / rect.width;
          this.audio.currentTime = percent * this.audio.duration;
        });

        this.volumeBar?.addEventListener("click", (e) => {
          const rect = this.volumeBar.getBoundingClientRect();
          const percent = (e.clientX - rect.left) / rect.width;
          this.audio.volume = Math.max(0, Math.min(1, percent));
          this.volumeFill.style.width = this.audio.volume * 100 + "%";
        });

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
      },
    };

    player.init();
    return player;
  }

  await init();
  console.log("✅ Spotify App Initialized - Player only plays on track click");
});
