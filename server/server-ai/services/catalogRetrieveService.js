import { CATALOG_TOP_K, CATALOG_SCORE_THRESHOLD } from '../config/aiConfig.js';
import { embedText } from './geminiService.js';
import { searchCatalogItems } from './qdrantService.js';
import { attachCitationIds, rerankMatchesByLexicalOverlap } from '../utils/ragUtils.js';

const mapSource = (match) => {
  const payload = match?.payload || {};
  return {
    title: payload.title || payload.name || 'Catalog Item',
    uri: payload.itemType === 'product'
      ? `/product/${payload.itemId || ''}`
      : payload.uri || payload.slug || '',
    itemId: payload.itemId || String(match.id || ''),
    itemType: payload.itemType || payload.source_type || 'catalog',
    price: payload.price || 0,
    minPrice: payload.minPrice || payload.price || 0,
    maxPrice: payload.maxPrice || payload.price || 0,
    score: match.score
  };
};

const buildContextText = (matches, sources) => {
  const blocks = matches
    .map((match, index) => {
      const payload = match?.payload || {};
      const text = payload.text || '';
      if (!text) return '';
      const citationId = sources[index]?.citationId || `S${index + 1}`;
      const title = sources[index]?.title || payload.title || 'Catalog Item';
      return `Source [${citationId}] (${title}, ${payload.itemType || payload.source_type || 'catalog'}):\n${text}`;
    })
    .filter(Boolean);

  return blocks.join('\n\n');
};

const retrieveCatalogContext = async ({ query }) => {
  const vector = await embedText(query);
  const matches = await searchCatalogItems(vector, {
    limit: Math.max(CATALOG_TOP_K * 4, CATALOG_TOP_K),
    scoreThreshold: CATALOG_SCORE_THRESHOLD
  });
  const rankedMatches = rerankMatchesByLexicalOverlap({
    matches,
    query
  }).slice(0, CATALOG_TOP_K);

  const sources = attachCitationIds(rankedMatches.map(mapSource).filter((item) => item.itemId));
  const contextText = buildContextText(rankedMatches, sources);

  return {
    contextText,
    sources
  };
};

export { retrieveCatalogContext };
