import { ALLOWED_AI_MODES } from '../models/AiConversation.js';
import { BadRequestError } from '../../utils/errorHandler.js';
import { retrieveDocumentContext } from '../services/documentRetrieveService.js';
import { buildDocumentPrompt } from '../services/documentPrompt.js';
import { generateGeminiAnswer } from '../services/geminiService.js';
import { retrieveCatalogContext } from '../services/catalogRetrieveService.js';
import { buildCatalogPrompt } from '../services/catalogPrompt.js';

const DEFAULT_RETRIEVAL_STRATEGY = {
  document_rag: 'document_rag:qdrant_cosine',
  catalog_qa: 'catalog_qa:qdrant_cosine'
};

const EMPTY_CONTEXT_ANSWER =
  'Toi chua tim thay thong tin phu hop trong tai lieu hien co. Ban co the cung cap them tai lieu hoac dat cau hoi ro hon.';

const EMPTY_CATALOG_ANSWER =
  'Toi chua tim thay thong tin san pham hoac khuyen mai phu hop trong catalog hien co.';

const CATALOG_KEYWORDS = [
  'san pham',
  'gia',
  'khuyen mai',
  'giam gia',
  'coupon',
  'voucher',
  'promotion',
  'discount',
  'sku',
  'ton kho',
  'stock',
  'flash sale',
  'sale'
];

const normalizeText = (value) => {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const detectModeFromMessage = (message) => {
  const normalized = normalizeText(message);
  if (!normalized) return 'document_rag';
  const isCatalog = CATALOG_KEYWORDS.some((keyword) => normalized.includes(keyword));
  return isCatalog ? 'catalog_qa' : 'document_rag';
};

const normalizeMode = (mode, message) => {
  if (!mode) return detectModeFromMessage(message);
  const normalizedMode = String(mode).toLowerCase().trim();
  if (normalizedMode === 'auto') {
    return detectModeFromMessage(message);
  }
  return normalizedMode;
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
  const normalizedMode = normalizeMode(mode, message);
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

  if (normalizedMode === 'catalog_qa') {
    const retrievalStrategy = getDefaultRetrievalStrategy(normalizedMode);
    const retrieval = await retrieveCatalogContext({
      query: String(message || '')
    });
    const sourceSummary = `catalog_qa:${retrieval.sources.length}_sources`;

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
        answer: EMPTY_CATALOG_ANSWER,
        retrievalStrategy,
        sourceSummary,
        sources: []
      };
    }

    const prompt = buildCatalogPrompt({
      question: String(message || ''),
      context: retrieval.contextText
    });

    const answer = await generateGeminiAnswer({ prompt, onToken });

    return {
      answer: answer || EMPTY_CATALOG_ANSWER,
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
