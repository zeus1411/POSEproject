const normalizeCatalogQueryText = (value) => String(value || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/đ/g, 'd')
  .replace(/Đ/g, 'D')
  .replace(/[^\p{L}\p{N}\s.,]/gu, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const NUMBER_WORDS = new Map([
  ['mot', 1],
  ['hai', 2],
  ['ba', 3],
  ['bon', 4],
  ['tu', 4],
  ['nam', 5],
  ['sau', 6],
  ['bay', 7],
  ['tam', 8],
  ['chin', 9],
  ['muoi', 10]
]);

const PRODUCT_COUNT_NOUN_PATTERN = '(?:san pham|mon|mat hang|loai|ket qua|lua chon)';

const clampProductLimit = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return null;
  return Math.min(Math.max(Math.round(number), 1), 10);
};

const parseNumberWord = (value) => {
  const normalized = normalizeCatalogQueryText(value);
  return NUMBER_WORDS.get(normalized) || null;
};

const detectRequestedCatalogProductLimit = (query, fallback = null) => {
  const normalized = normalizeCatalogQueryText(query);
  if (!normalized) return fallback;

  const digitPattern = new RegExp(`\\b(\\d{1,2})\\s+${PRODUCT_COUNT_NOUN_PATTERN}\\b`);
  const digitMatch = normalized.match(digitPattern);
  if (digitMatch?.[1]) {
    return clampProductLimit(digitMatch[1]);
  }

  const wordPattern = new RegExp(`\\b(${[...NUMBER_WORDS.keys()].join('|')})\\s+${PRODUCT_COUNT_NOUN_PATTERN}\\b`);
  const wordMatch = normalized.match(wordPattern);
  if (wordMatch?.[1]) {
    return clampProductLimit(parseNumberWord(wordMatch[1]));
  }

  if (
    /\b(?:chi can|chi lay|lay|dua|dua cho toi|cho toi)\s+(?:1|mot)\b/.test(normalized) ||
    /\b(?:duy nhat|mot san pham duy nhat)\b/.test(normalized)
  ) {
    return 1;
  }

  if (/\b(?:vai|mot vai)\s+san pham\b/.test(normalized)) {
    return 3;
  }

  if (
    /\b(?:nhieu|cac|nhung|danh sach|liet ke)\b/.test(normalized) &&
    !/\b(?:chi can|duy nhat)\b/.test(normalized)
  ) {
    return fallback;
  }

  if (/\bco khong\b/.test(normalized)) {
    return 1;
  }

  if (
    /\b(?:thong tin|chi tiet|mo ta)\b.*\b(?:san pham nay|san pham|mat hang)\b/.test(normalized) ||
    /\b(?:san pham nay|mat hang nay)\b.*\b(?:thong tin|chi tiet|mo ta)\b/.test(normalized)
  ) {
    return 1;
  }

  return fallback;
};

const detectCatalogRatingAverage = (query) => {
  const normalized = normalizeCatalogQueryText(query);
  if (!/\b(?:danh gia|rating|review|sao)\b/.test(normalized)) return null;

  const starMatch = normalized.match(/\b([0-5](?:[.,]\d)?)\s*sao\b/);
  if (!starMatch?.[1]) return null;

  const rating = Number(starMatch[1].replace(',', '.'));
  if (!Number.isFinite(rating) || rating < 0 || rating > 5) return null;
  return rating;
};

const isRandomCatalogQuery = (query) => {
  const normalized = normalizeCatalogQueryText(query);
  return /\b(?:ngau nhien|random|bat ky)\b/.test(normalized);
};

export {
  normalizeCatalogQueryText,
  detectRequestedCatalogProductLimit,
  detectCatalogRatingAverage,
  isRandomCatalogQuery
};
