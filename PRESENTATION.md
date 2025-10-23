# 🎵 SPOTIFY CLONE

## Web Application Project

**F8 K15 Fullstack Module 2**

---

## 📋 PROJECT OVERVIEW

### Objectives

- Build a complete music streaming web application
- Clone Spotify's interface and core functionality
- Learn and practice fullstack development

### Technologies Used

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **API Integration**: Axios, REST API
- **UI/UX**: Responsive Design, Font Awesome Icons
- **Storage**: LocalStorage, Session Management

---

## ✨ KEY FEATURES (1/2)

### 🔐 User Authentication

- New account registration
- Login/Logout
- Session management

### 🎵 Music Playback

- Online music streaming
- Play/Pause, Next/Previous
- Shuffle & Repeat mode
- Volume control & Progress bar

---

## ✨ KEY FEATURES (2/2)

### 📋 Playlist Management

- Create/Edit/Delete playlists
- Upload cover images
- Follow/Unfollow playlists, artists
- Like/Unlike tracks

### 🔍 Search & Filter

- Search playlists, artists
- Filter by type (Playlist/Artist)
- Sort: Recents, Alphabetical, Creator
- 4 view modes: Compact/Default List/Grid

---

## 🏗️ PROJECT ARCHITECTURE

```
📦 Project Structure
├── 📁 api/              # API endpoints & helper functions
├── 📁 components/       # UI Components
│   ├── auth/           # Authentication components
│   ├── player/         # Audio player
│   ├── playlist/       # Playlist management
│   ├── artist/         # Artist display
│   ├── library/        # Library & search
│   └── track/          # Track list
├── 📁 services/        # Business logic layer
├── 📁 state/           # Global state management
├── 📁 utils/           # Helper utilities
└── 📁 css/             # Styling
```

---

## 🎨 UI/UX HIGHLIGHTS

### Design System

- **Colors**: Spotify Green (#1db954), Dark theme
- **Typography**: Circular font family
- **Spacing**: 8px grid system
- **Animations**: Smooth transitions (0.15s-0.5s)

### Responsive Design

- ✅ Desktop (1200px+)
- ✅ Tablet (768px - 1199px)
- ✅ Mobile (< 768px)

### User Experience

- Loading bar indicator
- Toast notifications
- Context menus
- Keyboard shortcuts

---

## 🔧 MAIN COMPONENTS

### AudioPlayer

- Manage music playback across the app
- State management for tracks
- Auto play next track
- Synchronize UI with audio state

### LibraryContent

- Display playlists & artists
- Dynamic rendering
- Real-time search & filter
- 4 view modes

### PlaylistModal

- CRUD operations for playlists
- Image upload functionality
- Form validation

---

## 🔄 PROCESS FLOW: AUTHENTICATION

### User Registration Flow

```
User fills in form
  → authService.handleAuth(isSignup=true)
  → authAPI.register() calls POST /auth/register
  → AuthModal validates input
  → Receive response {user, access_token, refresh_token}
  → appState.setAccessToken() saves token
  → appState.setUserInfo() saves user info
  → appState.set('isAuthentication', 'true')
  → UserMenu.updateUI(user) updates interface
  → AuthModal.hide() closes modal
  → libraryContent.render() loads user data
  → showToast('Login successful')
```

### User Login Flow

```
User enters email/password
  → authService.handleAuth(isSignup=false)
  → authAPI.login() calls POST /auth/login
  → AuthModal validates
  → Save tokens to LocalStorage
  → Update UI (hide Login/Signup buttons, show Avatar)
  → Load user's playlists & followed artists
```

---

## 🔄 PROCESS FLOW: MUSIC PLAYBACK

### Play Track from Playlist

```
User clicks on track
  → Get data-index-song from track-item
  → Get currentTracks from appState
  → player.loadNewPlaylist(tracks, artistId)
  → player.currentIndex = clickedIndex
  → player.loadCurrentSong()
      → Set audio.src = track.audio_url
      → Update player UI (title, artist, image)
      → Update document.title
  → player.safePlay()
      → Handle interruption (pause old → delay 10ms → play new)
  → appState.setCurrentIndex(index)
  → appState.setCurrentTracks(tracks)
  → Re-render track list with highlighted playing track
  → Update large play button icon
```

### Play/Pause Toggle

```
User clicks Play Button
  → Check audio.paused
  → If paused:
      → player.safePlay()
      → Icon changes from fa-play → fa-pause
  → If playing:
      → player.safePause()
      → Icon changes from fa-pause → fa-play
  → Sync with large play button in hero section
```

### Next/Previous Track

```
User clicks Next/Previous
  → player.changeIndexSong(+1 or -1)
  → Check shuffle mode:
      → If shuffle: getRandomSong()
      → If not: calculate index in order
  → player.safePause() stops old track
  → Update currentIndex
  → player.loadCurrentSong() loads new track
  → player.safePlay() plays new track
  → Trigger onTrackChange callback
      → Re-render track list
      → Highlight currently playing track
```

---

## 🔄 PROCESS FLOW: PLAYLIST MANAGEMENT

### Create New Playlist

```
User clicks "Create" button
  → requireAuth() checks login status
  → If not logged in: show AuthModal
  → If logged in:
      → Set isCreatingPlaylist = true
      → Disable create button
      → playlistService.create()
          → playlistAPI.create() calls POST /playlists
          → Body: {name, description, is_public, image_url}
          → Receive playlist response
      → showUICreatePlaylist(true)
          → Hide hits/artists section
          → Show create-playlist section
      → Populate form with playlist data
      → Hide create button
      → libraryContent.render() refresh library
      → showToast('Playlist created')
```

### Edit Playlist

```
User clicks on playlist title/cover
  → Get playlist data from DOM
  → playlistModal.open(playlist)
      → Populate form fields
      → Show modal overlay
  → User edits information
  → User clicks Save button
      → playlistModal.handleSave()
      → Collect data from form
      → If image uploaded:
          → playlistService.uploadCover(id, file)
          → POST /upload/playlist/:id/cover
          → Receive new image URL
      → playlistService.update(id, data)
          → PUT /playlists/:id with {name, description, image_url}
      → playlistService.getById(id) fetch latest data
      → Update UI (title, cover image)
      → playlistModal.close()
      → Trigger onSaveCallback
          → libraryContent.render() refresh library
      → showToast('Playlist updated')
```

### Delete Playlist

```
User right-clicks on playlist
  → contextMenu.show() displays menu
  → User clicks "Delete"
  → contextMenu.handleAction('delete')
      → playlistService.delete(id)
          → DELETE /playlists/:id
      → libraryContent.render() refresh library
      → resetToHome() return to home page
      → contextMenu.hide()
      → showToast('Playlist deleted')
```

---

## 🔄 PROCESS FLOW: FOLLOW/UNFOLLOW

### Follow Playlist

```
User clicks "Follow" button in hero
  → requireAuth() checks authentication
  → Get playlistId from hero-content data-id
  → Check current state: data-following
  → If not following:
      → playlistService.follow(id)
          → POST /playlists/:id/follow
      → Update button: text="Following", data-following="true"
      → showToast('Following playlist')
  → If already following:
      → playlistService.unfollow(id)
          → DELETE /playlists/:id/follow
      → Update button: text="Follow", data-following="false"
      → showToast('Unfollowed playlist')
  → libraryContent.render() refresh library
      → Playlist appears/disappears from library
```

### Follow Artist

```
User clicks "Follow" on artist hero
  → Similar flow to Follow Playlist
  → artistService.follow(id) or unfollow(id)
  → API: POST/DELETE /artists/:id/follow
  → Update library content
```

---

## 🔄 PROCESS FLOW: SEARCH & FILTER

### Search in Main Content

```
User types in search input (header)
  → Event 'input' triggers
  → Get searchValue.toLowerCase().trim()
  → If searchValue is empty:
      → initHomePage() shows everything
  → If searchValue exists:
      → Promise.all([
          playlistAPI.getAll(),
          artistAPI.getAll()
        ])
      → Filter playlists: name.includes(searchValue)
      → Filter artists: name.includes(searchValue)
      → playlistGrid.render(filteredPlaylists)
      → artistGrid.render(filteredArtists)
      → attachCardEvents() for search results
```

### Search in Library

```
User clicks search icon in sidebar
  → searchLibraryInput.classList.add('show')
  → Input appears with animation
  → User types search term
  → debounce(800ms) triggers
      → librarySearch.handleSearch()
      → Get searchValue
      → libraryContent.render(filterType, searchValue, sortType)
          → playlistService.getAllCombined()
          → Filter by searchValue
          → Apply sort
          → Render filtered results
      → attachLibraryEvents()
```

### Filter Library (Playlist/Artist tabs)

```
User clicks "Playlists" tab
  → Remove active from Artists tab
  → Add active to Playlists tab
  → appState.setFilterType('playlist')
  → libraryContent.render('playlist', searchValue, sortType)
      → Only render playlists
  → attachLibraryEvents()

User clicks "Artists" tab
  → Similar but filterType='artist'
  → Only render artists
```

---

## 🔄 PROCESS FLOW: SORT & VIEW MODE

### Change Sort Order

```
User clicks Sort button
  → sortByTable.classList.toggle('show')
  → User selects sort option (Recents, Alphabetical, etc.)
  → sortMenu.handleSortChange(sortType)
      → appState.setSortType(sortType)
      → sortMenu.updateButtonText(sortType)
      → sortByTable.hide()
      → libraryContent.render(filterType, searchValue, sortType)
          → playlistService.getAllCombined()
          → Apply sortFunctions:
              - Alphabetical: name.localeCompare()
              - Recently Added: compare dates
              - Creator: compare user_display_name
          → Render sorted results
      → attachLibraryEvents()
```

### Change View Mode

```
User clicks view mode button (compact-list, grid, etc.)
  → sortMenu.handleViewChange(viewMode)
  → appState.set('viewMode', viewMode)
  → Update sort button icon (fa-list, fa-th, etc.)
  → Remove all old view classes
  → Add new view class to:
      - .library-content
      - .library-item
      - .item-image
      - .item-info
  → CSS automatically adjusts layout by class
  → Hide view menu
```

---

## 🔄 PROCESS FLOW: LIKE/UNLIKE TRACK

### Toggle Like Track

```
User clicks on like icon (💚/🩶)
  → Event delegation from popularSection
  → e.target.closest('.track-is-liked')
  → e.stopPropagation() prevents track play
  → Get trackId from track-item
  → Get isLiked from icon (💚 = true)
  → trackService.toggleLike(trackId, isLiked)
      → If isLiked: trackAPI.unlike(id)
          → DELETE /tracks/:id/like
      → If not liked: trackAPI.like(id)
          → POST /tracks/:id/like
  → Update track in currentTracks array
      → currentTracks[index].is_liked = !isLiked
      → appState.setCurrentTracks(currentTracks)
  → Re-render track list
      → trackList.render(currentTracks, artistId)
      → Icon automatically updates: 💚 ↔️ 🩶
  → attachTrackEvents() re-attach listeners
  → showToast('Added to Liked Songs' or 'Removed')
```

---

## 💾 STATE MANAGEMENT

### appState System

```javascript
- Authentication state
- User information
- Filter & Sort preferences
- Current playing tracks
- Player state (index, repeat, shuffle)
- Access & Refresh tokens
```

### LocalStorage Strategy

- Persist user sessions
- Remember playing track
- Save user preferences
- Efficient data retrieval

---

## 🔌 API INTEGRATION

### Endpoints

- **Auth**: `/auth/register`, `/auth/login`, `/auth/logout`
- **Playlists**: CRUD operations, follow/unfollow
- **Artists**: Get details, popular tracks, follow/unfollow
- **Tracks**: Like/Unlike functionality
- **Upload**: Playlist cover images

### Error Handling

- Axios interceptors
- Loading states
- Toast notifications
- Graceful degradation

---

## 🎯 HIGHLIGHTS

### Technical Achievements

- ✅ **100% Vanilla JS** - No frameworks (React, Vue)
- ✅ **Component-based** - Modular architecture
- ✅ **Service Layer** - Clean separation of concerns
- ✅ **Responsive** - Desktop-first approach
- ✅ **Performance** - Debounce, lazy loading

### UX Excellence

- ✅ Smooth animations & transitions
- ✅ Context menus & tooltips
- ✅ Drag-to-seek progress bars
- ✅ Real-time state synchronization
- ✅ Keyboard shortcuts support

---

## 🚀 DEMO & RESULTS

### Working Features

- ✅ Complete authentication flow
- ✅ Browse playlists & artists
- ✅ Create & manage playlists
- ✅ Play music with full controls
- ✅ Search & filter library
- ✅ Responsive on all devices

### Metrics

- **Code Quality**: Clean, maintainable code
- **Performance**: Fast loading, smooth interactions
- **User Experience**: Intuitive, familiar interface

---

## 📚 LESSONS LEARNED

### Technical Skills

- API integration & async programming
- State management patterns
- Component architecture
- CSS Grid & Flexbox mastery
- Event handling & delegation

### Soft Skills

- Problem-solving abilities
- Code organization
- Documentation writing
- Time management

---

## 🔮 FUTURE DEVELOPMENT

### Future Enhancements

- 🎯 Playlist collaboration
- 🎯 Social features (share, comments)
- 🎯 Lyrics display
- 🎯 Offline mode
- 🎯 Backend development (Node.js)

---

## 🙏 CONCLUSION

### Summary

- Successfully replicated Spotify functionality
- Mastered Vanilla JavaScript knowledge
- Deep understanding of component architecture
- Practical experience with REST API

### Credits

- **F8 - Fullstack Program** for quality course
- **F8 Spotify API** for backend support
- **Developer Community** for inspiration

---

## ❓ Q&A

**Thank you for listening!**

### 📧 Contact

- **GitHub**: @Quang-Trung-68
- **Repository**: f8-k15-fullstack-module-2
