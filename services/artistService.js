// ============================================
// FILE: services/artistService.js
// ============================================

import { artistAPI } from "../api/endpoints.js";

export const artistService = {
  getById: async (id) => {
    const response = await artistAPI.getById(id);
    return response.data;
  },

  getPopularTracks: async (id) => {
    const response = await artistAPI.getPopularTracks(id);
    return response.data.tracks;
  },

  follow: async (id) => {
    await artistAPI.follow(id);
  },

  unfollow: async (id) => {
    await artistAPI.unfollow(id);
  },
};
