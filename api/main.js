import api from "../utils/api.js";

// sign up
const registerApi = async (registerData) => {
  const response = await api.post("auth/register", registerData);
  return response.data;
};

const loginApi = async (loginData) => {
  const response = await api.post("auth/login", loginData);
  return response.data;
};

const getCurrentUser = async () => {
  const response = await api.get("users/me");
  return response.data;
};

// playlists

const getPlaylistById = async (playlistId) => {
  const response = await api.get(`playlists/${playlistId}`);
  return response.data;
};

const getAllPlaylists = async () => {
  const response = await api.get("playlists?limit=20&offset=0");
  return response.data;
};

// artists

const getAllArtists = async () => {
  const response = await api.get("artists?limit=20&offset=0");
  return response.data;
};

const getArtistById = async (artistId) => {
  const response = await api.get(`artists/${artistId}`);
  return response.data;
};

// tracks

const getTrackByPlaylist = async (playlistId) => {
  const response = await api.get(`playlists/${playlistId}/tracks`);
  return response.data;
};

const getArtistPopularTracks = async (artistId) => {
  const response = await api.get(`artists/${artistId}/tracks/popular`);
  return response.data;
};

// follow playlist/unfollow

const followPlaylist = async (playlistId) => {
  const response = await api.post(`playlists/${playlistId}/follow`);
  return response.data;
};

const unfollowPlaylist = async (playlistId) => {
  const response = await api.delete(`playlists/${playlistId}/follow`);
  return response.data;
};

// create playlist

const createPlaylist = async () => {
  const response = await api.post(`playlists`, {
    name: "My New Playlist",
    description: "Playlist description",
    is_public: true,
    image_url: "https://example.com/playlist-cover.jpg",
  });
  return response.data;
};

export {
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
};
