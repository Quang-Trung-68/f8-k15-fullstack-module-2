// ============================================
// FILE: services/playlistService.js
// Copy this to: services/playlistService.js
// ============================================

import { playlistAPI, artistAPI } from "../api/endpoints.js";
import { SORT_TYPES } from "../utils/constants.js";

export const playlistService = {
  getAllCombined: async (filterType, searchField, sortType) => {
    const [myPlaylists, followedPlaylists, followedArtists] = await Promise.all(
      [
        playlistAPI.getMy().then((r) => r.data.playlists),
        playlistAPI.getFollowed().then((r) => r.data.playlists),
        artistAPI.getFollowed().then((r) => r.data.artists),
      ]
    );

    let playlists = [...myPlaylists, ...followedPlaylists];
    let artists = [...followedArtists];

    // Apply search
    if (searchField) {
      const term = searchField.toLowerCase();
      playlists = playlists.filter((p) => p.name.toLowerCase().includes(term));
      artists = artists.filter((a) => a.name.toLowerCase().includes(term));
    }

    // Apply sort
    const sortFunctions = {
      [SORT_TYPES.ALPHABETICAL]: (a, b) => a.name.localeCompare(b.name),
      [SORT_TYPES.RECENTLY_ADDED]: (a, b) =>
        new Date(b.updated_at || b.followed_at) -
        new Date(a.updated_at || a.followed_at),
      [SORT_TYPES.CREATOR]: (a, b) =>
        (a.user_display_name || a.name).localeCompare(
          b.user_display_name || b.name
        ),
    };

    if (sortFunctions[sortType]) {
      playlists.sort(sortFunctions[sortType]);
      artists.sort(sortFunctions[sortType]);
    }

    return { playlists, artists, filterType };
  },

  getById: async (id) => {
    const response = await playlistAPI.getById(id);
    return response.data;
  },

  getTracks: async (id) => {
    const response = await playlistAPI.getTracks(id);
    return response.data.tracks;
  },

  create: async () => {
    const response = await playlistAPI.create();
    return response.data.playlist;
  },

  update: async (id, data) => {
    await playlistAPI.update(id, data);
  },

  delete: async (id) => {
    await playlistAPI.delete(id);
  },

  follow: async (id) => {
    await playlistAPI.follow(id);
  },

  unfollow: async (id) => {
    await playlistAPI.unfollow(id);
  },

  uploadCover: async (id, file) => {
    const formData = new FormData();
    formData.append("cover", file);
    const response = await playlistAPI.uploadCover(id, formData);
    return response.data.file.url;
  },
};
