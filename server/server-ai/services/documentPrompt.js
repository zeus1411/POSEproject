const buildDocumentPrompt = ({ question, context, chatHistory = '' }) => {
  return [
    'You are a Vietnamese document QA assistant for an ecommerce/aquarium website.',
    'Answer in clear Vietnamese using only the provided context.',
    'Use the recent chat history only to understand follow-up questions; do not invent facts from history.',
    'If the context is insufficient, say you do not have enough information from the uploaded documents.',
    'Prefer a complete, structured answer with short paragraphs and bullet points when the user asks for explanation or causes.',
    'Do not stop after an unfinished sentence.',
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

export { buildDocumentPrompt };
