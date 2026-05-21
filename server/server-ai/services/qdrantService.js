import { QdrantClient } from '@qdrant/js-client-rest';
import { InternalServerError } from '../../utils/errorHandler.js';
import {
  QDRANT_URL,
  QDRANT_API_KEY,
  QDRANT_DOCS_COLLECTION,
  QDRANT_CATALOG_COLLECTION
} from '../config/aiConfig.js';

let client;

const getClient = () => {
  if (!client) {
    client = new QdrantClient({
      url: QDRANT_URL,
      apiKey: QDRANT_API_KEY || undefined
    });
  }
  return client;
};

const getErrorData = (error) => {
  if (!error) return null;
  if (error.data) return error.data;
  if (error.response?.data) return error.response.data;
  if (error.response?.body) return error.response.body;
  return null;
};

const logUpsertError = (collectionName, points, error) => {
  const sample = Array.isArray(points) && points.length ? points[0] : null;
  const payloadKeys = sample?.payload ? Object.keys(sample.payload) : [];
  const vectorSize = Array.isArray(sample?.vector) ? sample.vector.length : null;
  const errorData = getErrorData(error);

  console.error('[qdrant] upsert failed', {
    collection: collectionName,
    points: Array.isArray(points) ? points.length : 0,
    sampleId: sample?.id || null,
    vectorSize,
    payloadKeys,
    error: {
      message: error?.message || 'Unknown error',
      status: error?.status || error?.response?.status || null,
      statusText: error?.statusText || error?.response?.statusText || null,
      data: errorData
    }
  });
};

const collectionExists = async (collectionName) => {
  const qdrant = getClient();
  const collections = await qdrant.getCollections();
  return collections.collections.some((item) => item.name === collectionName);
};

const getCollectionVectors = (collectionInfo) => {
  return (
    collectionInfo?.config?.params?.vectors ||
    collectionInfo?.result?.config?.params?.vectors ||
    null
  );
};

const getCollectionVectorSize = (collectionInfo) => {
  const vectors = getCollectionVectors(collectionInfo);
  if (!vectors) return null;
  if (typeof vectors.size === 'number') return vectors.size;

  if (typeof vectors === 'object') {
    const firstNamed = Object.values(vectors).find(
      (value) => value && typeof value.size === 'number'
    );
    return firstNamed?.size || null;
  }

  return null;
};

const hasNamedVectors = (collectionInfo) => {
  const vectors = getCollectionVectors(collectionInfo);
  if (!vectors || typeof vectors !== 'object') return false;
  return !('size' in vectors) && Object.values(vectors).some(
    (value) => value && typeof value.size === 'number'
  );
};

const ensureDocsCollection = async (vectorSize) => {
  const qdrant = getClient();
  const exists = await collectionExists(QDRANT_DOCS_COLLECTION);

  if (!exists) {
    await qdrant.createCollection(QDRANT_DOCS_COLLECTION, {
      vectors: {
        size: vectorSize,
        distance: 'Cosine'
      }
    });
    return;
  }

  const info = await qdrant.getCollection(QDRANT_DOCS_COLLECTION);
  if (hasNamedVectors(info)) {
    throw new InternalServerError(
      'Qdrant docs collection uses named vectors. Delete/recreate the collection or update the code to use named vectors.'
    );
  }
  const existingSize = getCollectionVectorSize(info);
  if (existingSize && existingSize !== vectorSize) {
    throw new InternalServerError(
      `Qdrant collection vector size mismatch. Expected ${existingSize}, got ${vectorSize}.`
    );
  }
};

const ensureCatalogCollection = async (vectorSize) => {
  const qdrant = getClient();
  const exists = await collectionExists(QDRANT_CATALOG_COLLECTION);

  if (!exists) {
    await qdrant.createCollection(QDRANT_CATALOG_COLLECTION, {
      vectors: {
        size: vectorSize,
        distance: 'Cosine'
      }
    });
    return;
  }

  const info = await qdrant.getCollection(QDRANT_CATALOG_COLLECTION);
  if (hasNamedVectors(info)) {
    throw new InternalServerError(
      'Qdrant catalog collection uses named vectors. Delete/recreate the collection or update the code to use named vectors.'
    );
  }
  const existingSize = getCollectionVectorSize(info);
  if (existingSize && existingSize !== vectorSize) {
    throw new InternalServerError(
      `Qdrant collection vector size mismatch. Expected ${existingSize}, got ${vectorSize}.`
    );
  }
};

const recreateCatalogCollection = async (vectorSize) => {
  const qdrant = getClient();
  const exists = await collectionExists(QDRANT_CATALOG_COLLECTION);

  if (exists) {
    await qdrant.deleteCollection(QDRANT_CATALOG_COLLECTION);
  }

  await qdrant.createCollection(QDRANT_CATALOG_COLLECTION, {
    vectors: {
      size: vectorSize,
      distance: 'Cosine'
    }
  });
};

const upsertDocumentChunks = async (points) => {
  if (!points.length) return;
  const qdrant = getClient();
  try {
    await qdrant.upsert(QDRANT_DOCS_COLLECTION, {
      wait: true,
      points
    });
  } catch (error) {
    logUpsertError(QDRANT_DOCS_COLLECTION, points, error);
    throw error;
  }
};

const upsertCatalogItems = async (points) => {
  if (!points.length) return;
  const qdrant = getClient();
  try {
    await qdrant.upsert(QDRANT_CATALOG_COLLECTION, {
      wait: true,
      points
    });
  } catch (error) {
    logUpsertError(QDRANT_CATALOG_COLLECTION, points, error);
    throw error;
  }
};

const searchDocumentChunks = async (vector, { limit, scoreThreshold }) => {
  const exists = await collectionExists(QDRANT_DOCS_COLLECTION);
  if (!exists) {
    return [];
  }
  const qdrant = getClient();
  return qdrant.search(QDRANT_DOCS_COLLECTION, {
    vector,
    limit,
    with_payload: true,
    score_threshold: scoreThreshold,
    filter: {
      must: [
        {
          key: 'source_type',
          match: { value: 'document' }
        }
      ]
    }
  });
};

const searchCatalogItems = async (vector, { limit, scoreThreshold }) => {
  const exists = await collectionExists(QDRANT_CATALOG_COLLECTION);
  if (!exists) {
    return [];
  }
  const qdrant = getClient();
  return qdrant.search(QDRANT_CATALOG_COLLECTION, {
    vector,
    limit,
    with_payload: true,
    score_threshold: scoreThreshold,
    filter: {
      must: [
        {
          key: 'source_type',
          match: { any: ['catalog_product', 'catalog_promotion'] }
        }
      ]
    }
  });
};

const deleteDocumentChunksByFilePath = async (filePath) => {
  if (!filePath) return null;
  const exists = await collectionExists(QDRANT_DOCS_COLLECTION);
  if (!exists) return null;

  const qdrant = getClient();
  return qdrant.delete(QDRANT_DOCS_COLLECTION, {
    wait: true,
    filter: {
      must: [
        {
          key: 'source_type',
          match: { value: 'document' }
        },
        {
          key: 'filePath',
          match: { value: filePath }
        }
      ]
    }
  });
};

const deleteDocumentChunksByFileHash = async (fileHash) => {
  if (!fileHash) return null;
  const exists = await collectionExists(QDRANT_DOCS_COLLECTION);
  if (!exists) return null;

  const qdrant = getClient();
  return qdrant.delete(QDRANT_DOCS_COLLECTION, {
    wait: true,
    filter: {
      must: [
        {
          key: 'source_type',
          match: { value: 'document' }
        },
        {
          key: 'fileHash',
          match: { value: fileHash }
        }
      ]
    }
  });
};

export {
  ensureDocsCollection,
  ensureCatalogCollection,
  recreateCatalogCollection,
  upsertDocumentChunks,
  upsertCatalogItems,
  searchDocumentChunks,
  searchCatalogItems,
  deleteDocumentChunksByFilePath,
  deleteDocumentChunksByFileHash
};
