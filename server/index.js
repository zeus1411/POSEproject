import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import indexRoutes from './routes/indexRoutes.js';
import errorHandlerMiddleware from './middlewares/error.js';
import cookieParser from 'cookie-parser';

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
const port = process.env.PORT;
const MONGODB_URL = process.env.MONGODB_URI;
const DB_NAME = process.env.DATABASE_NAME;

// Middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '30mb' }));
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
}))

app.use(cookieParser(process.env.JWT_SECRET));



// Routes - Sử dụng indexRoutes để gom tất cả routes
app.use('/api/v1', indexRoutes);

// Xử lý lỗi
app.use(errorHandlerMiddleware);

// Kết nối MongoDB và khởi động server
mongoose
    .connect(MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName: DB_NAME,
    })
    .then(() => {
        console.log('Đã kết nối tới MongoDB');
        app.listen(port, () => {
            console.log(`🚀 Server đang chạy tại http://localhost:${port}`);
        });
    })
    .catch((err) => {
        console.error('Lỗi kết nối MongoDB:', err);
        process.exit(1);
    });