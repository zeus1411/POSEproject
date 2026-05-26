import { StatusCodes } from 'http-status-codes';
import { getCatalogSyncStatus, syncCatalogIndex } from '../services/catalogIngestService.js';

const syncCatalog = async (req, res, next) => {
  try {
    const reason = req.body?.reason || 'manual';
    const result = await syncCatalogIndex({ reason });

    return res.status(StatusCodes.OK).json({
      success: true,
      data: result
    });
  } catch (error) {
    return next(error);
  }
};

const getCatalogStatus = async (req, res, next) => {
  try {
    return res.status(StatusCodes.OK).json({
      success: true,
      data: getCatalogSyncStatus()
    });
  } catch (error) {
    return next(error);
  }
};

export { syncCatalog, getCatalogStatus };
