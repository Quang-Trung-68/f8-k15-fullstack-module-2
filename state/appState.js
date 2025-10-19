// ============================================
// FILE: state/appState.js
// Copy this to: state/appState.js
// ============================================

import { storage } from "../utils/storage.js";
import { FILTER_TYPES, SORT_TYPES } from "../utils/constants.js";

export const appState = {
  // User state
  isAuthenticated: () => {
    // const hasToken = storage.get("accessToken") !== "";
    const hasFlag = storage.get("isAuthentication") === true;
    // console.log(hasFlag, hasToken);
    console.log(hasFlag);
    return hasFlag;
  },
  getUserInfo: () => storage.get("userInfo"),
  setUserInfo: (user) => storage.set("userInfo", user),

  // Filter & Sort
  getFilterType: () => storage.get("typeFilter", FILTER_TYPES.ALL),
  setFilterType: (type) => storage.set("typeFilter", type),

  getSortType: () => storage.get("currentSort", SORT_TYPES.RECENTLY_ADDED),
  setSortType: (type) => storage.set("currentSort", type),

  // Player state
  getCurrentTracks: () => storage.get("currentTracks", []),
  setCurrentTracks: (tracks) => storage.set("currentTracks", tracks),

  getCurrentIndex: () => Number(storage.get("currentIndex", 0)),
  setCurrentIndex: (index) => storage.set("currentIndex", index),

  getCurrentArtistId: () => storage.get("currentArtistId"),
  setCurrentArtistId: (id) => storage.set("currentArtistId", id),

  // Auth tokens
  getAccessToken: () => storage.get("accessToken"),
  setAccessToken: (token) => storage.set("accessToken", token),

  getRefreshToken: () => storage.get("refreshToken"),
  setRefreshToken: (token) => storage.set("refreshToken", token),

  // Generic get/set
  get: (key, defaultValue = null) => storage.get(key, defaultValue),
  set: (key, value) => storage.set(key, value),

  // Clear all data
  clearAuth: () => {
    storage.remove("accessToken");
    storage.remove("refreshToken");
    storage.remove("userInfo");
    storage.remove("isAuthentication");
    storage.remove("currentTracks");
    storage.remove("currentArtistId");
    storage.remove("currentIndex");
  },
};
