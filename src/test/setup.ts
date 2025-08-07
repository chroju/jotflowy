// Test setup file
import { beforeEach } from 'vitest'

// Mock localStorage for tests
beforeEach(() => {
  // Clear localStorage before each test
  global.localStorage = {
    store: new Map<string, string>(),
    getItem: function(key: string) {
      return this.store.get(key) || null;
    },
    setItem: function(key: string, value: string) {
      this.store.set(key, value);
    },
    removeItem: function(key: string) {
      this.store.delete(key);
    },
    clear: function() {
      this.store.clear();
    },
    get length() {
      return this.store.size;
    },
    key: function(index: number) {
      const keys = Array.from(this.store.keys());
      return keys[index] || null;
    }
  } as Storage;
})