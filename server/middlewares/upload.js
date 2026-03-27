import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Configure Cloudinary storage for products
const productStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'pose/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    format: 'webp',
    transformation: [
      { width: 800, height: 800, crop: 'limit', quality: 'auto' },
      { fetch_format: 'auto' }
    ],
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'product-' + uniqueSuffix);
  }
});

// Configure Cloudinary storage for avatars
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'pose/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    format: 'webp',
    transformation: [
      { width: 200, height: 200, crop: 'thumb', gravity: 'face', radius: 'max' },
      { fetch_format: 'auto' }
    ],
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'avatar-' + uniqueSuffix);
  }
});

// Configure Cloudinary storage for blogs
const blogStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'pose/blogs',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    format: 'webp',
    transformation: [
      { width: 1200, height: 630, crop: 'fill', gravity: 'center', quality: 'auto' }, // Standard share size
      { fetch_format: 'auto' }
    ],
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'blog-' + uniqueSuffix);
  }
});

// File filter (Already defined)
// Initializing multer instances
const upload = multer({
  storage: productStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: imageFilter
});

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB for avatars
  fileFilter: imageFilter
});

const uploadBlogImage = multer({
  storage: blogStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: imageFilter
});

export { upload, uploadAvatar, uploadBlogImage, cloudinary };