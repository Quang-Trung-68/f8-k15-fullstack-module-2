import { searchApi } from "../api/endpoints.js";

export const searchService = {
  searchTracks: async (searchTerm) => {
    const response = await searchApi.searchTracks(searchTerm);
    return response.data.tracks || [];
  },
  searchPlaylists: async (searchTerm) => {
    const response = await searchApi.searchPlaylists(searchTerm);
    return response.data.playlists || [];
  },
  searchArtists: async (searchTerm) => {
    const response = await searchApi.searchArtists(searchTerm);
    return response.data.artists || [];
  },
};

/*
Example response from api:
data.tracks: [
        {
            "type": "track",
            "id": "770e8400-e29b-41d4-a716-446655440002",
            "title": "Lối Nhỏ",
            "subtitle": "Đen",
            "image_url": "http://spotify.f8team.dev/uploads/images/img_dc1f8c56-e84a-4a53-8047-fa16fc184d89.jpeg",
            "additional_info": {
                "artist_name": "Đen",
                "album_title": "Đen & Friends",
                "duration": 252,
                "play_count": 45686897
            },
            "relevance_score": 70
        },
        {
            "type": "track",
            "id": "770e8400-e29b-41d4-a716-446655440007",
            "title": "Yêu Một Người Sao Buồn Đến Thế",
            "subtitle": "Noo Phước Thịnh",
            "image_url": "http://spotify.f8team.dev/uploads/images/img_d1e53cc4-2dcd-4a56-a2a8-a5b64f040b80.jpeg",
            "additional_info": {
                "artist_name": "Noo Phước Thịnh",
                "album_title": "Noo Songs",
                "duration": 312,
                "play_count": 18756123
            },
            "relevance_score": 40
        },
        {
            "type": "track",
            "id": "770e8400-e29b-41d4-a716-446655440008",
            "title": "Cause I Love You",
            "subtitle": "Noo Phước Thịnh",
            "image_url": "http://spotify.f8team.dev/uploads/images/img_481a0576-8fba-44ec-824a-743b9288ffe0.jpeg",
            "additional_info": {
                "artist_name": "Noo Phước Thịnh",
                "album_title": "Noo Songs",
                "duration": 374,
                "play_count": 14567890
            },
            "relevance_score": 50
        }
    ]


data.playlists: [
        {
            "type": "playlist",
            "id": "2d72b52f-a3c8-4798-bc9d-0c5fe661ed9c",
            "title": "My New Playlist #5",
            "subtitle": "By xdd • 6 songs",
            "image_url": "https://spotify.f8team.dev/uploads/images/img_233fb5ec-af45-4fa2-a334-1557d77f3519.jpg",
            "additional_info": {
                "description": "",
                "creator_username": "xdd",
                "creator_name": "xdd",
                "track_count": 6,
                "followers_count": 6,
                "is_public": 1
            },
            "relevance_score": 110
        },
        {
            "type": "playlist",
            "id": "11b891c5-23cc-4fa1-b96e-8e59498d1c68",
            "title": "My Playlist #2",
            "subtitle": "By thanhtri1122 • 5 songs",
            "image_url": null,
            "additional_info": {
                "description": null,
                "creator_username": "thanhtri1122",
                "creator_name": null,
                "track_count": 5,
                "followers_count": 5,
                "is_public": 1
            },
            "relevance_score": 110
        }
    ]

data.artists: [
        {
            "type": "artist",
            "id": "550e8400-e29b-41d4-a716-446655440004",
            "title": "Noo Phước Thịnh",
            "subtitle": "923,456 monthly listeners",
            "image_url": "http://spotify.f8team.dev/uploads/images/img_7451c533-0441-419e-a43b-b2dc6a5ba15d.webp",
            "additional_info": {
                "bio": "Noo Phước Thịnh là một ca sĩ người Việt Nam nổi tiếng với những ca khúc pop và ballad.",
                "monthly_listeners": 923456,
                "is_verified": 1,
                "followers_count": 20
            },
            "relevance_score": 70
        },
        {
            "type": "artist",
            "id": "550e8400-e29b-41d4-a716-446655440002",
            "title": "Trúc Nhân",
            "subtitle": "850,241 monthly listeners",
            "image_url": "http://spotify.f8team.dev/uploads/images/img_17c95672-c596-44e5-8174-c4924fa08b37.webp",
            "additional_info": {
                "bio": "Trúc Nhân là một ca sĩ, nhạc sĩ người Việt Nam. Anh được biết đến với giọng hát đặc trưng và những ca khúc ballad sâu lắng.",
                "monthly_listeners": 850241,
                "is_verified": 1,
                "followers_count": 19
            },
            "relevance_score": 70
        }
    ]

*/
