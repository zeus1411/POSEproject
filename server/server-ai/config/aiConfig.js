import path from 'path';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash-latest';
const GEMINI_EMBED_MODEL = process.env.GEMINI_EMBED_MODEL || 'text-embedding-004';

const DOC_CHUNK_SIZE = Number(process.env.DOC_CHUNK_SIZE || 1000);
const DOC_CHUNK_OVERLAP = Number(process.env.DOC_CHUNK_OVERLAP || 200);
const DOC_TOP_K = Number(process.env.DOC_TOP_K || 5);
const DOC_SCORE_THRESHOLD = Number(process.env.DOC_SCORE_THRESHOLD || 0.2);
const DOC_MIN_TEXT_LENGTH = Number(process.env.DOC_MIN_TEXT_LENGTH || 30);
const DOC_MAX_FILE_SIZE_MB = Number(process.env.DOC_MAX_FILE_SIZE_MB || 25);
const DOC_MAX_FILE_SIZE_BYTES = DOC_MAX_FILE_SIZE_MB * 1024 * 1024;

const DOC_UPLOAD_DIR =
  process.env.AI_DOC_UPLOAD_DIR || path.join(process.cwd(), 'uploads', 'ai-docs');

const QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333';
const QDRANT_API_KEY = process.env.QDRANT_API_KEY || '';
const QDRANT_DOCS_COLLECTION = process.env.QDRANT_DOCS_COLLECTION || 'docs_collection';

export {
  GEMINI_API_KEY,
  GEMINI_MODEL,
  GEMINI_EMBED_MODEL,
  DOC_CHUNK_SIZE,
  DOC_CHUNK_OVERLAP,
  DOC_TOP_K,
  DOC_SCORE_THRESHOLD,
  DOC_MIN_TEXT_LENGTH,
  DOC_MAX_FILE_SIZE_MB,
  DOC_MAX_FILE_SIZE_BYTES,
  DOC_UPLOAD_DIR,
  QDRANT_URL,
  QDRANT_API_KEY,
  QDRANT_DOCS_COLLECTION
};
