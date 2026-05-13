import { CATALOG_TOP_K, CATALOG_SCORE_THRESHOLD } from '../config/aiConfig.js';
import { embedText } from './geminiService.js';
import { searchCatalogItems } from './qdrantService.js';

const mapSource = (match) => {
  const payload = match?.payload || {};
  return {
    title: payload.title || payload.name || 'Catalog Item',
    uri: payload.uri || payload.slug || '',
    itemId: payload.itemId || String(match.id || ''),
    itemType: payload.itemType || payload.source_type || 'catalog',
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

const retrieveCatalogContext = async ({ query }) => {
  const vector = await embedText(query);
  const matches = await searchCatalogItems(vector, {
    limit: CATALOG_TOP_K,
    scoreThreshold: CATALOG_SCORE_THRESHOLD
  });

  const sources = matches.map(mapSource).filter((item) => item.itemId);
  const contextText = buildContextText(matches);

  return {
    contextText,
    sources
  };
};

export { retrieveCatalogContext };
