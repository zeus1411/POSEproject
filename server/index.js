import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.js';
import errorHandlerMiddleware from './middlewares/error.js';

const app = express();
const port = process.env.PORT || 3000;
const MONGODB_URL = process.env.MONGODB_URI;

// Middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '30mb' }));
app.use(cors());

// Routes
app.use('/api/v1/auth', authRoutes);

// Xử lý lỗi
app.use(errorHandlerMiddleware);

// Kết nối MongoDB và khởi động server
mongoose
    .connect(MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log('Đã kết nối tới MongoDB');
        app.listen(port, () => {
            console.log(`Server đang chạy trên cổng ${port}`);
        });
    })
    .catch((err) => {
        console.error('Lỗi kết nối MongoDB:', err);
        process.exit(1);
    });