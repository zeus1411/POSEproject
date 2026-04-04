import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import { createServer } from 'http';
import indexRoutes from './routes/indexRoutes.js';
import errorHandlerMiddleware from './middlewares/error.js';
import cookieParser from 'cookie-parser';
import { initRedis, closeRedis } from './config/redis.js';
import { initializeSocket } from './config/socket.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swaggerConfig.js';

// Load environment variables
dotenv.config();

// Verify required environment variables
const requiredEnvVars = ['MONGODB_URI', 'PORT', 'STRIPE_SECRET_KEY', 'CLIENT_URL', 'JWT_SECRET', 'DATABASE_NAME'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('Missing required environment variables:', missingVars.join(', '));
  process.exit(1);
}

const app = express();
const httpServer = createServer(app);
const port = process.env.PORT || 3000;
const MONGODB_URL = process.env.MONGODB_URI;
const DB_NAME = process.env.DATABASE_NAME;

console.log(`🔧 Starting server on port ${port}...`);
console.log(`🌐 Client URL configured: ${process.env.CLIENT_URL}`);

// Middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '30mb' }));
app.use(cors({
    origin: [
        process.env.CLIENT_URL
    ],
    credentials: true,
}))

app.use(cookieParser(process.env.JWT_SECRET));

// Routes - Sử dụng indexRoutes để gom tất cả routes
app.use('/api/v1', indexRoutes);

// Swagger Documentation
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Xử lý lỗi
app.use(errorHandlerMiddleware);

// Kết nối MongoDB và Redis, sau đó khởi động server
Promise.all([
    mongoose.connect(MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName: DB_NAME,
    }),
    initRedis() // Kết nối Redis (optional, app vẫn chạy nếu Redis fail)
])
    .then(([mongoConnection, redisClient]) => {
        console.log('✅ Đã kết nối tới MongoDB');
        if (redisClient) {
            console.log('✅ Đã kết nối tới Redis - Cache đã bật');
        } else {
            console.log('⚠️  Redis không khả dụng - App chạy KHÔNG có cache');
        }
        
        // Initialize Socket.IO
        initializeSocket(httpServer);
        
        httpServer.listen(port, () => {
            console.log(`🚀 Server đang chạy tại http://localhost:${port}`);
            console.log(`🔌 WebSocket đang chạy tại ws://localhost:${port}`);
        });
    })
    .catch((err) => {
        console.error('❌ Lỗi kết nối:', err);
        process.exit(1);
    });

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Đang tắt server...');
    await closeRedis();
    await mongoose.connection.close();
    console.log('👋 Server đã tắt');
    process.exit(0);
});