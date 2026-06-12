const normalizeRagText = (value) => String(value || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/đ/g, 'd')
  .replace(/Đ/g, 'D')
  .replace(/[^\p{L}\p{N}\s]/gu, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const tokenize = (value) => {
  const stopWords = new Set([
    'la',
    'gi',
    'va',
    'hoac',
    'cho',
    'toi',
    'ban',
    'hay',
    've',
    'cua',
    'trong',
    'nhung',
    'cac',
    'mot',
    'duoc',
    'noi',
    'them',
    'chi',
    'tiet'
  ]);

  return normalizeRagText(value)
    .split(' ')
    .filter((token) => token.length >= 3 && !stopWords.has(token));
};

const createCitationId = (index) => `S${index + 1}`;

const attachCitationIds = (sources = []) => {
  return sources.map((source, index) => ({
    ...source,
    citationId: source.citationId || createCitationId(index)
  }));
};

const buildCitationLabel = (source) => {
  const id = source?.citationId ? `[${source.citationId}]` : '';
  const title = source?.title || source?.uri || 'Nguồn';
  const detail = source?.chunkId || source?.itemId || source?.itemType || '';
  return [id, title, detail ? `(${detail})` : ''].filter(Boolean).join(' ');
};

const rerankMatchesByLexicalOverlap = ({ matches = [], query = '', preferredSources = [] }) => {
  const queryTokens = new Set(tokenize(query));
  if (!matches.length || !queryTokens.size) return matches;

  const preferredTitles = new Set(
    preferredSources.map((source) => normalizeRagText(source.title)).filter(Boolean)
  );
  const preferredUris = new Set(
    preferredSources.map((source) => normalizeRagText(source.uri)).filter(Boolean)
  );

  return [...matches].sort((a, b) => {
    const scoreMatch = (match) => {
      const payload = match?.payload || {};
      const text = `${payload.text || ''} ${payload.fileName || ''} ${payload.title || ''}`;
      const textTokens = new Set(tokenize(text));
      let overlap = 0;
      queryTokens.forEach((token) => {
        if (textTokens.has(token)) overlap += 1;
      });

      const preferred =
        preferredTitles.has(normalizeRagText(payload.fileName || payload.title)) ||
        preferredUris.has(normalizeRagText(payload.filePath || payload.uri));

      return (match.score || 0) + overlap * 0.04 + (preferred ? 0.15 : 0);
    };

    return scoreMatch(b) - scoreMatch(a);
  });
};

export {
  normalizeRagText,
  attachCitationIds,
  buildCitationLabel,
  rerankMatchesByLexicalOverlap
};
