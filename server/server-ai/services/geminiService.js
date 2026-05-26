import { GoogleGenerativeAI } from '@google/generative-ai';
import { ApiError, BadRequestError } from '../../utils/errorHandler.js';
import {
  GEMINI_API_KEY,
  GEMINI_MODEL,
  GEMINI_EMBED_MODEL,
  GEMINI_EMBED_MAX_RETRIES,
  GEMINI_EMBED_RETRY_BUFFER_MS,
  GEMINI_MAX_OUTPUT_TOKENS
} from '../config/aiConfig.js';

const FALLBACK_EMBED_MODEL = 'embedding-001';

let genAI;
const embeddingCache = new Map();

const MIN_RETRY_DELAY_MS = 1000;
const MAX_RETRY_DELAY_MS = 120000;
const EMBEDDING_CACHE_MAX_ITEMS = 500;

const getGenAi = () => {
  if (!GEMINI_API_KEY) {
    throw new BadRequestError('Missing Gemini API key. Set GEMINI_API_KEY.');
  }
  if (!genAI) {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  }
  return genAI;
};

const getChatModel = () => {
  const client = getGenAi();
  return client.getGenerativeModel({
    model: GEMINI_MODEL,
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: GEMINI_MAX_OUTPUT_TOKENS
    }
  });
};

const embedWithModel = async (modelName, input) => {
  const client = getGenAi();
  const model = client.getGenerativeModel({ model: modelName });
  const result = await model.embedContent(String(input || ''));
  const values = result?.embedding?.values || result?.embedding?.value || result?.embedding;
  if (!Array.isArray(values)) {
    throw new BadRequestError('Embedding failed.');
  }
  return values;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isRateLimitError = (error) => {
  const message = String(error?.message || '').toLowerCase();
  const status = error?.status || error?.response?.status || null;
  return (
    status === 429 ||
    message.includes('too many requests') ||
    message.includes('quota exceeded') ||
    message.includes('rate limit')
  );
};

const toAiProviderError = (error, operation = 'AI request') => {
  if (isRateLimitError(error)) {
    const retryDelayMs = extractRetryDelayMs(error);
    const retrySeconds = retryDelayMs ? Math.ceil(retryDelayMs / 1000) : null;
    const retryText = retrySeconds ? ` Please retry in about ${retrySeconds} seconds.` : '';
    return new ApiError(
      429,
      `${operation} hit the Gemini quota/rate limit.${retryText}`
    );
  }

  return error;
};

const extractRetryDelayMs = (error) => {
  const message = String(error?.message || '');

  const jsonMatch = message.match(/"retryDelay"\s*:\s*"(\d+(?:\.\d+)?)s"/i);
  if (jsonMatch?.[1]) {
    return Number(jsonMatch[1]) * 1000;
  }

  const textMatch = message.match(/retry\s+in\s+(\d+(?:\.\d+)?)s/i);
  if (textMatch?.[1]) {
    return Number(textMatch[1]) * 1000;
  }

  return null;
};

const getRetryDelayMs = (error, attempt) => {
  const retryDelayMs = extractRetryDelayMs(error);
  if (retryDelayMs) {
    return retryDelayMs;
  }

  const backoffMs = MIN_RETRY_DELAY_MS * Math.pow(2, attempt);
  return Math.min(backoffMs, MAX_RETRY_DELAY_MS);
};

const embedWithRetry = async (modelName, input) => {
  let attempt = 0;

  while (true) {
    try {
      return await embedWithModel(modelName, input);
    } catch (error) {
      if (!isRateLimitError(error) || attempt >= GEMINI_EMBED_MAX_RETRIES) {
        throw toAiProviderError(error, 'Embedding');
      }

      const delayMs = getRetryDelayMs(error, attempt);
      const totalDelayMs = Math.min(
        delayMs + GEMINI_EMBED_RETRY_BUFFER_MS,
        MAX_RETRY_DELAY_MS
      );

      attempt += 1;
      console.warn(
        `[gemini] rate limited (embed). retrying in ${Math.round(totalDelayMs)}ms (attempt ${attempt}/${GEMINI_EMBED_MAX_RETRIES}).`
      );
      await sleep(totalDelayMs);
    }
  }
};

const embedText = async (input) => {
  const normalizedInput = String(input || '').trim();
  const cacheKey = `${GEMINI_EMBED_MODEL}:${normalizedInput}`;
  const cached = embeddingCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const vector = await embedWithRetry(GEMINI_EMBED_MODEL, normalizedInput);
    embeddingCache.set(cacheKey, vector);
    if (embeddingCache.size > EMBEDDING_CACHE_MAX_ITEMS) {
      const oldestKey = embeddingCache.keys().next().value;
      embeddingCache.delete(oldestKey);
    }
    return vector;
  } catch (error) {
    const message = String(error?.message || '');
    const shouldFallback =
      GEMINI_EMBED_MODEL !== FALLBACK_EMBED_MODEL &&
      message.includes('embedContent') &&
      message.includes('not found');

    if (shouldFallback) {
      const vector = await embedWithRetry(FALLBACK_EMBED_MODEL, normalizedInput);
      embeddingCache.set(`${FALLBACK_EMBED_MODEL}:${normalizedInput}`, vector);
      return vector;
    }

    throw toAiProviderError(error, 'Embedding');
  }
};

const generateGeminiAnswer = async ({ prompt, onToken }) => {
  const model = getChatModel();

  try {
    if (onToken) {
      const stream = await model.generateContentStream(String(prompt || ''));
      let fullText = '';
      for await (const chunk of stream.stream) {
        const text = chunk.text();
        if (text) {
          fullText += text;
          onToken(text);
        }
      }

      try {
        const response = await stream.response;
        const candidate = response?.candidates?.[0];
        console.info('[gemini] stream completed', {
          model: GEMINI_MODEL,
          finishReason: candidate?.finishReason || null,
          safetyRatings: candidate?.safetyRatings || [],
          outputChars: fullText.length
        });
      } catch (inspectError) {
        console.warn('[gemini] stream response inspection failed', inspectError?.message || inspectError);
      }

      return fullText.trim();
    }

    const result = await model.generateContent(String(prompt || ''));
    const text = result.response.text().trim();
    const candidate = result.response?.candidates?.[0];
    console.info('[gemini] generation completed', {
      model: GEMINI_MODEL,
      finishReason: candidate?.finishReason || null,
      safetyRatings: candidate?.safetyRatings || [],
      outputChars: text.length
    });
    return text;
  } catch (error) {
    throw toAiProviderError(error, 'Answer generation');
  }
};

export { embedText, generateGeminiAnswer };
