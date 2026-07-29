const STORAGE_PREFIX = "bgnp_";

export const storage = {
  get(key, defaultValue = null) {
    try {
      const value = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
      return value ? JSON.parse(value) : defaultValue;
    } catch (e) {
      console.warn(`Error reading from localStorage: ${key}`, e);
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn(`Error writing to localStorage: ${key}`, e);
      // Optional: Handle quota exceeded error gracefully
      return false;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
    } catch (e) {
      console.warn(`Error removing from localStorage: ${key}`, e);
    }
  },

  clearAll() {
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith(STORAGE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.warn("Error clearing localStorage", e);
    }
  },
};

export const debounce = (fn, delay) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
};

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
