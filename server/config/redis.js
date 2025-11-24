import { createClient } from 'redis';

let redisClient = null;

// Khởi tạo Redis client
const initRedis = async () => {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.error('❌ Redis: Quá nhiều lần thử kết nối lại');
            return new Error('Too many retries');
          }
          return retries * 500; // Retry sau 500ms, 1s, 1.5s...
        }
      }
    });

    redisClient.on('error', (err) => {
      console.error('❌ Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      console.log('🔄 Redis đang kết nối...');
    });

    redisClient.on('ready', () => {
      console.log('✅ Redis đã sẵn sàng');
    });

    redisClient.on('reconnecting', () => {
      console.log('🔄 Redis đang kết nối lại...');
    });

    await redisClient.connect();
    
    return redisClient;
  } catch (error) {
    console.error('❌ Không thể kết nối Redis:', error.message);
    console.log('⚠️  Ứng dụng sẽ chạy KHÔNG có cache');
    return null;
  }
};

// Get Redis client
const getRedisClient = () => {
  return redisClient;
};

// Kiểm tra Redis có hoạt động không
const isRedisReady = () => {
  return redisClient && redisClient.isReady;
};

// Đóng kết nối Redis
const closeRedis = async () => {
  if (redisClient) {
    await redisClient.quit();
    console.log('👋 Đã đóng kết nối Redis');
  }
};

export { initRedis, getRedisClient, isRedisReady, closeRedis };
