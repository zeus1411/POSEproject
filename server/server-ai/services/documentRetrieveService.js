import { DOC_TOP_K, DOC_SCORE_THRESHOLD } from '../config/aiConfig.js';
import { embedText } from './geminiService.js';
import { searchDocumentChunks } from './qdrantService.js';

const mapSource = (match) => {
  const payload = match?.payload || {};
  return {
    title: payload.fileName || payload.title || 'Document',
    uri: payload.filePath || '',
    chunkId: payload.chunkId || String(match.id || ''),
    score: match.score
  };
};

const buildContextText = (matches) => {
  const blocks = matches
    .map((match, index) => {
      const payload = match?.payload || {};
      const text = payload.text || '';
      if (!text) return '';
      return `[${index + 1}] ${text}`;
    })
    .filter(Boolean);

  return blocks.join('\n\n');
};

const retrieveDocumentContext = async ({ query }) => {
  const vector = await embedText(query);
  const matches = await searchDocumentChunks(vector, {
    limit: DOC_TOP_K,
    scoreThreshold: DOC_SCORE_THRESHOLD
  });

  const sources = matches.map(mapSource).filter((item) => item.chunkId);
  const contextText = buildContextText(matches);

  return {
    contextText,
    sources
  };
};

export { retrieveDocumentContext };
