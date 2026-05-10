import { QdrantClient } from '@qdrant/js-client-rest';
import { InternalServerError } from '../../utils/errorHandler.js';
import { QDRANT_URL, QDRANT_API_KEY, QDRANT_DOCS_COLLECTION } from '../config/aiConfig.js';

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

const collectionExists = async (collectionName) => {
  const qdrant = getClient();
  const collections = await qdrant.getCollections();
  return collections.collections.some((item) => item.name === collectionName);
};

const getCollectionVectorSize = (collectionInfo) => {
  return (
    collectionInfo?.config?.params?.vectors?.size ||
    collectionInfo?.result?.config?.params?.vectors?.size ||
    null
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
  const existingSize = getCollectionVectorSize(info);
  if (existingSize && existingSize !== vectorSize) {
    throw new InternalServerError(
      `Qdrant collection vector size mismatch. Expected ${existingSize}, got ${vectorSize}.`
    );
  }
};

const upsertDocumentChunks = async (points) => {
  if (!points.length) return;
  const qdrant = getClient();
  await qdrant.upsert(QDRANT_DOCS_COLLECTION, {
    wait: true,
    points
  });
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

export { ensureDocsCollection, upsertDocumentChunks, searchDocumentChunks };
