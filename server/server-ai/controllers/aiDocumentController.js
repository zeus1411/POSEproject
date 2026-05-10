import { StatusCodes } from 'http-status-codes';
import { BadRequestError } from '../../utils/errorHandler.js';
import { ingestDocument } from '../services/documentIngestService.js';

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

export { uploadDocument };
