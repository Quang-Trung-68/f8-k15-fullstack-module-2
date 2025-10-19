// ============================================
// FILE: api/endpoints.js
// Copy this to: api/endpoints.js
// ============================================

import api from "../utils/api.js";
import { API_BASE_URL } from "../utils/constants.js";

// Auth endpoints
export const authAPI = {
  register: (data) => api.post("auth/register", data),
  login: (data) => api.post("auth/login", data),
  logout: () => api.post("auth/logout"),
  getCurrentUser: () => api.get("users/me"),
};

// Playlist endpoints
export const playlistAPI = {
  getAll: (limit = 40, offset = 0) =>
    api.get(`playlists?limit=${limit}&offset=${offset}`),
  getById: (id) => api.get(`playlists/${id}`),
  getMy: () => api.get("me/playlists"),
  getFollowed: () => api.get("me/playlists/followed?limit=20&offset=0"),
  getTracks: (id) => api.get(`playlists/${id}/tracks`),
  create: (data) =>
    api.post("playlists", {
      name: "My New Playlist",
      description: "Playlist description",
      is_public: true,
      image_url: `${API_BASE_URL}uploads/images/img_23d1c870-dc45-45bb-8a85-b9f830cd5de3.jpg`,
      ...data,
    }),
  update: (id, data) => api.put(`playlists/${id}`, data),
  delete: (id) => api.delete(`playlists/${id}`),
  follow: (id) => api.post(`playlists/${id}/follow`),
  unfollow: (id) => api.delete(`playlists/${id}/follow`),
  uploadCover: (id, formData) =>
    api.post(`upload/playlist/${id}/cover`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

// Artist endpoints
export const artistAPI = {
  getAll: (limit = 40, offset = 0) =>
    api.get(`artists?limit=${limit}&offset=${offset}`),
  getById: (id) => api.get(`artists/${id}`),
  getFollowed: () => api.get("me/following?limit=20&offset=0"),
  getPopularTracks: (id) => api.get(`artists/${id}/tracks/popular`),
  follow: (id) => api.post(`artists/${id}/follow`),
  unfollow: (id) => api.delete(`artists/${id}/follow`),
};

// Track endpoints
export const trackAPI = {
  like: (id) => api.post(`tracks/${id}/like`),
  unlike: (id) => api.delete(`tracks/${id}/like`),
};
