// ============================================
// FILE: utils/storage.js
// ============================================

export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;

      // Thử parse JSON, nếu lỗi thì trả về raw string
      try {
        return JSON.parse(item);
      } catch {
        return item;
      }
    } catch {
      return defaultValue;
    }
  },

  set: (key, value) => {
    try {
      // Nếu là string thì lưu trực tiếp, còn lại stringify
      const data = typeof value === "string" ? value : JSON.stringify(value);
      localStorage.setItem(key, data);
    } catch (error) {
      console.error(`❌ Storage SET error for ${key}:`, error);
    }
  },

  remove: (key) => {
    localStorage.removeItem(key);
  },

  clear: () => {
    localStorage.clear();
  },
};
