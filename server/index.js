import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import errorHandlerMiddleware from './middlewares/error.js';
import cookieParser from 'cookie-parser';

const app = express();
const port = process.env.PORT;
const MONGODB_URL = process.env.MONGODB_URI;
const DB_NAME = process.env.DATABASE_NAME;

// Middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '30mb' }));
app.use(cors());
app.use(cookieParser(process.env.JWT_SECRET));
// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);

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