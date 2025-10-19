// ============================================
// FILE: services/trackService.js
// Copy this to: services/trackService.js
// ============================================

import { trackAPI } from "../api/endpoints.js";

export const trackService = {
  like: async (id) => {
    await trackAPI.like(id);
  },

  unlike: async (id) => {
    await trackAPI.unlike(id);
  },

  toggleLike: async (id, isLiked) => {
    return isLiked ? trackAPI.unlike(id) : trackAPI.like(id);
  },
};
