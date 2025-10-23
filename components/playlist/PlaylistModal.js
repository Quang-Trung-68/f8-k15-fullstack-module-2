// ============================================
// FILE: components/playlist/PlaylistModal.js
// ============================================

import { playlistService } from "../../services/playlistService.js";
import { showToast } from "../../utils/helpers.js";

export const PlaylistModal = (elements) => {
  let currentPlaylistId = null;
  let pendingCoverFile = null; // File chưa upload
  let uploadedCoverUrl = null; // URL đã upload (chỉ khi save)
  let onSaveCallback = null;

  const open = (playlist) => {
    currentPlaylistId = playlist.id;
    pendingCoverFile = null;
    uploadedCoverUrl = null;

    elements.playlistName.value = playlist.name;
    elements.playlistDesc.value = playlist.description;
    elements.coverPreviewImage.src = playlist.image_url;
    elements.playlistCoverImage.src = playlist.image_url;
    elements.playlistTitle.textContent = playlist.name;
    elements.playlistTitle.dataset.id = playlist.id;

    elements.overlay.classList.remove("hidden");
    elements.modal.classList.remove("hidden");
  };

  const close = () => {
    elements.overlay.classList.add("hidden");
    elements.modal.classList.add("hidden");
    pendingCoverFile = null;
    uploadedCoverUrl = null;
  };

  const handleFileSelect = (file) => {
    if (!file || !currentPlaylistId) return;

    // Preview ảnh ngay lập tức
    const reader = new FileReader();
    reader.onload = (e) => {
      elements.coverPreviewImage.src = e.target.result;
      elements.playlistCoverImage.src = e.target.result;
    };
    reader.readAsDataURL(file);

    // Lưu file để upload sau khi save
    pendingCoverFile = file;
  };

  const handleSave = async () => {
    if (!currentPlaylistId) return;

    try {
      // 1. Upload ảnh nếu có file pending
      if (pendingCoverFile) {
        const formData = new FormData();
        formData.append("cover", pendingCoverFile);
        const response = await playlistService.uploadCover(
          currentPlaylistId,
          pendingCoverFile
        );
        uploadedCoverUrl = response;
        showToast("Cover uploaded successfully", "success");
      }

      // 2. Update playlist data
      const data = {
        name: elements.playlistName.value,
        description: elements.playlistDesc.value,
      };

      // Chỉ include image_url nếu vừa upload
      if (uploadedCoverUrl) {
        data.image_url = uploadedCoverUrl;
      }

      await playlistService.update(currentPlaylistId, data);
      const updatedPlaylist = await playlistService.getById(currentPlaylistId);

      // 3. Update UI
      elements.playlistTitle.textContent = updatedPlaylist.name;
      elements.playlistCoverImage.src = updatedPlaylist.image_url;
      elements.coverPreviewImage.src = updatedPlaylist.image_url;

      close();
      showToast("Playlist updated successfully", "success");

      // 4. Call callback if set
      if (onSaveCallback) {
        await onSaveCallback(updatedPlaylist);
      }

      return updatedPlaylist;
    } catch (error) {
      console.error("Save error:", error);
      showToast("Failed to update playlist", "error");
    }
  };

  const onSave = (callback) => {
    onSaveCallback = callback;
  };

  const init = () => {
    elements.overlay.addEventListener("click", close);
    elements.modalCloseBtn.addEventListener("click", close);
    elements.saveBtn.addEventListener("click", handleSave);

    elements.coverPreviewImage.addEventListener("click", () => {
      elements.fileInputPlaylistCover.click();
    });

    elements.fileInputPlaylistCover.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (file) {
        handleFileSelect(file);
      }
      // Reset input to allow selecting the same file again
      e.target.value = "";
    });
  };

  return { init, open, close, handleSave, onSave };
};
