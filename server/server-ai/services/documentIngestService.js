import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { createRequire } from 'module';
import { pathToFileURL } from 'url';
import { OfficeParser } from 'officeparser';
import { BadRequestError } from '../../utils/errorHandler.js';
import {
  DOC_CHUNK_SIZE,
  DOC_CHUNK_OVERLAP,
  DOC_MIN_TEXT_LENGTH,
  DOC_MAX_FILE_SIZE_BYTES,
  DOC_MAX_CHUNKS_PER_UPLOAD,
  GEMINI_EMBED_MODEL,
  QDRANT_DOCS_COLLECTION
} from '../config/aiConfig.js';
import { normalizeText, chunkText } from '../utils/textUtils.js';
import { embedText } from './geminiService.js';
import {
  deleteDocumentChunksByFileHash,
  ensureDocsCollection,
  upsertDocumentChunks
} from './qdrantService.js';

const require = createRequire(import.meta.url);
let cachedPdfWorkerSrc = null;

const getPdfWorkerSrc = () => {
  if (cachedPdfWorkerSrc !== null) {
    return cachedPdfWorkerSrc;
  }

  try {
    const workerPath = require.resolve('pdfjs-dist/legacy/build/pdf.worker.mjs');
    cachedPdfWorkerSrc = pathToFileURL(workerPath).href;
  } catch (error) {
    cachedPdfWorkerSrc = '';
  }

  return cachedPdfWorkerSrc;
};

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.docx', '.pptx', '.xlsx']);
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
]);

const createPointId = () => {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }

  const bytes = crypto.randomBytes(16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

const safeUnlink = async (filePath) => {
  if (!filePath) return;
  try {
    await fs.unlink(filePath);
  } catch (error) {
    // ignore cleanup errors
  }
};

const validateDocumentFile = (file) => {
  if (!file) {
    throw new BadRequestError('File is required.');
  }

  if (file.size > DOC_MAX_FILE_SIZE_BYTES) {
    throw new BadRequestError(`File too large. Max ${Math.ceil(DOC_MAX_FILE_SIZE_BYTES / (1024 * 1024))}MB.`);
  }

  const ext = path.extname(file.originalname || '').toLowerCase();
  const isExtensionValid = ALLOWED_EXTENSIONS.has(ext);
  const isMimeValid = ALLOWED_MIME_TYPES.has(file.mimetype) || file.mimetype === 'application/octet-stream';

  if (!isExtensionValid || !isMimeValid) {
    throw new BadRequestError('Unsupported file type. Use PDF, DOCX, PPTX, or XLSX.');
  }
};

const extractTextFromFile = async (filePath) => {
  const config = {
    newlineDelimiter: '\n'
  };

  const pdfWorkerSrc = getPdfWorkerSrc();
  if (pdfWorkerSrc) {
    config.pdfWorkerSrc = pdfWorkerSrc;
  }

  const ast = await OfficeParser.parseOffice(filePath, config);
  if (!ast || typeof ast.toText !== 'function') {
    return '';
  }
  return ast.toText();
};

const buildPayload = ({
  docId,
  fileHash,
  chunkId,
  chunkIndex,
  file,
  text,
  userId
}) => {
  return {
    docId,
    fileHash,
    chunkId,
    chunkIndex,
    source_type: 'document',
    fileName: file.originalname,
    filePath: file.relativePath,
    mimeType: file.mimetype,
    text,
    embeddingModel: GEMINI_EMBED_MODEL,
    chunkSize: DOC_CHUNK_SIZE,
    chunkOverlap: DOC_CHUNK_OVERLAP,
    uploadedBy: userId || null,
    uploadedAt: new Date().toISOString()
  };
};

const ingestDocument = async ({ file, userId }) => {
  const docId = crypto.randomUUID();
  const relativePath = file?.path ? path.relative(process.cwd(), file.path) : '';
  const fileBuffer = file?.path ? await fs.readFile(file.path) : null;
  const fileHash = fileBuffer
    ? crypto.createHash('sha256').update(fileBuffer).digest('hex')
    : '';
  const enrichedFile = {
    ...file,
    relativePath
  };

  try {
    validateDocumentFile(file);

    const rawText = await extractTextFromFile(file.path);
    const cleanedText = normalizeText(rawText);

    if (!cleanedText || cleanedText.length < DOC_MIN_TEXT_LENGTH) {
      throw new BadRequestError('Unable to extract enough text from document.');
    }

    const chunks = chunkText(cleanedText, DOC_CHUNK_SIZE, DOC_CHUNK_OVERLAP);
    if (!chunks.length) {
      throw new BadRequestError('No text chunks could be created.');
    }
    if (chunks.length > DOC_MAX_CHUNKS_PER_UPLOAD) {
      throw new BadRequestError(
        `Document creates ${chunks.length} chunks, which is above the current limit of ${DOC_MAX_CHUNKS_PER_UPLOAD}. Increase DOC_CHUNK_SIZE or DOC_MAX_CHUNKS_PER_UPLOAD for larger files.`
      );
    }

    const firstVector = await embedText(chunks[0]);
    await ensureDocsCollection(firstVector.length);
    await deleteDocumentChunksByFileHash(fileHash);

    const batchSize = 50;
    let buffer = [];

    const flush = async () => {
      if (!buffer.length) return;
      await upsertDocumentChunks(buffer);
      buffer = [];
    };

    buffer.push({
      id: createPointId(),
      vector: firstVector,
      payload: buildPayload({
        docId,
        fileHash,
        chunkId: `${docId}-0`,
        chunkIndex: 0,
        file: enrichedFile,
        text: chunks[0],
        userId
      })
    });

    if (buffer.length >= batchSize) {
      await flush();
    }

    for (let index = 1; index < chunks.length; index += 1) {
      const vector = await embedText(chunks[index]);
      buffer.push({
        id: createPointId(),
        vector,
        payload: buildPayload({
          docId,
          fileHash,
          chunkId: `${docId}-${index}`,
          chunkIndex: index,
          file: enrichedFile,
          text: chunks[index],
          userId
        })
      });

      if (buffer.length >= batchSize) {
        await flush();
      }
    }

    await flush();

    return {
      docId,
      fileHash,
      fileName: file.originalname,
      chunkCount: chunks.length,
      collection: QDRANT_DOCS_COLLECTION,
      embeddingModel: GEMINI_EMBED_MODEL,
      chunkSize: DOC_CHUNK_SIZE,
      chunkOverlap: DOC_CHUNK_OVERLAP
    };
  } catch (error) {
    await safeUnlink(file?.path);
    throw error;
  }
};

export { ingestDocument };
