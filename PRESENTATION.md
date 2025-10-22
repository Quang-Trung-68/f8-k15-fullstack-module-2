# 🎵 SPOTIFY CLONE

## Web Application Project

**F8 K15 Fullstack Module 2**

---

## 📋 GIỚI THIỆU DỰ ÁN

### Mục tiêu

- Xây dựng ứng dụng web music streaming hoàn chỉnh
- Clone giao diện và chức năng cốt lõi của Spotify
- Học tập và thực hành fullstack development

### Công nghệ sử dụng

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **API Integration**: Axios, REST API
- **UI/UX**: Responsive Design, Font Awesome Icons
- **Storage**: LocalStorage, Session Management

---

## ✨ TÍNH NĂNG CHÍNH (1/2)

### 🔐 Xác thực người dùng

- Đăng ký tài khoản mới
- Đăng nhập/Đăng xuất
- Quản lý phiên đăng nhập

### 🎵 Phát nhạc

- Stream nhạc trực tuyến
- Play/Pause, Next/Previous
- Shuffle & Repeat mode
- Volume control & Progress bar

---

## ✨ TÍNH NĂNG CHÍNH (2/2)

### 📋 Quản lý Playlist

- Tạo/Sửa/Xóa playlist
- Upload ảnh cover
- Follow/Unfollow playlists
- Like/Unlike tracks

### 🔍 Tìm kiếm & Lọc

- Tìm kiếm playlists, artists
- Filter theo loại (Playlist/Artist)
- Sort: Recents, Alphabetical, Creator
- 4 view modes: Compact/Default List/Grid

---

## 🏗️ KIẾN TRÚC DỰ ÁN

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

## 🔧 COMPONENTS CHÍNH

### AudioPlayer

- Quản lý phát nhạc toàn ứng dụng
- State management cho tracks
- Auto play next track
- Synchronize UI với audio state

### LibraryContent

- Hiển thị playlists & artists
- Dynamic rendering
- Real-time search & filter
- 4 view modes

### PlaylistModal

- CRUD operations cho playlist
- Image upload functionality
- Form validation

---

## 🔄 LUỒNG XỬ LÝ: AUTHENTICATION

### User Registration Flow

```
User nhập form
  → AuthModal validates input
  → authService.handleAuth(isSignup=true)
  → authAPI.register() gọi POST /auth/register
  → Nhận response {user, access_token, refresh_token}
  → appState.setAccessToken() lưu token
  → appState.setUserInfo() lưu user info
  → appState.set('isAuthentication', 'true')
  → UserMenu.updateUI(user) cập nhật giao diện
  → AuthModal.hide() đóng modal
  → libraryContent.render() load dữ liệu user
  → showToast('Đăng nhập thành công')
```

### User Login Flow

```
User nhập email/password
  → AuthModal validates
  → authService.handleAuth(isSignup=false)
  → authAPI.login() gọi POST /auth/login
  → Lưu tokens vào LocalStorage
  → Update UI (ẩn nút Login/Signup, hiện Avatar)
  → Load user's playlists & followed artists
```

---

## 🔄 LUỒNG XỬ LÝ: PHÁT NHẠC

### Play Track from Playlist

```
User click vào track
  → Lấy data-index-song từ track-item
  → Lấy currentTracks từ appState
  → player.loadNewPlaylist(tracks, artistId)
  → player.currentIndex = clickedIndex
  → player.loadCurrentSong()
      → Set audio.src = track.audio_url
      → Update player UI (title, artist, image)
      → Update document.title
  → player.safePlay()
      → Xử lý interruption (pause cũ → delay 10ms → play mới)
  → appState.setCurrentIndex(index)
  → appState.setCurrentTracks(tracks)
  → Re-render track list với highlight playing track
  → Update large play button icon
```

### Play/Pause Toggle

```
User click Play Button
  → Check audio.paused
  → Nếu paused:
      → player.safePlay()
      → Icon đổi từ fa-play → fa-pause
  → Nếu playing:
      → player.safePause()
      → Icon đổi từ fa-pause → fa-play
  → Sync với large play button trong hero section
```

### Next/Previous Track

```
User click Next/Previous
  → player.changeIndexSong(+1 hoặc -1)
  → Check shuffle mode:
      → Nếu shuffle: getRandomSong()
      → Nếu không: tính index theo thứ tự
  → player.safePause() dừng bài cũ
  → Update currentIndex
  → player.loadCurrentSong() load bài mới
  → player.safePlay() phát bài mới
  → Trigger onTrackChange callback
      → Re-render track list
      → Highlight bài đang phát
```

---

## 🔄 LUỒNG XỬ LÝ: PLAYLIST MANAGEMENT

### Create New Playlist

```
User click "Create" button
  → requireAuth() kiểm tra đăng nhập
  → Nếu chưa login: show AuthModal
  → Nếu đã login:
      → Set isCreatingPlaylist = true
      → Disable create button
      → playlistService.create()
          → playlistAPI.create() gọi POST /playlists
          → Body: {name, description, is_public, image_url}
          → Nhận response playlist
      → showUICreatePlaylist(true)
          → Ẩn hits/artists section
          → Hiện create-playlist section
      → Populate form với playlist data
      → Hide create button
      → libraryContent.render() refresh library
      → showToast('Playlist created')
```

### Edit Playlist

```
User click vào playlist title/cover
  → Get playlist data từ DOM
  → playlistModal.open(playlist)
      → Populate form fields
      → Show modal overlay
  → User chỉnh sửa thông tin
  → User click Save button
      → playlistModal.handleSave()
      → Thu thập data từ form
      → Nếu có upload ảnh:
          → playlistService.uploadCover(id, file)
          → POST /upload/playlist/:id/cover
          → Nhận URL ảnh mới
      → playlistService.update(id, data)
          → PUT /playlists/:id với {name, description, image_url}
      → playlistService.getById(id) lấy data mới nhất
      → Update UI (title, cover image)
      → playlistModal.close()
      → Trigger onSaveCallback
          → libraryContent.render() refresh library
      → showToast('Playlist updated')
```

### Delete Playlist

```
User right-click vào playlist
  → contextMenu.show() hiện menu
  → User click "Delete"
  → contextMenu.handleAction('delete')
      → playlistService.delete(id)
          → DELETE /playlists/:id
      → libraryContent.render() refresh library
      → resetToHome() quay về trang chủ
      → contextMenu.hide()
      → showToast('Playlist deleted')
```

---

## 🔄 LUỒNG XỬ LÝ: FOLLOW/UNFOLLOW

### Follow Playlist

```
User click "Follow" button trong hero
  → requireAuth() check authentication
  → Get playlistId từ hero-content data-id
  → Check current state: data-following
  → Nếu chưa follow:
      → playlistService.follow(id)
          → POST /playlists/:id/follow
      → Update button: text="Following", data-following="true"
      → showToast('Following playlist')
  → Nếu đã follow:
      → playlistService.unfollow(id)
          → DELETE /playlists/:id/follow
      → Update button: text="Follow", data-following="false"
      → showToast('Unfollowed playlist')
  → libraryContent.render() refresh library
      → Playlist xuất hiện/biến mất khỏi library
```

### Follow Artist

```
User click "Follow" trên artist hero
  → Tương tự flow Follow Playlist
  → artistService.follow(id) hoặc unfollow(id)
  → API: POST/DELETE /artists/:id/follow
  → Update library content
```

---

## 🔄 LUỒNG XỬ LÝ: SEARCH & FILTER

### Search in Main Content

```
User gõ vào search input (header)
  → Event 'input' trigger
  → Get searchValue.toLowerCase().trim()
  → Nếu searchValue rỗng:
      → initHomePage() hiện lại tất cả
  → Nếu có searchValue:
      → Promise.all([
          playlistAPI.getAll(),
          artistAPI.getAll()
        ])
      → Filter playlists: name.includes(searchValue)
      → Filter artists: name.includes(searchValue)
      → playlistGrid.render(filteredPlaylists)
      → artistGrid.render(filteredArtists)
      → attachCardEvents() cho kết quả search
```

### Search in Library

```
User click search icon trong sidebar
  → searchLibraryInput.classList.add('show')
  → Input appear với animation
  → User gõ search term
  → debounce(800ms) trigger
      → librarySearch.handleSearch()
      → Get searchValue
      → libraryContent.render(filterType, searchValue, sortType)
          → playlistService.getAllCombined()
          → Filter theo searchValue
          → Apply sort
          → Render filtered results
      → attachLibraryEvents()
```

### Filter Library (Playlist/Artist tabs)

```
User click "Playlists" tab
  → Remove active từ Artists tab
  → Add active vào Playlists tab
  → appState.setFilterType('playlist')
  → libraryContent.render('playlist', searchValue, sortType)
      → Chỉ render playlists
  → attachLibraryEvents()

User click "Artists" tab
  → Tương tự nhưng filterType='artist'
  → Chỉ render artists
```

---

## 🔄 LUỒNG XỬ LÝ: SORT & VIEW MODE

### Change Sort Order

```
User click Sort button
  → sortByTable.classList.toggle('show')
  → User chọn sort option (Recents, Alphabetical, etc.)
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
User click view mode button (compact-list, grid, etc.)
  → sortMenu.handleViewChange(viewMode)
  → appState.set('viewMode', viewMode)
  → Update sort button icon (fa-list, fa-th, etc.)
  → Remove tất cả view classes cũ
  → Add view class mới vào:
      - .library-content
      - .library-item
      - .item-image
      - .item-info
  → CSS tự động adjust layout theo class
  → Hide view menu
```

---

## 🔄 LUỒNG XỬ LÝ: LIKE/UNLIKE TRACK

### Toggle Like Track

```
User click vào like icon (💚/🩶)
  → Event delegation từ popularSection
  → e.target.closest('.track-is-liked')
  → e.stopPropagation() ngăn play track
  → Get trackId từ track-item
  → Get isLiked từ icon (💚 = true)
  → trackService.toggleLike(trackId, isLiked)
      → Nếu isLiked: trackAPI.unlike(id)
          → DELETE /tracks/:id/like
      → Nếu chưa like: trackAPI.like(id)
          → POST /tracks/:id/like
  → Update track trong currentTracks array
      → currentTracks[index].is_liked = !isLiked
      → appState.setCurrentTracks(currentTracks)
  → Re-render track list
      → trackList.render(currentTracks, artistId)
      → Icon tự động update: 💚 ↔️ 🩶
  → attachTrackEvents() re-attach listeners
  → showToast('Added to Liked Songs' hoặc 'Removed')
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
- **Artists**: Get details, popular tracks, follow
- **Tracks**: Like/Unlike functionality
- **Upload**: Playlist cover images

### Error Handling

- Axios interceptors
- Loading states
- Toast notifications
- Graceful degradation

---

## 🎯 NHỮNG ĐIỂM NỔI BẬT

### Technical Achievements

- ✅ **100% Vanilla JS** - No frameworks (React, Vue)
- ✅ **Component-based** - Modular architecture
- ✅ **Service Layer** - Clean separation of concerns
- ✅ **Responsive** - Mobile-first approach
- ✅ **Performance** - Debounce, lazy loading

### UX Excellence

- ✅ Smooth animations & transitions
- ✅ Context menus & tooltips
- ✅ Drag-to-seek progress bars
- ✅ Real-time state synchronization
- ✅ Keyboard shortcuts support

---

## 🚀 DEMO & KẾT QUẢ

### Chức năng hoạt động

- ✅ Authentication flow hoàn chỉnh
- ✅ Browse playlists & artists
- ✅ Create & manage playlists
- ✅ Play music với full controls
- ✅ Search & filter library
- ✅ Responsive trên mọi thiết bị

### Metrics

- **Code Quality**: Clean, maintainable code
- **Performance**: Fast loading, smooth interactions
- **User Experience**: Intuitive, familiar interface

---

## 📚 BÀI HỌC & KINH NGHIỆM

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

## 🔮 HƯỚNG PHÁT TRIỂN

### Future Enhancements

- 🎯 Playlist collaboration
- 🎯 Social features (share, comments)
- 🎯 Lyrics display
- 🎯 Offline mode
- 🎯 Backend development (Node.js)
...
---

## 🙏 KẾT LUẬN

### Tổng kết

- Dự án thành công trong việc replicate Spotify
- Nắm vững kiến thức Vanilla JavaScript
- Hiểu rõ về component architecture
- Kinh nghiệm thực tế với REST API

### Credits

- **F8 - Fullstack Program** cho khóa học chất lượng
- **F8 Spotify API** cho backend support
- **Developer Community** cho inspiration

---

## ❓ Q&A

**Cảm ơn đã lắng nghe!**

### 📧 Contact

- **GitHub**: @Quang-Trung-68
- **Repository**: f8-k15-fullstack-module-2


