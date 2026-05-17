import { GoogleGenerativeAI } from '@google/generative-ai';
import { BadRequestError } from '../../utils/errorHandler.js';
import { GEMINI_API_KEY, GEMINI_MODEL, GEMINI_EMBED_MODEL } from '../config/aiConfig.js';

const FALLBACK_EMBED_MODEL = 'embedding-001';

let genAI;

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
      maxOutputTokens: 1024
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

const embedText = async (input) => {
  try {
    return await embedWithModel(GEMINI_EMBED_MODEL, input);
  } catch (error) {
    const message = String(error?.message || '');
    const shouldFallback =
      GEMINI_EMBED_MODEL !== FALLBACK_EMBED_MODEL &&
      message.includes('embedContent') &&
      message.includes('not found');

    if (shouldFallback) {
      return await embedWithModel(FALLBACK_EMBED_MODEL, input);
    }

    throw error;
  }
};

const generateGeminiAnswer = async ({ prompt, onToken }) => {
  const model = getChatModel();

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
    return fullText.trim();
  }

  const result = await model.generateContent(String(prompt || ''));
  return result.response.text().trim();
};

export { embedText, generateGeminiAnswer };
