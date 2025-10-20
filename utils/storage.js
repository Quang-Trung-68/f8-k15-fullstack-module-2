// ============================================
// FILE: utils/storage.js
// ============================================

export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;

      // ✅ FIX: Thử parse JSON, nếu lỗi thì trả về raw string
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
      // ✅ FIX: Nếu là string thì lưu trực tiếp, còn lại stringify
      const data = typeof value === "string" ? value : JSON.stringify(value);
      localStorage.setItem(key, data);
      console.log(`💾 Storage SET: ${key} =`, value);
    } catch (error) {
      console.error(`❌ Storage SET error for ${key}:`, error);
    }
  },

  remove: (key) => {
    localStorage.removeItem(key);
    console.log(`🗑️ Storage REMOVE: ${key}`);
  },

  clear: () => {
    localStorage.clear();
    console.log("🗑️ Storage CLEAR ALL");
  },
};
