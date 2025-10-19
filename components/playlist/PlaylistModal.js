// ============================================
// FILE: components/playlist/PlaylistModal.js
// Copy this to: components/playlist/PlaylistModal.js
// ============================================

import { playlistService } from "../../services/playlistService.js";

export const PlaylistModal = (elements) => {
  let currentPlaylistId = null;
  let coverImageUrl = null;

  const open = (playlist) => {
    currentPlaylistId = playlist.id;
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
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  const handleSave = async () => {
    if (!currentPlaylistId) return;

    const data = {
      name: elements.playlistName.value,
      description: elements.playlistDesc.value,
      image_url: coverImageUrl || elements.coverPreviewImage.src,
    };

    try {
      await playlistService.update(currentPlaylistId, data);
      const updatedPlaylist = await playlistService.getById(currentPlaylistId);

      elements.playlistTitle.textContent = updatedPlaylist.name;
      elements.playlistCoverImage.src = updatedPlaylist.image_url;

      close();
      return updatedPlaylist;
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  const init = () => {
    elements.overlay.addEventListener("click", close);
    elements.modalCloseBtn.addEventListener("click", close);
    elements.saveBtn.addEventListener("click", handleSave);

    elements.coverPreviewImage.addEventListener("click", () => {
      elements.fileInputPlaylistCover.click();
    });

    elements.fileInputPlaylistCover.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) handleFileUpload(file);
    });
  };

  return { init, open, close, handleSave };
};
