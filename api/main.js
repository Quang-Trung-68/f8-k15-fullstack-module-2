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

const getMyPlaylists = async () => {
  const response = await api.get("me/playlists");
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

// follow/unfollow playlist

const followPlaylist = async (playlistId) => {
  const response = await api.post(`playlists/${playlistId}/follow`);
  return response.data;
};

const unfollowPlaylist = async (playlistId) => {
  const response = await api.delete(`playlists/${playlistId}/follow`);
  return response.data;
};

// follow/unfollow artist

const followArtist = async (artistId) => {
  const response = await api.post(`artists/${artistId}/follow`);
  return response.data;
};

const unfollowArtist = async (artistId) => {
  const response = await api.delete(`artists/${artistId}/follow`);
  return response.data;
};

// playlist

const createPlaylist = async () => {
  const response = await api.post(`playlists`, {
    name: "My New Playlist",
    description: "Playlist description",
    is_public: true,
    image_url: "https://example.com/playlist-cover.jpg",
  });
  return response.data;
};

const updatePlaylist = async (playlistId, playlistData) => {
  const response = await api.put(`playlists/${playlistId}`, playlistData);
  return response.data;
};

const deletePlaylist = async (playlistId) => {
  const response = await api.delete(`playlists/${playlistId}`);
  return response.data;
};

// UPLOAD
// upload image playlist cover
const uploadPlaylistCover = async (playlistId, formData) => {
  const response = await api.post(
    `upload/playlist/${playlistId}/cover`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
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
  uploadPlaylistCover,
  updatePlaylist,
  followArtist,
  unfollowArtist,
  getMyPlaylists,
  deletePlaylist,
};
