const buildCatalogPrompt = ({ question, context }) => {
  return [
    'You are a catalog assistant for an ecommerce store.',
    'Answer using only the context provided.',
    'If the context is insufficient, say you do not have enough information.',
    'When possible, include product name, current price, and any promotion details',
    'with conditions and validity dates.',
    '',
    'Context:',
    context,
    '',
    'Question:',
    question,
    '',
    'Answer:'
  ].join('\n');
};

export { buildCatalogPrompt };
