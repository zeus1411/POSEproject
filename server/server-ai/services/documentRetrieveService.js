import { DOC_TOP_K, DOC_SCORE_THRESHOLD } from '../config/aiConfig.js';
import { embedText } from './geminiService.js';
import { searchDocumentChunks } from './qdrantService.js';
import { attachCitationIds, rerankMatchesByLexicalOverlap } from '../utils/ragUtils.js';

const normalizeValue = (value) => String(value || '').toLowerCase().trim();

const mapSource = (match) => {
  const payload = match?.payload || {};
  return {
    title: payload.fileName || payload.title || 'Document',
    uri: payload.filePath || '',
    docId: payload.docId || '',
    fileHash: payload.fileHash || '',
    chunkId: payload.chunkId || String(match.id || ''),
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
      const title = sources[index]?.title || payload.fileName || 'Document';
      return `Source [${citationId}] (${title}, chunk ${payload.chunkId || index + 1}):\n${text}`;
    })
    .filter(Boolean);

  return blocks.join('\n\n');
};

const applyConversationBias = (matches, preferredSources = []) => {
  if (!preferredSources.length) return matches;

  const preferredTitles = new Set(
    preferredSources
      .map((source) => normalizeValue(source.title))
      .filter(Boolean)
  );
  const preferredUris = new Set(
    preferredSources
      .map((source) => normalizeValue(source.uri))
      .filter(Boolean)
  );

  if (!preferredTitles.size && !preferredUris.size) return matches;

  const preferredMatches = [];
  const otherMatches = [];

  matches.forEach((match) => {
    const payload = match?.payload || {};
    const isPreferred =
      preferredTitles.has(normalizeValue(payload.fileName || payload.title)) ||
      preferredUris.has(normalizeValue(payload.filePath || payload.uri));
    if (isPreferred) {
      preferredMatches.push(match);
    } else {
      otherMatches.push(match);
    }
  });

  const sortableMatches = preferredMatches.length >= 2
    ? preferredMatches
    : [...preferredMatches, ...otherMatches];

  return sortableMatches.sort((a, b) => {
    const payloadA = a?.payload || {};
    const payloadB = b?.payload || {};
    const aPreferred =
      preferredTitles.has(normalizeValue(payloadA.fileName || payloadA.title)) ||
      preferredUris.has(normalizeValue(payloadA.filePath || payloadA.uri));
    const bPreferred =
      preferredTitles.has(normalizeValue(payloadB.fileName || payloadB.title)) ||
      preferredUris.has(normalizeValue(payloadB.filePath || payloadB.uri));

    if (aPreferred !== bPreferred) {
      return aPreferred ? -1 : 1;
    }

    return (b.score || 0) - (a.score || 0);
  });
};

const getDocumentScopeFromSources = (sources = []) => {
  return {
    fileNames: sources.map((source) => source.title).filter(Boolean),
    docIds: sources.map((source) => source.docId).filter(Boolean),
    fileHashes: sources.map((source) => source.fileHash).filter(Boolean)
  };
};

const retrieveDocumentContext = async ({
  query,
  preferredSources = [],
  documentScope = null
}) => {
  const vector = await embedText(query);
  const inferredScope = documentScope || (
    preferredSources.length ? getDocumentScopeFromSources(preferredSources) : {}
  );
  const matches = await searchDocumentChunks(vector, {
    limit: Math.max(DOC_TOP_K * 4, DOC_TOP_K),
    scoreThreshold: DOC_SCORE_THRESHOLD,
    ...inferredScope
  });
  const biasedMatches = applyConversationBias(matches, preferredSources);
  const rankedMatches = rerankMatchesByLexicalOverlap({
    matches: biasedMatches,
    query,
    preferredSources
  }).slice(0, DOC_TOP_K);

  const sources = attachCitationIds(rankedMatches.map(mapSource).filter((item) => item.chunkId));
  const contextText = buildContextText(rankedMatches, sources);

  return {
    contextText,
    sources
  };
};

export { retrieveDocumentContext };
