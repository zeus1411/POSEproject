const buildDocumentPrompt = ({ question, context }) => {
  return [
    'You are a helpful assistant.',
    'Answer using only the context provided.',
    'If the context is insufficient, say you do not have enough information.',
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

export { buildDocumentPrompt };
