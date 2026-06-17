import { getRedisClient, isRedisReady } from '../../config/redis.js';

class CacheService {
  constructor() {
    this.defaultTTL = 300; // 5 minutes
  }

  // Read data from Redis cache.
  async get(key) {
    try {
      if (!isRedisReady()) return null;

      const redis = getRedisClient();
      const data = await redis.get(key);

      if (data) {
        console.log(`✅ Cache HIT: ${key}`);
        return JSON.parse(data);
      }

      console.log(`❌ Cache MISS: ${key}`);
      return null;
    } catch (error) {
      console.error(`Redis GET error for key ${key}:`, error);
      return null;
    }
  }

  // Store data in Redis cache.
  async set(key, value, ttl = this.defaultTTL) {
    try {
      if (!isRedisReady()) return false;

      const redis = getRedisClient();
      await redis.setEx(key, ttl, JSON.stringify(value));
      console.log(`💾 Cache SET: ${key} (TTL: ${ttl}s)`);
      return true;
    } catch (error) {
      console.error(`Redis SET error for key ${key}:`, error);
      return false;
    }
  }

  // Delete cache by key.
  async del(key) {
    try {
      if (!isRedisReady()) return false;

      const redis = getRedisClient();
      await redis.del(key);
      console.log(`🗑️  Cache DELETE: ${key}`);
      return true;
    } catch (error) {
      console.error(`Redis DEL error for key ${key}:`, error);
      return false;
    }
  }

  // Product detail cache.
  async getProduct(productId) {
    const key = `product:${productId}`;
    return await this.get(key);
  }

  async setProduct(productId, data, ttl = 600) {
    const key = `product:${productId}`;
    return await this.set(key, data, ttl);
  }

  // Invalidate product cache after update/delete/stock changes.
  async invalidateProduct(productId) {
    await this.del(`product:${productId}`);
  }
}

export default new CacheService();
