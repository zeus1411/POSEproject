import { ALLOWED_AI_MODES } from '../models/AiConversation.js';
import { BadRequestError } from '../../utils/errorHandler.js';
import { retrieveDocumentContext } from '../services/documentRetrieveService.js';
import { buildDocumentPrompt } from '../services/documentPrompt.js';
import { generateGeminiAnswer } from '../services/geminiService.js';
import { retrieveCatalogContext } from '../services/catalogRetrieveService.js';
import { buildCatalogPrompt } from '../services/catalogPrompt.js';
import { buildBehaviorAnswer, detectAiIntent } from '../services/intentRouter.js';

const DEFAULT_RETRIEVAL_STRATEGY = {
  document_rag: 'document_rag:qdrant_cosine',
  catalog_qa: 'catalog_qa:qdrant_cosine'
};

const EMPTY_CONTEXT_ANSWER =
  'Toi chua tim thay thong tin phu hop trong tai lieu hien co. Ban co the cung cap them tai lieu hoac dat cau hoi ro hon.';

const EMPTY_CATALOG_ANSWER =
  'Toi chua tim thay thong tin san pham hoac khuyen mai phu hop trong catalog hien co.';

const MIN_USEFUL_ANSWER_CHARS = 180;

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

const FOLLOW_UP_KEYWORDS = [
  'tra loi dai',
  'dai hon',
  'chi tiet hon',
  'giai thich them',
  'noi tiep',
  'cau tren',
  'y tren',
  'van de nay',
  'no',
  'chung',
  'nhung nguyen nhan',
  'liet ke tiep',
  'con gi',
  'con nua',
  'tiep tuc',
  'gia no',
  'no gia bao nhieu',
  'no la gi',
  'san pham do',
  'tai lieu do',
  'file do'
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

const isFollowUpMessage = (message) => {
  const normalized = normalizeText(message);
  if (!normalized) return false;
  return FOLLOW_UP_KEYWORDS.some((keyword) => normalized.includes(keyword));
};

const buildRetrievalQuery = ({ message, chatHistory = [] }) => {
  const currentMessage = String(message || '').trim();
  if (!isFollowUpMessage(currentMessage)) {
    return currentMessage;
  }

  const previousMessages = chatHistory
    .filter((item) => ['user', 'assistant'].includes(item.role) && item.content)
    .slice(-2)
    .map((item) => `${item.role}: ${item.content}`);

  return [...previousMessages, `user: ${currentMessage}`].join('\n');
};

const buildPromptHistory = (chatHistory = []) => {
  return chatHistory
    .filter((item) => ['user', 'assistant'].includes(item.role) && item.content)
    .slice(-4)
    .map((item) => `${item.role === 'user' ? 'User' : 'Assistant'}: ${item.content}`)
    .join('\n');
};

const looksIncompleteAnswer = (answer = '') => {
  const text = String(answer || '').trim();
  if (!text) return true;
  if (text.length < MIN_USEFUL_ANSWER_CHARS) return true;
  if (/[,:;(\-–]$/.test(text)) return true;

  const normalized = normalizeText(text);
  const unfinishedEndings = [
    'va',
    'hoac',
    'gom',
    'bao gom',
    'nhu',
    'la',
    'duoc tao',
    'nguyen nhan',
    'cac'
  ];

  return unfinishedEndings.some((ending) => normalized.endsWith(ending));
};

const buildCompletionRetryPrompt = ({ prompt, answer }) => {
  return [
    prompt,
    '',
    'The previous draft was too short or incomplete:',
    answer || '(empty)',
    '',
    'Rewrite the final answer now. It must be complete, in Vietnamese, and must not end mid-sentence.'
  ].join('\n');
};

const generateAnswerWithRecovery = async ({ prompt, onToken }) => {
  const answer = await generateGeminiAnswer({ prompt, onToken });
  if (!looksIncompleteAnswer(answer)) {
    return answer;
  }

  console.warn('[ai-chat] answer looked incomplete; retrying once without streaming', {
    answerChars: answer?.length || 0
  });

  const retryPrompt = buildCompletionRetryPrompt({ prompt, answer });
  const retryAnswer = await generateGeminiAnswer({ prompt: retryPrompt });
  return retryAnswer || answer;
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

const routeAiQuery = async ({
  mode,
  message,
  conversationId,
  chatHistory = [],
  preferredSources = [],
  documentScope = null,
  onStart,
  onMeta,
  onStatus,
  onToken
}) => {
  const normalizedMode = normalizeMode(mode, message);
  ensureModeSupported(normalizedMode);
  const startedAt = Date.now();
  const retrievalQuery = buildRetrievalQuery({ message, chatHistory });
  const promptHistory = buildPromptHistory(chatHistory);
  const intent = detectAiIntent(message);

  if (onStatus) {
    onStatus({
      stage: 'analyzing',
      intent: intent.intent,
      reason: intent.reason,
      mode: normalizedMode
    });
  }

  if (intent.intent === 'behavior' && !intent.shouldSearch) {
    const answer = buildBehaviorAnswer(message);
    const retrievalStrategy = 'behavior:direct';
    const sourceSummary = 'behavior:no_sources';

    if (onMeta) {
      onMeta({
        conversationId,
        mode: normalizedMode,
        intent: intent.intent,
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
      sources: [],
      intent: intent.intent
    };
  }

  if (normalizedMode === 'document_rag') {
    const retrievalStrategy = getDefaultRetrievalStrategy(normalizedMode);
    const retrievalStartedAt = Date.now();
    if (onStatus) {
      onStatus({
        stage: 'retrieving',
        intent: intent.intent,
        mode: normalizedMode,
        retrievalQuery
      });
    }
    const retrieval = await retrieveDocumentContext({
      query: retrievalQuery,
      preferredSources,
      documentScope
    });
    const retrievalMs = Date.now() - retrievalStartedAt;
    const sourceSummary = `document_rag:${retrieval.sources.length}_sources`;

    if (onMeta) {
      onMeta({
        conversationId,
        mode: normalizedMode,
        intent: intent.intent,
        retrievalStrategy,
        sourceSummary,
        retrievalQuery,
        sources: retrieval.sources
      });
    }

    if (!retrieval.contextText) {
      return {
        answer: EMPTY_CONTEXT_ANSWER,
        retrievalStrategy,
        sourceSummary,
        sources: [],
        intent: intent.intent
      };
    }

    const prompt = buildDocumentPrompt({
      question: String(message || ''),
      context: retrieval.contextText,
      chatHistory: promptHistory
    });

    const generationStartedAt = Date.now();
    if (onStatus) {
      onStatus({
        stage: 'generating',
        intent: intent.intent,
        mode: normalizedMode,
        sourceCount: retrieval.sources.length
      });
    }
    const answer = await generateAnswerWithRecovery({ prompt, onToken });
    const generationMs = Date.now() - generationStartedAt;
    console.info('[ai-chat] document_rag completed', {
      conversationId,
      retrievalMs,
      generationMs,
      totalMs: Date.now() - startedAt,
      sources: retrieval.sources.length,
      answerChars: answer?.length || 0
    });

    return {
      answer: answer || EMPTY_CONTEXT_ANSWER,
      retrievalStrategy,
      sourceSummary,
      sources: retrieval.sources,
      intent: intent.intent
    };
  }

  if (normalizedMode === 'catalog_qa') {
    const retrievalStrategy = getDefaultRetrievalStrategy(normalizedMode);
    const retrievalStartedAt = Date.now();
    if (onStatus) {
      onStatus({
        stage: 'retrieving',
        intent: intent.intent,
        mode: normalizedMode,
        retrievalQuery
      });
    }
    const retrieval = await retrieveCatalogContext({
      query: retrievalQuery
    });
    const retrievalMs = Date.now() - retrievalStartedAt;
    const sourceSummary = `catalog_qa:${retrieval.sources.length}_sources`;

    if (onMeta) {
      onMeta({
        conversationId,
        mode: normalizedMode,
        intent: intent.intent,
        retrievalStrategy,
        sourceSummary,
        retrievalQuery,
        sources: retrieval.sources
      });
    }

    if (!retrieval.contextText) {
      return {
        answer: EMPTY_CATALOG_ANSWER,
        retrievalStrategy,
        sourceSummary,
        sources: [],
        intent: intent.intent
      };
    }

    const prompt = buildCatalogPrompt({
      question: String(message || ''),
      context: retrieval.contextText,
      chatHistory: promptHistory
    });

    const generationStartedAt = Date.now();
    if (onStatus) {
      onStatus({
        stage: 'generating',
        intent: intent.intent,
        mode: normalizedMode,
        sourceCount: retrieval.sources.length
      });
    }
    const answer = await generateAnswerWithRecovery({ prompt, onToken });
    const generationMs = Date.now() - generationStartedAt;
    console.info('[ai-chat] catalog_qa completed', {
      conversationId,
      retrievalMs,
      generationMs,
      totalMs: Date.now() - startedAt,
      sources: retrieval.sources.length,
      answerChars: answer?.length || 0
    });

    return {
      answer: answer || EMPTY_CATALOG_ANSWER,
      retrievalStrategy,
      sourceSummary,
      sources: retrieval.sources,
      intent: intent.intent
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
  buildRetrievalQuery,
  buildPromptHistory,
  looksIncompleteAnswer,
  routeAiQuery
};
