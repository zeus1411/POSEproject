const normalizeText = (input = '') => {
  return String(input).replace(/\s+/g, ' ').trim();
};

const chunkText = (input, chunkSize, overlap) => {
  const text = normalizeText(input);
  if (!text) return [];

  const size = Math.max(200, Number(chunkSize) || 1000);
  const maxOverlap = Math.floor(size * 0.5);
  const safeOverlap = Math.min(Math.max(0, Number(overlap) || 0), maxOverlap);
  const chunks = [];

  let start = 0;
  while (start < text.length) {
    let end = Math.min(start + size, text.length);

    if (end < text.length) {
      const lastSpace = text.lastIndexOf(' ', end);
      if (lastSpace > start + Math.floor(size * 0.6)) {
        end = lastSpace;
      }
    }

    const chunk = text.slice(start, end).trim();
    if (chunk) {
      chunks.push(chunk);
    }

    if (end >= text.length) {
      break;
    }

    start = Math.max(0, end - safeOverlap);
    if (start === end) {
      start = end + 1;
    }
  }

  return chunks;
};

export { normalizeText, chunkText };
