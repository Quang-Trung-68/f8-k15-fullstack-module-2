// ============================================
// FILE: utils/helpers.js
// ============================================

export const formatSeconds = (seconds) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const m = String(mins).padStart(2, "0");
  const s = String(secs).padStart(2, "0");
  return hrs > 0 ? `${hrs}:${m}:${s}` : `${mins}:${s}`;
};

export const formatNumber = (num) =>
  num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

export const formatTime = (sec) => {
  const minutes = Math.floor(sec / 60);
  const seconds = Math.floor(sec % 60);
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export const showToast = (message, type = "success") => {
  const config = {
    success: {
      backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
      className: "toast-success",
    },
    error: {
      backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
      className: "toast-error",
    },
  };

  Toastify({
    text: message,
    duration: 3000,
    gravity: "right",
    position: "right",
    ...config[type],
  }).showToast();
};
