export class CacheManager {
  constructor(ttl = 5 * 60 * 1000) {
    this.cache = new Map();
    this.TTL = ttl;
    this.hits = 0;
    this.misses = 0;
    this.startCleanupInterval();
  }

  getTTL() {
    return this.TTL;
  }

  set(key, value) {
    this.cache.set(key, {
      data: value,
      timestamp: Date.now(),
    });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (item.timestamp < Date.now() - this.TTL) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  delete(key) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  startCleanupInterval() {
    setInterval(() => {
      const now = Date.now();
      for (const [key, value] of this.cache.entries()) {
        if (value.timestamp < now - this.TTL) {
          this.cache.delete(key);
        }
      }
    }, this.TTL);
  }
}

export const authCache = new CacheManager(5 * 60 * 1000); // 5 minutes for auth
export const conversationCache = new CacheManager(5 * 60 * 1000); // 5 minutes for conversations
export const userCache = new CacheManager(15 * 60 * 1000); // 15 minutes for users
