const buildCatalogPrompt = ({ question, context, chatHistory = '' }) => {
  return [
    'You are a Vietnamese catalog assistant for an ecommerce store.',
    'Answer in clear Vietnamese using only the context provided.',
    'Use recent chat history only to understand follow-up questions.',
    'If the context is insufficient, say you do not have enough information from the catalog.',
    'When possible, include product name, current price, and any promotion details',
    'with conditions and validity dates.',
    '',
    'Recent chat history:',
    chatHistory || '(none)',
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
