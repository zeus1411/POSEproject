import { ALLOWED_AI_MODES } from '../models/AiConversation.js';
import { BadRequestError } from '../../utils/errorHandler.js';

const DEFAULT_RETRIEVAL_STRATEGY = {
  document_rag: 'document_rag:semantic',
  catalog_qa: 'catalog_qa:catalog_lookup'
};

const normalizeMode = (mode) => {
  if (!mode) return 'document_rag';
  return String(mode).toLowerCase();
};

const ensureModeSupported = (mode) => {
  if (!ALLOWED_AI_MODES.includes(mode)) {
    throw new BadRequestError('Unsupported mode. Use document_rag or catalog_qa.');
  }
};

const getDefaultRetrievalStrategy = (mode) => {
  return DEFAULT_RETRIEVAL_STRATEGY[mode] || 'unknown';
};

const routeAiQuery = async ({ mode, message, conversationId }) => {
  const normalizedMode = normalizeMode(mode);
  ensureModeSupported(normalizedMode);

  const retrievalStrategy = getDefaultRetrievalStrategy(normalizedMode);
  const sourceSummary = 'phase1:no_sources';

  const answer = `Phase 1 router active. Mode=${normalizedMode}. Conversation=${conversationId || 'new'}.`;

  return {
    answer,
    retrievalStrategy,
    sourceSummary,
    sources: []
  };
};

export {
  normalizeMode,
  ensureModeSupported,
  getDefaultRetrievalStrategy,
  routeAiQuery
};
