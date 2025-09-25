// Call api
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
} from "./api/main.js";

// Auth Modal Functionality
document.addEventListener("DOMContentLoaded", async function () {
  // Get DOM elements
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
  let sortByPlaylist = localStorage.getItem("sortByPlaylist");
  const menuPlaylist = document.getElementById("menuPlaylist");
  const menuArtist = document.getElementById("menuArtist");

  if (!sortByPlaylist || sortByPlaylist === "true") {
    navTabPlaylists.classList.add("active");
    navTabArtists.classList.remove("active");
  } else {
    navTabPlaylists.classList.remove("active");
    navTabArtists.classList.add("active");
  }

  // Function to show signup form
  function showSignupForm() {
    signupForm.style.display = "block";
    loginForm.style.display = "none";
  }

  // Function to show login form
  function showLoginForm() {
    signupForm.style.display = "none";
    loginForm.style.display = "block";
  }

  // Function to open modal
  function openModal() {
    authModal.classList.add("show");
    document.body.style.overflow = "hidden"; // Prevent background scrolling
  }

  // Open modal with Sign Up form when clicking Sign Up button
  signupBtn.addEventListener("click", function () {
    showSignupForm();
    openModal();
  });

  // Open modal with Login form when clicking Login button
  loginBtn.addEventListener("click", function () {
    showLoginForm();
    openModal();
  });

  // Close modal function
  function closeModal() {
    authModal.classList.remove("show");
    document.body.style.overflow = "auto"; // Restore scrolling
  }

  // Close modal when clicking close button
  modalClose.addEventListener("click", closeModal);

  // Close modal when clicking overlay (outside modal container)
  authModal.addEventListener("click", function (e) {
    if (e.target === authModal) {
      closeModal();
    }
  });

  // Close modal with Escape key
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && authModal.classList.contains("show")) {
      closeModal();
    }
  });

  // Switch to Login form
  showLoginBtn.addEventListener("click", function () {
    showLoginForm();
  });

  // Switch to Signup form
  showSignupBtn.addEventListener("click", function () {
    showSignupForm();
  });

  async function onLoadUser() {
    //   Try load data user
    try {
      const data = await getCurrentUser();
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const userName = document.querySelector(".user-name");
      userName.textContent = userInfo.display_name || data.user.display_name;
      // console.log(data);
    } catch (error) {
      const actionButtons = document.querySelector(".auth-buttons");
      actionButtons.style.display = "flex";
      throw error;
    }
  }

  //   Try first load user from localstorage
  onLoadUser();

  //   Submit action
  //   Signup
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const displayName = document.querySelector("#displayName");
    const username = document.querySelector("#username");
    const signupEmail = document.querySelector("#signupEmail");
    const signupPassword = document.querySelector("#signupPassword");
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
      formGroupEmail.classList.remove("invalid");
      formGroupPassword.classList.remove("invalid");
      const data = await registerApi(credentials);
      const { user, access_token, refresh_token } = data;
      localStorage.setItem("accessToken", access_token);
      localStorage.setItem("refreshToken", refresh_token);
      localStorage.setItem("userInfo", JSON.stringify(user));
      const userName = document.querySelector(".user-name");
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      userName.textContent = userInfo.display_name;
      await onLoadUser();
      closeModal();
    } catch (error) {
      const { code, details, message } = error.response.data.error;
      console.log(code, details, message);
      if (details)
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
      if (message) {
        formGroupEmail.classList.add("invalid");
        errorMessageEmail.textContent = message;
      }
      throw error;
    }
  });

  //   Login
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const loginEmail = document.querySelector("#loginEmail");
    const loginPassword = document.querySelector("#loginPassword");
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
      formGroupEmail.classList.remove("invalid");
      formGroupPassword.classList.remove("invalid");
      const data = await loginApi(credentials);
      const { user, access_token, refresh_token } = data;
      localStorage.setItem("accessToken", access_token);
      localStorage.setItem("refreshToken", refresh_token);
      localStorage.setItem("userInfo", JSON.stringify(user));
      const userName = document.querySelector(".user-name");
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      userName.textContent = userInfo.display_name;
      actionButtons.style.display = "none";
      await onLoadUser();
      closeModal();
    } catch (error) {
      console.log(error);
      const { code, details, message } = error.response.data.error;
      console.log(code, details, message);
      if (details)
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
      if (message) {
        formGroupEmail.classList.add("invalid");
        errorMessageEmail.textContent = message;
      }
      throw error;
    }
  });

  // Search library

  // Bấm nút search -> hiện/ẩn ô input
  searchLibraryBtn.addEventListener("click", (e) => {
    e.stopPropagation(); // tránh click lan ra ngoài
    searchLibraryInput.classList.toggle("show");
    if (searchLibraryInput.classList.contains("show")) {
      searchLibraryInput.focus(); // tự động focus khi hiện
    }
  });

  // Nếu click ra ngoài thì ẩn input
  document.addEventListener("click", (e) => {
    if (
      !searchLibraryInput.contains(e.target) &&
      !searchLibraryBtn.contains(e.target)
    ) {
      searchLibraryInput.classList.remove("show");
    }
  });

  // Bắt sự kiện Enter trong ô input
  searchLibraryInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      console.log(searchLibraryInput.value);
    }
  });

  // Sort by button
  sortBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    sortByTable.classList.toggle("show");
  });

  document.addEventListener("click", (e) => {
    if (!sortByTable.contains(e.target) && !sortBtn.contains(e.target)) {
      sortByTable.classList.remove("show");
    }
  });

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

  // Custom context menu
  // Ẩn tất cả menu
  function hideMenus() {
    menuPlaylist.style.display = "none";
    menuArtist.style.display = "none";
  }

  // Lắng nghe chuột phải trên các item
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

// User Menu Dropdown Functionality
document.addEventListener("DOMContentLoaded", function () {
  const userAvatar = document.getElementById("userAvatar");
  const userDropdown = document.getElementById("userDropdown");
  const logoutBtn = document.getElementById("logoutBtn");

  // Toggle dropdown when clicking avatar
  userAvatar.addEventListener("click", function (e) {
    e.stopPropagation();
    userDropdown.classList.toggle("show");
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", function (e) {
    if (!userAvatar.contains(e.target) && !userDropdown.contains(e.target)) {
      userDropdown.classList.remove("show");
    }
  });

  // Close dropdown when pressing Escape
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && userDropdown.classList.contains("show")) {
      userDropdown.classList.remove("show");
    }
  });

  // Handle logout button click
  logoutBtn.addEventListener("click", function () {
    // Close dropdown first
    userDropdown.classList.remove("show");

    ////logout login
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userInfo");
    const userName = document.querySelector(".user-name");
    userName.textContent = "";
    const actionButtons = document.querySelector(".auth-buttons");
    actionButtons.style.display = "flex";
  });
});

// Other functionality
document.addEventListener("DOMContentLoaded", async function () {
  // Format seconds
  function formatSeconds(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    // Luôn 2 chữ số cho phút & giây
    const m = String(mins).padStart(2, "0");
    const s = String(secs).padStart(2, "0");

    if (hrs > 0) {
      return `${hrs}:${m}:${s}`; // có giờ
    } else {
      return `${mins}:${s}`; // chỉ phút:giây
    }
  }
  // format number listeners
  function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  //   Render all playlists
  const hitsSection = document.querySelector(".hits-section");
  const artistsSection = document.querySelector(".artists-section");
  const artistHero = document.querySelector(".artist-hero");
  const artistControls = document.querySelector(".artist-controls");
  const popularSection = document.querySelector(".popular-section");
  const createPlaylistSection = document.querySelector(".create-playlist");
  const createPlaylistBtn = document.querySelector(".create-btn");
  const hitsGrid = document.querySelector(".hits-grid");
  const { playlists } = await getAllPlaylists();
  const artistsGrid = document.querySelector(".artists-grid");
  const { artists } = await getAllArtists();

  const logoIcon = document.querySelector(".fa-spotify");
  const homeButton = document.querySelector(".home-btn");

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

  // create my playlist
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

  // modal edits playlist
  const overlay = document.querySelector(".overlay");
  const modal = document.querySelector(".modal");
  const closeBtn = document.querySelector(".modal-close");

  //
  const playlistTitle = document.querySelector(".playlist-title");
  const playlistImage = document.querySelector(".playlist-cover");

  function openModal() {
    overlay.classList.remove("hidden");
    modal.classList.remove("hidden");
  }

  function closeModal() {
    overlay.classList.add("hidden");
    modal.classList.add("hidden");
  }

  playlistTitle.addEventListener("click", openModal);
  playlistImage.addEventListener("click", openModal);
  overlay.addEventListener("click", closeModal);
  closeBtn.addEventListener("click", closeModal);

  // upload image to get url image
  const saveBtn = document.querySelector(".btn-save");
  let urlPlaylistCoverImage = null;
  const playlistName = document.querySelector(".playlist-name");
  const playlistDesc = document.querySelector(".playlist-desc");
  const fileInputPlaylistCover = document.querySelector(
    "#fileInputPlaylistCover"
  );
  const coverPreviewImage = document.querySelector(".cover-preview-image");
  const playlistCoverImage = document.querySelector(".playlist-cover-image");
  coverPreviewImage.addEventListener("click", async () => {
    fileInputPlaylistCover.click();
  });
  // trigger event when change data in input
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

      // Chuẩn bị dữ liệu FormData
      const formData = new FormData();
      formData.append("cover", file); // backend sẽ nhận với key "image"

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

  logoIcon.addEventListener("click", () => {
    showUIPopular(false);
    showUICreatePlaylist(false);
  });

  homeButton.addEventListener("click", () => {
    showUIPopular(false);
    showUICreatePlaylist(false);
  });
  // render all playlist
  const hitsGridHtml = playlists
    .map((playlist) => {
      return `
      <div data-id="${playlist.id}" class="hit-card">
        <div class="hit-card-cover">
          <img
            src="${playlist.image_url}"
            alt="${playlist.description}"
          />
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

  //  Render all artists
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

  // select a card to render UI hero
  const hitsCards = document.querySelectorAll(".hit-card");
  hitsCards.forEach((card) => {
    card.addEventListener("click", async () => {
      const playlist = await getPlaylistById(card.dataset.id);
      showUIPopular(true);

      const artistHeroHtml = `
        <div class="hero-background">
          <img
            src="${playlist.image_url}"
            alt="${playlist.description}"
            class="hero-image"
          />
          <div class="hero-overlay"></div>
        </div>
        <div class="hero-content" data-id="${playlist.id}">
          <div class="verified-badge">
            <span>Public playlist - ${playlist.description}</span>
          </div>
          <h1 class="artist-name">${playlist.name}</h1>
          <p class="monthly-listeners">1,021,833 monthly listeners</p>
          <button class="follow-btn">${
            playlist.is_following ? "Unfollow" : "Follow"
          }</button>
        </div>
        `;

      document.addEventListener("click", async (e) => {
        if (e.target.classList.contains("follow-btn")) {
          const btn = e.target;
          const playlistId = btn.closest(".hero-content").dataset.id;

          if (btn.textContent === "Follow") {
            btn.textContent = "Unfollow";
            // Gọi API follow
            await followPlaylist(playlistId);
          } else {
            btn.textContent = "Follow";
            // Gọi API unfollow
            await unfollowPlaylist(playlistId);
          }
        }
      });
      artistHero.innerHTML = artistHeroHtml;
      const { tracks } = await getTrackByPlaylist(playlist.id);
      if (tracks.length === 0) {
        const popularSectionHtml =
          `
        <h2 class="section-title">Popular</h2>
      ` +
          `<div class="track-list">` +
          `No tracks in playlist` +
          `</div>`;
        popularSection.innerHTML = popularSectionHtml;
      } else {
        const popularSectionHtml =
          `
        <h2 class="section-title">Popular</h2>
      ` +
          `<div class="track-list">` +
          tracks
            .map(
              (track, index) => `
            <div class="track-item">
                <div class="track-number">${index + 1}</div>
                <div class="track-image">
                  <img
                    src="${track.image_url}"
                    alt="${track.title}"
                  />
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

  const artistsCards = document.querySelectorAll(".artist-card");
  artistsCards.forEach((card) => {
    card.addEventListener("click", async () => {
      const artist = await getArtistById(card.dataset.id);
      showUIPopular(true);
      const artistHeroHtml = `
        <div class="hero-background">
          <img
            src="${artist.image_url}"
            alt="${artist.name}"
            class="hero-image"
          />
          <div class="hero-overlay"></div>
        </div>
        <div class="hero-content">
         ${
           artist.is_verified &&
           ` <div class="verified-badge">
            <i class="fas fa-check-circle"></i>
            <span>Verified Artist</span>
          </div>`
         }
          <h1 class="artist-name">${artist.name}</h1>
          <p class="monthly-listeners">${formatNumber(
            artist.monthly_listeners
          )} monthly listeners</p>
        </div>`;

      artistHero.innerHTML = artistHeroHtml;

      // artist popular tracks
      const { tracks } = await getArtistPopularTracks(artist.id);
      if (tracks.length === 0) {
        const popularSectionHtml =
          `
        <h2 class="section-title">Popular</h2>
      ` +
          `<div class="track-list">` +
          `No tracks in playlist` +
          `</div>`;
        popularSection.innerHTML = popularSectionHtml;
      } else {
        const popularSectionHtml =
          `
        <h2 class="section-title">Popular</h2>
      ` +
          `<div class="track-list">` +
          tracks
            .map(
              (track, index) => `
            <div class="track-item">
                <div class="track-number">${index + 1}</div>
                <div class="track-image">
                  <img
                    src="${track.image_url}"
                    alt="${track.title}"
                  />
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
