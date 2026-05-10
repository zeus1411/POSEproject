import { ALLOWED_AI_MODES } from '../models/AiConversation.js';
import { BadRequestError } from '../../utils/errorHandler.js';
import { retrieveDocumentContext } from '../services/documentRetrieveService.js';
import { buildDocumentPrompt } from '../services/documentPrompt.js';
import { generateGeminiAnswer } from '../services/geminiService.js';

const DEFAULT_RETRIEVAL_STRATEGY = {
  document_rag: 'document_rag:qdrant_cosine',
  catalog_qa: 'catalog_qa:catalog_lookup'
};

const EMPTY_CONTEXT_ANSWER =
  'Toi chua tim thay thong tin phu hop trong tai lieu hien co. Ban co the cung cap them tai lieu hoac dat cau hoi ro hon.';

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

const routeAiQuery = async ({ mode, message, conversationId, onStart, onMeta, onToken }) => {
  const normalizedMode = normalizeMode(mode);
  ensureModeSupported(normalizedMode);

  if (normalizedMode === 'document_rag') {
    const retrievalStrategy = getDefaultRetrievalStrategy(normalizedMode);
    const retrieval = await retrieveDocumentContext({
      query: String(message || '')
    });
    const sourceSummary = `document_rag:${retrieval.sources.length}_sources`;

    if (onMeta) {
      onMeta({
        conversationId,
        mode: normalizedMode,
        retrievalStrategy,
        sourceSummary,
        sources: retrieval.sources
      });
    }

    if (!retrieval.contextText) {
      return {
        answer: EMPTY_CONTEXT_ANSWER,
        retrievalStrategy,
        sourceSummary,
        sources: []
      };
    }

    const prompt = buildDocumentPrompt({
      question: String(message || ''),
      context: retrieval.contextText
    });

    const answer = await generateGeminiAnswer({ prompt, onToken });

    return {
      answer: answer || EMPTY_CONTEXT_ANSWER,
      retrievalStrategy,
      sourceSummary,
      sources: retrieval.sources
    };
  }

  const retrievalStrategy = getDefaultRetrievalStrategy(normalizedMode);
  const sourceSummary = 'phase1:no_sources';
  const answer = `Phase 1 router active. Mode=${normalizedMode}. Conversation=${conversationId || 'new'}.`;

  if (onMeta) {
    onMeta({
      conversationId,
      mode: normalizedMode,
      retrievalStrategy,
      sourceSummary,
      sources: []
    });
  }

  if (onToken) {
    onToken(answer);
  }

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
