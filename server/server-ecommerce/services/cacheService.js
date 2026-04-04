import { getRedisClient, isRedisReady } from '../../config/redis.js';

class CacheService {
  constructor() {
    this.defaultTTL = 300; // 5 phút
  }

  // Lấy data từ cache
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

  // Lưu data vào cache
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

  // Xóa cache theo key
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

  // Xóa cache theo pattern (ví dụ: products:*)
  async delPattern(pattern) {
    try {
      if (!isRedisReady()) return false;
      
      const redis = getRedisClient();
      const keys = await redis.keys(pattern);
      
      if (keys.length > 0) {
        await redis.del(keys);
        console.log(`🗑️  Cache DELETE pattern ${pattern}: ${keys.length} keys`);
      }
      
      return true;
    } catch (error) {
      console.error(`Redis DEL pattern error for ${pattern}:`, error);
      return false;
    }
  }

  // Xóa toàn bộ cache
  async flush() {
    try {
      if (!isRedisReady()) return false;
      
      const redis = getRedisClient();
      await redis.flushAll();
      console.log('🗑️  Cache FLUSH ALL');
      return true;
    } catch (error) {
      console.error('Redis FLUSH error:', error);
      return false;
    }
  }

  // ========== CACHE HELPERS CHO PRODUCTS ==========
  
  // Cache danh sách sản phẩm
  async getProducts(query) {
    const key = `products:list:${JSON.stringify(query)}`;
    return await this.get(key);
  }

  async setProducts(query, data, ttl = 300) {
    const key = `products:list:${JSON.stringify(query)}`;
    return await this.set(key, data, ttl);
  }

  // Cache chi tiết sản phẩm
  async getProduct(productId) {
    const key = `product:${productId}`;
    return await this.get(key);
  }

  async setProduct(productId, data, ttl = 600) {
    const key = `product:${productId}`;
    return await this.set(key, data, ttl);
  }

  // Xóa cache sản phẩm (khi update/delete)
  async invalidateProduct(productId) {
    await this.del(`product:${productId}`);
    await this.delPattern('products:list:*'); // Xóa tất cả cache danh sách
  }

  // ========== CACHE HELPERS CHO ORDERS ==========
  
  async getOrder(orderId) {
    const key = `order:${orderId}`;
    return await this.get(key);
  }

  async setOrder(orderId, data, ttl = 180) {
    const key = `order:${orderId}`;
    return await this.set(key, data, ttl);
  }

  async getUserOrders(userId, query) {
    const key = `orders:user:${userId}:${JSON.stringify(query)}`;
    return await this.get(key);
  }

  async setUserOrders(userId, query, data, ttl = 120) {
    const key = `orders:user:${userId}:${JSON.stringify(query)}`;
    return await this.set(key, data, ttl);
  }

  async invalidateOrder(orderId) {
    await this.del(`order:${orderId}`);
    await this.delPattern('orders:user:*'); // Xóa cache danh sách order của users
    await this.delPattern('orders:admin:*'); // Xóa cache admin
  }

  // ========== CACHE HELPERS CHO CATEGORIES ==========
  
  async getCategories() {
    return await this.get('categories:all');
  }

  async setCategories(data, ttl = 3600) {
    return await this.set('categories:all', data, ttl);
  }

  async invalidateCategories() {
    await this.del('categories:all');
  }

  // ========== CACHE HELPERS CHO CART ==========
  
  async getCart(userId) {
    const key = `cart:${userId}`;
    return await this.get(key);
  }

  async setCart(userId, data, ttl = 600) {
    const key = `cart:${userId}`;
    return await this.set(key, data, ttl);
  }

  async invalidateCart(userId) {
    await this.del(`cart:${userId}`);
  }
}

export default new CacheService();

