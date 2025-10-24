// ============================================
// FILE: services/trackService.js
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
  getById: async (id) => {
    const response = await trackAPI.getById(id);
    return response.data;
  },
};

/*
example response track: {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "title": "Lối Nhỏ",
    "duration": 252,
    "audio_url": "http://spotify.f8team.dev/uploads/audio/audio_43d74fa6-a365-4820-84f7-71926546ec90.mp3",
    "image_url": "http://spotify.f8team.dev/uploads/images/img_dc1f8c56-e84a-4a53-8047-fa16fc184d89.jpeg",
    "play_count": 45686897,
    "album_id": "660e8400-e29b-41d4-a716-446655440001",
    "artist_id": "550e8400-e29b-41d4-a716-446655440001",
    "track_number": 2,
    "created_at": "2025-07-27 08:03:58",
    "updated_at": "2025-07-27T09:22:55.832Z",
    "artist_name": "Đen",
    "artist_image_url": "http://spotify.f8team.dev/uploads/images/img_1253c348-ad95-48fb-b8da-a6ecdb70ec8b.webp",
    "album_title": "Đen & Friends",
    "album_cover_image_url": "http://spotify.f8team.dev/uploads/images/img_bf7b8a77-b8a5-4a63-8e7f-92413eef11a3.webp",
    "is_liked": false
}

*/
