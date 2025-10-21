// ============================================
// FILE: components/playlist/PlaylistModal.js - Updated
// ============================================

import { playlistService } from "../../services/playlistService.js";
import { showToast } from "../../utils/helpers.js";

export const PlaylistModal = (elements) => {
  let currentPlaylistId = null;
  let coverImageUrl = null;
  let onSaveCallback = null;

  const open = (playlist) => {
    currentPlaylistId = playlist.id;
    coverImageUrl = null;

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
    coverImageUrl = null;
  };

  const handleFileUpload = async (file) => {
    if (!file || !currentPlaylistId) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      elements.coverPreviewImage.src = e.target.result;
      elements.playlistCoverImage.src = e.target.result;
    };
    reader.readAsDataURL(file);

    try {
      coverImageUrl = await playlistService.uploadCover(
        currentPlaylistId,
        file
      );
      showToast("Cover uploaded successfully", "success");
    } catch (error) {
      console.error("Upload error:", error);
      showToast("Failed to upload cover", "error");
    }
  };

  const handleSave = async () => {
    if (!currentPlaylistId) return;

    const data = {
      name: elements.playlistName.value,
      description: elements.playlistDesc.value,
    };

    // Only include image_url if it was changed
    if (coverImageUrl) {
      data.image_url = coverImageUrl;
    }

    try {
      await playlistService.update(currentPlaylistId, data);
      const updatedPlaylist = await playlistService.getById(currentPlaylistId);

      // Update UI
      elements.playlistTitle.textContent = updatedPlaylist.name;
      elements.playlistCoverImage.src = updatedPlaylist.image_url;

      close();
      showToast("Playlist updated successfully", "success");

      // Call callback if set
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
        await handleFileUpload(file);
      }
      // Reset input to allow selecting the same file again
      e.target.value = "";
    });
  };

  return { init, open, close, handleSave, onSave };
};
