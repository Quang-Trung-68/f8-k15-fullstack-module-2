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
} from "./api/main.js";

// Xử lý Auth Modal và các chức năng chính
document.addEventListener("DOMContentLoaded", async function () {
  // Lấy tất cả DOM elements cần thiết
  const signupBtn = document.querySelector(".signup-btn");
  const loginBtn = document.querySelector(".login-btn");
  const authModal = document.getElementById("authModal");
  const modalClose = document.getElementById("modalClose");
  const signupForm = document.getElementById("signupForm");
  const loginForm = document.getElementById("loginForm");
  const showLoginBtn = document.getElementById("showLogin");
  const showSignupBtn = document.getElementById("showSignup");
  const actionButtons = document.querySelector(".auth-buttons");
  const sortBtn = document.querySelector(".sort-btn");
  const sortByTable = document.querySelector(".sort-by-table");
  const searchLibraryBtn = document.querySelector(".search-library-btn");
  const searchLibraryInput = document.querySelector(".search-library-input");
  const navTabPlaylists = document.querySelector(".nav-tab-playlists");
  const navTabArtists = document.querySelector(".nav-tab-artists");
  const menuPlaylist = document.getElementById("menuPlaylist");
  const menuArtist = document.getElementById("menuArtist");

  // Lấy trạng thái sort từ localStorage, mặc định là playlist
  let sortByPlaylist = localStorage.getItem("sortByPlaylist");

  // Cập nhật UI tabs dựa trên trạng thái sort
  if (!sortByPlaylist || sortByPlaylist === "true") {
    navTabPlaylists.classList.add("active");
    navTabArtists.classList.remove("active");
  } else {
    navTabPlaylists.classList.remove("active");
    navTabArtists.classList.add("active");
  }

  // Hiển thị form đăng ký
  function showSignupForm() {
    signupForm.style.display = "block";
    loginForm.style.display = "none";
  }

  // Hiển thị form đăng nhập
  function showLoginForm() {
    signupForm.style.display = "none";
    loginForm.style.display = "block";
  }

  // Mở modal auth
  function openModal() {
    authModal.classList.add("show");
    document.body.style.overflow = "hidden"; // Ngăn scroll background
  }

  // Đóng modal auth
  function closeModal() {
    authModal.classList.remove("show");
    document.body.style.overflow = "auto"; // Cho phép scroll lại
  }

  // Event listeners cho các nút mở modal
  signupBtn.addEventListener("click", function () {
    showSignupForm();
    openModal();
  });

  loginBtn.addEventListener("click", function () {
    showLoginForm();
    openModal();
  });

  // Event listeners đóng modal
  modalClose.addEventListener("click", closeModal);

  // Đóng modal khi click overlay
  authModal.addEventListener("click", function (e) {
    if (e.target === authModal) {
      closeModal();
    }
  });

  // Đóng modal bằng phím Escape
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && authModal.classList.contains("show")) {
      closeModal();
    }
  });

  // Chuyển đổi giữa login và signup form
  showLoginBtn.addEventListener("click", function () {
    showLoginForm();
  });

  showSignupBtn.addEventListener("click", function () {
    showSignupForm();
  });

  // Load thông tin user khi trang được tải
  async function onLoadUser() {
    try {
      const data = await getCurrentUser();
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const userName = document.querySelector(".user-name");
      userName.textContent = userInfo.display_name || data.user.display_name;
    } catch (error) {
      // Nếu chưa login thì hiển thị nút auth
      const actionButtons = document.querySelector(".auth-buttons");
      actionButtons.style.display = "flex";
      throw error;
    }
  }

  // Gọi load user khi khởi tạo
  onLoadUser();

  // Xử lý form đăng ký
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Lấy data từ form
    const displayName = document.querySelector("#displayName");
    const username = document.querySelector("#username");
    const signupEmail = document.querySelector("#signupEmail");
    const signupPassword = document.querySelector("#signupPassword");

    // Lấy elements để hiển thị lỗi
    const formGroupEmail = document.querySelector(".form-group-email");
    const formGroupPassword = document.querySelector(".form-group-password");
    const errorMessageEmail = document.querySelector(".error-message-email");
    const errorMessagePassword = document.querySelector(
      ".error-message-password"
    );

    const credentials = {
      email: signupEmail.value,
      password: signupPassword.value,
      username: username.value,
      display_name: displayName.value,
    };

    try {
      // Clear lỗi cũ
      formGroupEmail.classList.remove("invalid");
      formGroupPassword.classList.remove("invalid");

      // Gọi API đăng ký
      const data = await registerApi(credentials);
      const { user, access_token, refresh_token } = data;

      // Lưu tokens và user info
      localStorage.setItem("accessToken", access_token);
      localStorage.setItem("refreshToken", refresh_token);
      localStorage.setItem("userInfo", JSON.stringify(user));

      // Cập nhật UI
      const userName = document.querySelector(".user-name");
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      userName.textContent = userInfo.display_name;
      await onLoadUser();
      closeModal();
    } catch (error) {
      // Xử lý lỗi từ API
      const { code, details, message } = error.response.data.error;
      console.log(code, details, message);

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
  });

  // Xử lý form đăng nhập
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Lấy data từ form
    const loginEmail = document.querySelector("#loginEmail");
    const loginPassword = document.querySelector("#loginPassword");

    // Lấy elements để hiển thị lỗi
    const formGroupEmail = document.querySelector(".form-group-email");
    const formGroupPassword = document.querySelector(".form-group-password");
    const errorMessageEmail = document.querySelector(".error-message-email");
    const errorMessagePassword = document.querySelector(
      ".error-message-password"
    );

    const credentials = {
      email: loginEmail.value,
      password: loginPassword.value,
    };

    try {
      // Clear lỗi cũ
      formGroupEmail.classList.remove("invalid");
      formGroupPassword.classList.remove("invalid");

      // Gọi API đăng nhập
      const data = await loginApi(credentials);
      const { user, access_token, refresh_token } = data;

      // Lưu tokens và user info
      localStorage.setItem("accessToken", access_token);
      localStorage.setItem("refreshToken", refresh_token);
      localStorage.setItem("userInfo", JSON.stringify(user));

      // Cập nhật UI
      const userName = document.querySelector(".user-name");
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      userName.textContent = userInfo.display_name;
      actionButtons.style.display = "none";
      await onLoadUser();
      closeModal();
    } catch (error) {
      // Xử lý lỗi từ API
      console.log(error);
      const { code, details, message } = error.response.data.error;
      console.log(code, details, message);

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
  });

  // Xử lý tìm kiếm thư viện
  // Click nút search để hiện/ẩn ô input
  searchLibraryBtn.addEventListener("click", (e) => {
    e.stopPropagation(); // Tránh click lan ra ngoài
    searchLibraryInput.classList.toggle("show");
    if (searchLibraryInput.classList.contains("show")) {
      searchLibraryInput.focus(); // Tự động focus khi hiện
    }
  });

  // Click ra ngoài thì ẩn input
  document.addEventListener("click", (e) => {
    if (
      !searchLibraryInput.contains(e.target) &&
      !searchLibraryBtn.contains(e.target)
    ) {
      searchLibraryInput.classList.remove("show");
    }
  });

  // Xử lý phím Enter trong ô search
  searchLibraryInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      console.log(searchLibraryInput.value);
    }
  });

  // Xử lý nút Sort
  sortBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    sortByTable.classList.toggle("show");
  });

  // Click ra ngoài ẩn bảng sort
  document.addEventListener("click", (e) => {
    if (!sortByTable.contains(e.target) && !sortBtn.contains(e.target)) {
      sortByTable.classList.remove("show");
    }
  });

  // Xử lý navigation tabs
  navTabPlaylists.addEventListener("click", () => {
    navTabArtists.classList.remove("active");
    navTabPlaylists.classList.add("active");
    sortByPlaylist = true;
    localStorage.setItem("sortByPlaylist", true);
  });

  navTabArtists.addEventListener("click", () => {
    navTabPlaylists.classList.remove("active");
    navTabArtists.classList.add("active");
    sortByPlaylist = false;
    localStorage.setItem("sortByPlaylist", false);
  });

  // Xử lý context menu (menu chuột phải)
  // Ẩn tất cả menu
  function hideMenus() {
    menuPlaylist.style.display = "none";
    menuArtist.style.display = "none";
  }

  // Lắng nghe chuột phải trên các library item
  document.querySelectorAll(".library-item").forEach((item) => {
    item.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      hideMenus();

      let menu;
      if (item.classList.contains("library-item-playlist")) {
        menu = menuPlaylist;
      } else if (item.classList.contains("library-item-artist")) {
        menu = menuArtist;
      }

      if (menu) {
        menu.style.display = "block";
        menu.style.left = `${e.pageX}px`;
        menu.style.top = `${e.pageY}px`;
      }
    });
  });

  // Click ra ngoài ẩn menu
  document.addEventListener("click", () => hideMenus());

  // Click vào item menu
  [menuPlaylist, menuArtist].forEach((menu) => {
    menu.addEventListener("click", (e) => {
      if (e.target.tagName === "DIV") {
        alert(`Bạn chọn: ${e.target.innerText}`);
        hideMenus();
      }
    });
  });
});

// Xử lý User Menu Dropdown
document.addEventListener("DOMContentLoaded", function () {
  const userAvatar = document.getElementById("userAvatar");
  const userDropdown = document.getElementById("userDropdown");
  const logoutBtn = document.getElementById("logoutBtn");

  // Toggle dropdown khi click avatar
  userAvatar.addEventListener("click", function (e) {
    e.stopPropagation();
    userDropdown.classList.toggle("show");
  });

  // Đóng dropdown khi click ra ngoài
  document.addEventListener("click", function (e) {
    if (!userAvatar.contains(e.target) && !userDropdown.contains(e.target)) {
      userDropdown.classList.remove("show");
    }
  });

  // Đóng dropdown khi nhấn Escape
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && userDropdown.classList.contains("show")) {
      userDropdown.classList.remove("show");
    }
  });

  // Xử lý nút logout
  logoutBtn.addEventListener("click", function () {
    // Đóng dropdown trước
    userDropdown.classList.remove("show");

    // Xóa dữ liệu auth
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userInfo");

    // Cập nhật UI
    const userName = document.querySelector(".user-name");
    userName.textContent = "";
    const actionButtons = document.querySelector(".auth-buttons");
    actionButtons.style.display = "flex";
  });
});

// Các chức năng khác và render content
document.addEventListener("DOMContentLoaded", async function () {
  // Hàm format giây thành phút:giây hoặc giờ:phút:giây
  function formatSeconds(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    // Luôn 2 chữ số cho phút & giây
    const m = String(mins).padStart(2, "0");
    const s = String(secs).padStart(2, "0");

    if (hrs > 0) {
      return `${hrs}:${m}:${s}`; // Có giờ
    } else {
      return `${mins}:${s}`; // Chỉ phút:giây
    }
  }

  // Hàm format số với dấu phẩy
  function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  // Lấy DOM elements cho main content
  const hitsSection = document.querySelector(".hits-section");
  const artistsSection = document.querySelector(".artists-section");
  const artistHero = document.querySelector(".artist-hero");
  const artistControls = document.querySelector(".artist-controls");
  const popularSection = document.querySelector(".popular-section");
  const createPlaylistSection = document.querySelector(".create-playlist");
  const createPlaylistBtn = document.querySelector(".create-btn");
  const hitsGrid = document.querySelector(".hits-grid");
  const artistsGrid = document.querySelector(".artists-grid");
  const logoIcon = document.querySelector(".fa-spotify");
  const homeButton = document.querySelector(".home-btn");

  // Load dữ liệu playlists và artists
  const { playlists } = await getAllPlaylists();
  const { artists } = await getAllArtists();

  // Hàm hiển thị/ẩn UI phần popular (chi tiết playlist/artist)
  const showUIPopular = (isShow) => {
    if (isShow) {
      hitsSection.classList.add("hidden");
      artistsSection.classList.add("hidden");
      artistHero.classList.add("show");
      artistControls.classList.add("show");
      popularSection.classList.add("show");
    } else {
      hitsSection.classList.remove("hidden");
      artistsSection.classList.remove("hidden");
      artistHero.classList.remove("show");
      artistControls.classList.remove("show");
      popularSection.classList.remove("show");
    }
  };

  // Hàm hiển thị/ẩn UI tạo playlist
  const showUICreatePlaylist = (isShow) => {
    if (isShow) {
      hitsSection.classList.add("hidden");
      artistsSection.classList.add("hidden");
      artistHero.classList.remove("show");
      artistControls.classList.remove("show");
      popularSection.classList.remove("show");
      createPlaylistSection.classList.add("show");
    } else {
      createPlaylistSection.classList.remove("show");
    }
  };

  // Xử lý tạo playlist mới
  createPlaylistBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      showUICreatePlaylist(true);
      const { playlist } = await createPlaylist();
      const playlistTitle = document.querySelector(".playlist-title");
      playlistTitle.textContent = playlist.name;
      playlistTitle.dataset.id = playlist.id;
    } catch (error) {
      console.log(error);
      throw error;
    }
  });

  // Xử lý modal edit playlist
  const overlay = document.querySelector(".overlay");
  const modal = document.querySelector(".modal");
  const closeBtn = document.querySelector(".modal-close");
  const playlistTitle = document.querySelector(".playlist-title");
  const playlistImage = document.querySelector(".playlist-cover");

  // Hàm mở/đóng modal edit
  function openModal() {
    overlay.classList.remove("hidden");
    modal.classList.remove("hidden");
  }

  function closeModal() {
    overlay.classList.add("hidden");
    modal.classList.add("hidden");
  }

  // Event listeners cho modal
  playlistTitle.addEventListener("click", openModal);
  playlistImage.addEventListener("click", openModal);
  overlay.addEventListener("click", closeModal);
  closeBtn.addEventListener("click", closeModal);

  // Xử lý upload ảnh playlist
  const saveBtn = document.querySelector(".btn-save");
  let urlPlaylistCoverImage = null;
  const playlistName = document.querySelector(".playlist-name");
  const playlistDesc = document.querySelector(".playlist-desc");
  const fileInputPlaylistCover = document.querySelector(
    "#fileInputPlaylistCover"
  );
  const coverPreviewImage = document.querySelector(".cover-preview-image");
  const playlistCoverImage = document.querySelector(".playlist-cover-image");

  // Click để chọn file
  coverPreviewImage.addEventListener("click", async () => {
    fileInputPlaylistCover.click();
  });

  // Xử lý khi chọn file
  fileInputPlaylistCover.addEventListener("change", async () => {
    const file = fileInputPlaylistCover.files[0];
    if (file) {
      // Preview ảnh
      const reader = new FileReader();
      reader.onload = (e) => {
        coverPreviewImage.src = e.target.result;
        playlistCoverImage.src = e.target.result;
        coverPreviewImage.style.display = "block";
      };
      reader.readAsDataURL(file);

      // Upload lên server
      const formData = new FormData();
      formData.append("cover", file);

      try {
        const response = await uploadPlaylistCover(
          playlistTitle.dataset.id,
          formData
        );
        urlPlaylistCoverImage = response.file.url;
        console.log(response);
      } catch (error) {
        console.error("Upload error:", error);
      }
    }
  });

  // Lưu thay đổi playlist
  saveBtn.addEventListener("click", async () => {
    const playlistUpdateData = {
      name: playlistName.value,
      description: playlistDesc.value,
      image_url: urlPlaylistCoverImage,
    };

    try {
      const response = await updatePlaylist(
        playlistTitle.dataset.id,
        playlistUpdateData
      );
      console.log(response);
      const playlist = await getPlaylistById(playlistTitle.dataset.id);
      playlistTitle.textContent = playlist.name;
      playlistTitle.dataset.id = playlist.id;
    } catch (error) {
      throw error;
    } finally {
      closeModal();
    }
  });

  // Xử lý về trang chủ
  logoIcon.addEventListener("click", () => {
    showUIPopular(false);
    showUICreatePlaylist(false);
  });

  homeButton.addEventListener("click", () => {
    showUIPopular(false);
    showUICreatePlaylist(false);
  });

  // Render tất cả playlists
  const hitsGridHtml = playlists
    .map((playlist) => {
      return `
      <div data-id="${playlist.id}" class="hit-card">
        <div class="hit-card-cover">
          <img src="${playlist.image_url}" alt="${playlist.description}" />
          <button class="hit-play-btn">
            <i class="fas fa-play"></i>
          </button>
        </div>
        <div class="hit-card-info">
          <h3 class="hit-card-title">${playlist.name}</h3>
          <p class="hit-card-artist">${playlist.user_display_name}</p>
        </div>
      </div>
    `;
    })
    .join("");
  hitsGrid.innerHTML = hitsGridHtml;

  // Render tất cả artists
  const artistsGridHtml = artists
    .map((artist) => {
      return `
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
    `;
    })
    .join("");
  artistsGrid.innerHTML = artistsGridHtml;

  // Xử lý click vào playlist card
  const hitsCards = document.querySelectorAll(".hit-card");
  hitsCards.forEach((card) => {
    card.addEventListener("click", async () => {
      const playlist = await getPlaylistById(card.dataset.id);
      showUIPopular(true);

      // Render hero section cho playlist
      const artistHeroHtml = `
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

      artistHero.innerHTML = artistHeroHtml;

      // Xử lý nút follow/unfollow cho playlist
      const playlistFollowBtn = artistHero.querySelector(
        ".playlist-follow-btn"
      );
      if (playlistFollowBtn) {
        playlistFollowBtn.addEventListener("click", async (e) => {
          e.preventDefault();
          e.stopPropagation();

          const btn = e.target;
          const playlistId = btn.closest(".hero-content").dataset.id;
          const isFollowing = btn.dataset.following === "true";

          try {
            btn.disabled = true; // Disable button during API call

            if (isFollowing) {
              await unfollowPlaylist(playlistId);
              btn.textContent = "Follow";
              btn.dataset.following = "false";
            } else {
              await followPlaylist(playlistId);
              btn.textContent = "Unfollow";
              btn.dataset.following = "true";
            }
          } catch (error) {
            console.error("Error following/unfollowing playlist:", error);
            // Revert button state on error
            btn.textContent = isFollowing ? "Unfollow" : "Follow";
          } finally {
            btn.disabled = false; // Re-enable button
          }
        });
      }

      // Load và render tracks của playlist
      const { tracks } = await getTrackByPlaylist(playlist.id);
      if (tracks.length === 0) {
        const popularSectionHtml = `
        <h2 class="section-title">Popular</h2>
        <div class="track-list">No tracks in playlist</div>`;
        popularSection.innerHTML = popularSectionHtml;
      } else {
        const popularSectionHtml =
          `
        <h2 class="section-title">Popular</h2>
        <div class="track-list">` +
          tracks
            .map(
              (track, index) => `
            <div class="track-item">
                <div class="track-number">${index + 1}</div>
                <div class="track-image">
                  <img src="${track.image_url}" alt="${track.title}" />
                </div>
                <div class="track-info">
                  <div class="track-name">${track.title}</div>
                </div>
                <div class="track-plays">${track.play_count}</div>
                <div class="track-duration">${formatSeconds(
                  track.duration
                )}</div>
                <button class="track-menu-btn">
                  <i class="fas fa-ellipsis-h"></i>
                </button>
              </div>
            `
            )
            .join("") +
          `</div>`;
        popularSection.innerHTML = popularSectionHtml;
      }
    });
  });

  // Xử lý click vào artist card
  const artistsCards = document.querySelectorAll(".artist-card");
  artistsCards.forEach((card) => {
    card.addEventListener("click", async () => {
      const artist = await getArtistById(card.dataset.id);
      showUIPopular(true);

      // Render hero section cho artist
      const artistHeroHtml = `
      <div class="hero-background">
        <img src="${artist.image_url}" alt="${
        artist.name
      }" class="hero-image" />
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
        }">${artist.is_following ? "Unfollow" : "Follow"}</button>
      </div>`;

      artistHero.innerHTML = artistHeroHtml;

      // Xử lý nút follow/unfollow cho artist
      const artistFollowBtn = artistHero.querySelector(".artist-follow-btn");
      if (artistFollowBtn) {
        artistFollowBtn.addEventListener("click", async (e) => {
          e.preventDefault();
          e.stopPropagation();

          const btn = e.target;
          const artistId = btn.closest(".hero-content").dataset.id;
          const isFollowing = btn.dataset.following === "true";

          try {
            btn.disabled = true; // Disable button during API call

            if (isFollowing) {
              await unfollowArtist(artistId);
              btn.textContent = "Follow";
              btn.dataset.following = "false";
            } else {
              await followArtist(artistId);
              btn.textContent = "Unfollow";
              btn.dataset.following = "true";
            }
          } catch (error) {
            console.error("Error following/unfollowing artist:", error);
            // Revert button state on error
            btn.textContent = isFollowing ? "Unfollow" : "Follow";
          } finally {
            btn.disabled = false; // Re-enable button
          }
        });
      }

      // Load và render popular tracks của artist
      const { tracks } = await getArtistPopularTracks(artist.id);
      if (tracks.length === 0) {
        const popularSectionHtml = `
        <h2 class="section-title">Popular</h2>
        <div class="track-list">No tracks in playlist</div>`;
        popularSection.innerHTML = popularSectionHtml;
      } else {
        const popularSectionHtml =
          `
        <h2 class="section-title">Popular</h2>
        <div class="track-list">` +
          tracks
            .map(
              (track, index) => `
            <div class="track-item">
                <div class="track-number">${index + 1}</div>
                <div class="track-image">
                  <img src="${track.image_url}" alt="${track.title}" />
                </div>
                <div class="track-info">
                  <div class="track-name">${track.title}</div>
                </div>
                <div class="track-plays">${track.play_count}</div>
                <div class="track-duration">${formatSeconds(
                  track.duration
                )}</div>
                <button class="track-menu-btn">
                  <i class="fas fa-ellipsis-h"></i>
                </button>
              </div>
            `
            )
            .join("") +
          `</div>`;
        popularSection.innerHTML = popularSectionHtml;
      }
    });
  });
});
