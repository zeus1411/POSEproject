import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { BadRequestError } from '../../utils/errorHandler.js';
import { DOC_UPLOAD_DIR, DOC_MAX_FILE_SIZE_BYTES } from '../config/aiConfig.js';

const ensureUploadDir = () => {
  if (!fs.existsSync(DOC_UPLOAD_DIR)) {
    fs.mkdirSync(DOC_UPLOAD_DIR, { recursive: true });
  }
};

const safeFileName = (originalName) => {
  const base = path.basename(originalName || 'document');
  return base.replace(/[^a-zA-Z0-9._-]/g, '_');
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    ensureUploadDir();
    cb(null, DOC_UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}-${safeFileName(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname || '').toLowerCase();
  if (!['.pdf', '.docx', '.pptx', '.xlsx'].includes(ext)) {
    return cb(new BadRequestError('Unsupported file type. Use PDF, DOCX, PPTX, or XLSX.'));
  }
  return cb(null, true);
};

const uploadAiDocument = multer({
  storage,
  limits: { fileSize: DOC_MAX_FILE_SIZE_BYTES },
  fileFilter
});

export { uploadAiDocument };
