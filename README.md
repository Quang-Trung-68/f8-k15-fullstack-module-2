# 🎵 Spotify Clone

> A web application that clones Spotify built with vanilla JavaScript, HTML, and CSS. Educational project from F8 K15 Fullstack Module 2 course.

## ✨ Key Features

### 🔐 User Authentication

- Create new user accounts
- Login with email and password
- Manage login sessions
- Secure logout functionality

### 🎵 Music Playback

- Stream music online with audio player
- Play/Pause tracks
- Control playback progress
- Adjust volume
- Previous/Next track navigation
- Repeat mode and Shuffle mode
- Like/Unlike tracks

### 📋 Playlist Management

- Create new playlists
- Edit playlist details (name, description)
- Upload playlist cover images
- Follow/Unfollow playlists
- Delete playlists
- View tracks in playlists

### 🎤 Artist Management

- Browse popular artists
- View detailed artist information
- Follow/Unfollow artists
- See artist's popular tracks

### 🔍 Search and Filter

- Search playlists and artists
- Filter by playlist or artist
- Sort by: Recents, Recently Added, Alphabetical, Creator

### 👁️ Flexible View Modes

- Compact list view
- Default list view
- Compact grid view
- Default grid view

### 💾 Local Storage

- Persist application state
- Remember currently playing track
- Save user preferences

## 🛠️ Technology Stack

### Frontend

- **HTML5** - Page structure
- **CSS3** - Styling and responsive design
- **Vanilla JavaScript (ES6+)** - Application logic
- **Axios** - HTTP client for API requests
- **Font Awesome** - Icon library
- **Toastify.js** - Notification library

### Backend API

- API Base URL: `https://spotify.f8team.dev/api/`
- Authentication: Bearer token
- Methods: GET, POST, PUT, DELETE

## 📁 Project Structure

```
├── index.html                 # Main HTML file
├── main.js                    # Application entry point
├── loadingBar.js              # Loading bar utility
│
├── api/
│   ├── endpoints.js           # API endpoints definition
│   └── main.js                # API helper functions
│
├── services/
│   ├── authService.js         # Authentication handler
│   ├── playlistService.js     # Playlist management
│   ├── artistService.js       # Artist management
│   └── trackService.js        # Track management
│
├── components/
│   ├── auth/
│   │   ├── AuthModal.js       # Login/Signup modal
│   │   └── UserMenu.js        # User menu component
│   ├── player/
│   │   └── AudioPlayer.js     # Audio player component
│   ├── playlist/
│   │   ├── PlaylistGrid.js    # Playlist grid view
│   │   ├── PlaylistHero.js    # Playlist hero section
│   │   └── PlaylistModal.js   # Playlist edit modal
│   ├── artist/
│   │   ├── ArtistGrid.js      # Artist grid view
│   │   └── ArtistHero.js      # Artist hero section
│   ├── library/
│   │   ├── LibraryContent.js  # Library content display
│   │   ├── LibrarySearch.js   # Library search
│   │   ├── SortMenu.js        # Sort menu
│   │   └── ContextMenu.js     # Context menu
│   └── track/
│       └── TrackList.js       # Track list display
│
├── state/
│   └── appState.js            # Global state management
│
├── utils/
│   ├── api.js                 # Axios configuration
│   ├── constants.js           # Application constants
│   ├── helpers.js             # Utility functions
│   └── storage.js             # LocalStorage wrapper
│
└── css/
    ├── reset.css              # CSS reset
    ├── variables.css          # CSS custom properties
    ├── components.css         # Component styles
    ├── layout.css             # Layout styles
    └── responsive.css         # Responsive design
```

## 🚀 Installation and Setup

### Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Node.js (optional, for local server)

### Installation Steps

1. **Clone the repository**

```bash
git clone https://github.com/Quang-Trung-68/f8-k15-fullstack-module-2.git
cd f8-k15-fullstack-module-2
```

2. **Install dependencies**

```bash
npm install
```

3. **Run the application**

- Use Live Server extension in VS Code
- Or run with Python: `python -m http.server 8000`
- Open: `http://localhost:8000`

## 📚 User Guide

### Sign Up / Login

1. Click "Sign up" to create a new account
2. Enter username, display name, email, and password
3. Or click "Log in" to sign in with existing account

### Browse Playlists and Artists

1. "Today's biggest playlists" section shows popular playlists
2. "Popular artists" section shows trending artists
3. Click any item to view details

### Manage Your Library

1. Left sidebar, "Your Library" section
2. Use tabs to filter: Playlists or Artists
3. Use search button to find items
4. Use sort button to sort and change view mode

### Create and Edit Playlists

1. Click "Create" button in Your Library
2. Enter playlist name and description
3. Upload a cover image (optional)
4. Click "Save" to save changes

### Play Music

1. Click on a track or press play button
2. Use player controls at the bottom
3. Drag progress bar to change playback position
4. Click shuffle/repeat buttons to enable modes

## 🎨 Design

### Primary Colors

- **Primary**: `#1db954` (Spotify Green)
- **Background**: `#000000`, `#121212`
- **Text**: `#ffffff`, `#b3b3b3`

### Responsive Breakpoints

- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)

## 🔑 API Endpoints

### Authentication

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user
- `GET /users/me` - Get current user info

### Playlists

- `GET /playlists` - Get all playlists
- `GET /playlists/:id` - Get playlist details
- `GET /me/playlists` - Get my playlists
- `GET /me/playlists/followed` - Get followed playlists
- `GET /playlists/:id/tracks` - Get playlist tracks
- `POST /playlists` - Create new playlist
- `PUT /playlists/:id` - Update playlist
- `DELETE /playlists/:id` - Delete playlist
- `POST /playlists/:id/follow` - Follow playlist
- `DELETE /playlists/:id/follow` - Unfollow playlist
- `POST /upload/playlist/:id/cover` - Upload cover image

### Artists

- `GET /artists` - Get all artists
- `GET /artists/:id` - Get artist details
- `GET /me/following` - Get followed artists
- `GET /artists/:id/tracks/popular` - Get popular tracks
- `POST /artists/:id/follow` - Follow artist
- `DELETE /artists/:id/follow` - Unfollow artist

### Tracks

- `POST /tracks/:id/like` - Like a track
- `DELETE /tracks/:id/like` - Unlike a track

## 💡 Tips & Tricks

### Keyboard Shortcuts

- **Space**: Play/Pause
- **Arrow Right**: Next track
- **Arrow Left**: Previous track

### Performance Optimization

- Search uses debounce (800ms delay)
- Loading bar shows during API requests
- Efficient state management with local storage

## 🐛 Known Issues

- Requires stable internet connection
- Some older browsers may not fully support features

## 📝 License

Educational project - F8 K15 Fullstack Module 2

## 👨‍💻 Author

**Quang Trung**

- GitHub: [@Quang-Trung-68](https://github.com/Quang-Trung-68)
- Repository: [f8-k15-fullstack-module-2](https://github.com/Quang-Trung-68/f8-k15-fullstack-module-2)

## 🙏 Acknowledgments

- F8 - Fullstack program
- F8 Spotify API
- Developer community

---

**Description**: Spotify Clone is a comprehensive web application that emulates the interface and core functionality of Spotify. Users can sign in, browse playlists and artists, manage their personal library, create new playlists, and play music with full playback controls including play/pause, next/previous, shuffle, and repeat modes. The application uses Vanilla JavaScript ES6+ without framework dependencies, featuring a responsive and beautiful interface similar to official Spotify.
