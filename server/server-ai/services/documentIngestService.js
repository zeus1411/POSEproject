import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { OfficeParser } from 'officeparser';
import { BadRequestError } from '../../utils/errorHandler.js';
import {
  DOC_CHUNK_SIZE,
  DOC_CHUNK_OVERLAP,
  DOC_MIN_TEXT_LENGTH,
  DOC_MAX_FILE_SIZE_BYTES,
  GEMINI_EMBED_MODEL,
  QDRANT_DOCS_COLLECTION
} from '../config/aiConfig.js';
import { normalizeText, chunkText } from '../utils/textUtils.js';
import { embedText } from './geminiService.js';
import { ensureDocsCollection, upsertDocumentChunks } from './qdrantService.js';

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.docx', '.pptx', '.xlsx']);
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
]);

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
  const ast = await OfficeParser.parseOffice(filePath, {
    newlineDelimiter: '\n'
  });
  if (!ast || typeof ast.toText !== 'function') {
    return '';
  }
  return ast.toText();
};

const buildPayload = ({
  docId,
  chunkId,
  chunkIndex,
  file,
  text,
  userId
}) => {
  return {
    docId,
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

    const firstVector = await embedText(chunks[0]);
    await ensureDocsCollection(firstVector.length);

    const batchSize = 50;
    let buffer = [];

    const flush = async () => {
      if (!buffer.length) return;
      await upsertDocumentChunks(buffer);
      buffer = [];
    };

    buffer.push({
      id: `${docId}-0`,
      vector: firstVector,
      payload: buildPayload({
        docId,
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
        id: `${docId}-${index}`,
        vector,
        payload: buildPayload({
          docId,
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
