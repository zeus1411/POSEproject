import fs from 'fs/promises';
import path from 'path';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError, NotFoundError } from '../../utils/errorHandler.js';
import { DOC_UPLOAD_DIR } from '../config/aiConfig.js';
import { ingestDocument } from '../services/documentIngestService.js';
import { deleteDocumentChunksByFilePath } from '../services/qdrantService.js';

const resolveUploadPath = (fileName) => {
  const safeName = path.basename(String(fileName || '').trim());
  if (!safeName) {
    throw new BadRequestError('File name is required.');
  }

  const rootPath = path.resolve(DOC_UPLOAD_DIR);
  const fullPath = path.resolve(DOC_UPLOAD_DIR, safeName);
  if (!fullPath.startsWith(`${rootPath}${path.sep}`) && fullPath !== rootPath) {
    throw new BadRequestError('Invalid file path.');
  }

  return { fullPath, safeName };
};

const listDocuments = async (req, res, next) => {
  try {
    let entries = [];
    try {
      entries = await fs.readdir(DOC_UPLOAD_DIR, { withFileTypes: true });
    } catch (error) {
      if (error?.code !== 'ENOENT') {
        throw error;
      }
    }

    const files = await Promise.all(
      entries
        .filter((entry) => entry.isFile())
        .map(async (entry) => {
          const fullPath = path.join(DOC_UPLOAD_DIR, entry.name);
          const stats = await fs.stat(fullPath);
          const relativePath = path.relative(process.cwd(), fullPath);

          return {
            fileName: entry.name,
            relativePath,
            sizeBytes: stats.size,
            uploadedAt: stats.birthtime?.toISOString?.() || stats.mtime.toISOString(),
            lastModifiedAt: stats.mtime.toISOString()
          };
        })
    );

    files.sort((a, b) => new Date(b.lastModifiedAt) - new Date(a.lastModifiedAt));

    return res.status(StatusCodes.OK).json({
      success: true,
      data: {
        items: files
      }
    });
  } catch (error) {
    return next(error);
  }
};

const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new BadRequestError('File is required.');
    }

    const result = await ingestDocument({
      file: req.file,
      userId: req.user?.userId || null
    });

    return res.status(StatusCodes.CREATED).json({
      success: true,
      data: result
    });
  } catch (error) {
    return next(error);
  }
};

const deleteDocument = async (req, res, next) => {
  try {
    const { fileName } = req.params;
    const { fullPath, safeName } = resolveUploadPath(fileName);

    let stats;
    try {
      stats = await fs.stat(fullPath);
    } catch (error) {
      if (error?.code === 'ENOENT') {
        throw new NotFoundError('File not found.');
      }
      throw error;
    }

    const relativePath = path.relative(process.cwd(), fullPath);
    let vectorsDeleted = false;
    let vectorDeleteError = null;

    try {
      await deleteDocumentChunksByFilePath(relativePath);
      vectorsDeleted = true;
    } catch (error) {
      vectorDeleteError = error?.message || 'Failed to delete vectors';
      console.error('[ai-docs] delete vectors failed', {
        fileName: safeName,
        relativePath,
        error: vectorDeleteError
      });
    }

    await fs.unlink(fullPath);

    return res.status(StatusCodes.OK).json({
      success: true,
      data: {
        fileName: safeName,
        sizeBytes: stats.size,
        deleted: true,
        vectorsDeleted,
        vectorDeleteError
      }
    });
  } catch (error) {
    return next(error);
  }
};

export { listDocuments, uploadDocument, deleteDocument };
