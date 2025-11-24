import cacheService from '../services/cacheService.js';
import { getRedisClient, isRedisReady } from '../config/redis.js';

/**
 * Cache Debug Controller
 * Chỉ dùng cho development/debugging
 */

// Lấy tất cả keys trong Redis
export const getAllKeys = async (req, res, next) => {
  try {
    if (!isRedisReady()) {
      return res.status(503).json({
        success: false,
        message: 'Redis không khả dụng'
      });
    }

    const redis = getRedisClient();
    const pattern = req.query.pattern || '*';
    const keys = await redis.keys(pattern);

    res.status(200).json({
      success: true,
      total: keys.length,
      pattern,
      keys
    });
  } catch (error) {
    next(error);
  }
};

// Xem giá trị của 1 key cụ thể
export const getKeyValue = async (req, res, next) => {
  try {
    if (!isRedisReady()) {
      return res.status(503).json({
        success: false,
        message: 'Redis không khả dụng'
      });
    }

    const { key } = req.params;
    const redis = getRedisClient();
    
    const value = await redis.get(key);
    const ttl = await redis.ttl(key);

    if (!value) {
      return res.status(404).json({
        success: false,
        message: `Key "${key}" không tồn tại`
      });
    }

    res.status(200).json({
      success: true,
      key,
      value: JSON.parse(value),
      ttl: ttl > 0 ? `${ttl}s` : 'Vĩnh viễn',
      expiresAt: ttl > 0 ? new Date(Date.now() + ttl * 1000).toISOString() : 'Không hết hạn'
    });
  } catch (error) {
    next(error);
  }
};

// Xóa 1 key
export const deleteKey = async (req, res, next) => {
  try {
    if (!isRedisReady()) {
      return res.status(503).json({
        success: false,
        message: 'Redis không khả dụng'
      });
    }

    const { key } = req.params;
    const success = await cacheService.del(key);

    res.status(200).json({
      success,
      message: success ? `Đã xóa key "${key}"` : 'Không thể xóa key'
    });
  } catch (error) {
    next(error);
  }
};

// Xóa tất cả cache theo pattern
export const deletePattern = async (req, res, next) => {
  try {
    if (!isRedisReady()) {
      return res.status(503).json({
        success: false,
        message: 'Redis không khả dụng'
      });
    }

    const { pattern } = req.params;
    const redis = getRedisClient();
    
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(keys);
    }

    res.status(200).json({
      success: true,
      message: `Đã xóa ${keys.length} keys theo pattern "${pattern}"`,
      deletedKeys: keys
    });
  } catch (error) {
    next(error);
  }
};

// Xóa toàn bộ cache
export const flushAll = async (req, res, next) => {
  try {
    if (!isRedisReady()) {
      return res.status(503).json({
        success: false,
        message: 'Redis không khả dụng'
      });
    }

    await cacheService.flush();

    res.status(200).json({
      success: true,
      message: 'Đã xóa toàn bộ cache'
    });
  } catch (error) {
    next(error);
  }
};

// Lấy thống kê cache
export const getCacheStats = async (req, res, next) => {
  try {
    if (!isRedisReady()) {
      return res.status(503).json({
        success: false,
        message: 'Redis không khả dụng',
        stats: null
      });
    }

    const redis = getRedisClient();
    
    // Lấy tất cả keys và phân loại
    const allKeys = await redis.keys('*');
    
    const stats = {
      total: allKeys.length,
      byType: {
        products: allKeys.filter(k => k.startsWith('product:')).length,
        productLists: allKeys.filter(k => k.startsWith('products:list:')).length,
        orders: allKeys.filter(k => k.startsWith('order:')).length,
        orderLists: allKeys.filter(k => k.startsWith('orders:')).length,
        carts: allKeys.filter(k => k.startsWith('cart:')).length,
        categories: allKeys.filter(k => k.startsWith('categories:')).length,
        others: allKeys.filter(k => 
          !k.startsWith('product:') && 
          !k.startsWith('products:') && 
          !k.startsWith('order:') && 
          !k.startsWith('orders:') && 
          !k.startsWith('cart:') && 
          !k.startsWith('categories:')
        ).length
      },
      samples: {
        products: allKeys.filter(k => k.startsWith('product:')).slice(0, 5),
        orders: allKeys.filter(k => k.startsWith('order:')).slice(0, 5),
        carts: allKeys.filter(k => k.startsWith('cart:')).slice(0, 5)
      }
    };

    res.status(200).json({
      success: true,
      isRedisReady: isRedisReady(),
      stats
    });
  } catch (error) {
    next(error);
  }
};
