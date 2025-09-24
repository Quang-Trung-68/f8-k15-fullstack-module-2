// Call api
import {
  registerApi,
  loginApi,
  getCurrentUser,
  getAllPlaylists,
  getAllArtists,
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
  //   Render all playlists
  const hitsGrid = document.querySelector(".hits-grid");
  const { playlists } = await getAllPlaylists();
  const artistsGrid = document.querySelector(".artists-grid");
  const { artists } = await getAllArtists();
  const hitsGridHtml = playlists
    .map((playlist) => {
      return `
      <div class="hit-card">
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
       <div class="artist-card">
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
});
