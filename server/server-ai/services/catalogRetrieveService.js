import { CATALOG_TOP_K, CATALOG_SCORE_THRESHOLD } from '../config/aiConfig.js';
import Category from '../../server-ecommerce/models/Category.js';
import Product from '../../server-ecommerce/models/Product.js';
import Promotion from '../../server-ecommerce/models/Promotion.js';
import { embedText } from './geminiService.js';
import { searchCatalogItems } from './qdrantService.js';
import { attachCitationIds, rerankMatchesByLexicalOverlap } from '../utils/ragUtils.js';
import {
  detectCatalogRatingAverage,
  detectCatalogPriceRange,
  detectRequestedCatalogProductLimit,
  isRandomCatalogQuery
} from '../utils/catalogQueryIntent.js';

const escapeRegex = (value) => String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizeText = (value) => String(value || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/đ/g, 'd')
  .replace(/Đ/g, 'D')
  .replace(/[^\p{L}\p{N}\s]/gu, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const VIETNAMESE_CHAR_CLASSES = {
  a: '[aáàảãạăắằẳẵặâấầẩẫậ]',
  d: '[dđ]',
  e: '[eéèẻẽẹêếềểễệ]',
  i: '[iíìỉĩị]',
  o: '[oóòỏõọôốồổỗộơớờởỡợ]',
  u: '[uúùủũụưứừửữự]',
  y: '[yýỳỷỹỵ]'
};

const buildLooseVietnameseRegex = (term) => {
  const normalized = normalizeText(term);
  if (!normalized) return null;

  const pattern = [...normalized]
    .map((char) => {
      if (VIETNAMESE_CHAR_CLASSES[char]) return VIETNAMESE_CHAR_CLASSES[char];
      if (/\s/.test(char)) return '\\s+';
      return escapeRegex(char);
    })
    .join('');

  return new RegExp(pattern, 'i');
};

const QUERY_STOP_WORDS = new Set([
  'ban',
  'bat',
  'cho',
  'toi',
  'can',
  'hay',
  'nhe',
  'vui',
  'long',
  'giup',
  'minh',
  'shop',
  'tim',
  'xem',
  'mot',
  'san',
  'pham',
  'cua',
  'hien',
  'trong',
  'muc',
  'co',
  'khong',
  'duoc',
  'khach',
  'hang',
  'goi',
  'de',
  'danh',
  'xuat',
  'tu',
  'van',
  'voi',
  've',
  'gia',
  'sao',
  'so',
  'tong',
  'vay',
  'nao',
  'nhung',
  'ngau',
  'nhien',
  'cac',
  'ho',
  'be',
  'thu',
  'kiem',
  'tra',
  'lai',
  'dua',
  'lay',
  'duoi',
  'tren',
  'nho',
  'lon',
  'cao',
  'hon',
  'it',
  'qua',
  'da',
  'min',
  'max',
  'con'
]);

const unique = (items) => [...new Set(items.filter(Boolean))];

const tokenizeQuery = (value) => normalizeText(value)
  .split(' ')
  .filter((token) => token.length >= 3 && !QUERY_STOP_WORDS.has(token));

const isMoneyToken = (token) =>
  /^\d+(?:k|nghin|ngan|trieu|m)?$/.test(normalizeText(token));

const getVariantPriceRange = (variants = []) => {
  const activeVariants = variants.filter((variant) => variant && variant.isActive !== false);
  const prices = activeVariants
    .map((variant) => Number(variant.price))
    .filter((value) => Number.isFinite(value));
  if (!prices.length) return null;
  return {
    min: Math.min(...prices),
    max: Math.max(...prices)
  };
};

const getVariantStockTotal = (variants = []) => variants
  .filter((variant) => variant && variant.isActive !== false)
  .reduce((total, variant) => total + (Number(variant.stock) || 0), 0);

const formatNumber = (value) => {
  if (!Number.isFinite(Number(value))) return '0';
  return new Intl.NumberFormat('vi-VN').format(Number(value));
};

const formatPrice = (product) => {
  const variantRange = getVariantPriceRange(product.variants || []);
  const basePrice = Number(product.price) || 0;
  if (!variantRange) return formatNumber(basePrice);
  if (variantRange.min === variantRange.max) return formatNumber(variantRange.min);
  return `${formatNumber(variantRange.min)} - ${formatNumber(variantRange.max)}`;
};

const stripHtml = (value) => String(value || '')
  .replace(/<[^>]*>/g, ' ')
  .replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/\s+/g, ' ')
  .trim();

const getStock = (product) => product.hasVariants
  ? getVariantStockTotal(product.variants || [])
  : Number(product.stock) || 0;

const hasStock = (product) => getStock(product) > 0;

const getComparablePrices = (product) => {
  if (product.hasVariants) {
    return (product.variants || [])
      .filter((variant) => variant && variant.isActive !== false)
      .map((variant) => Number(variant.price))
      .filter((value) => Number.isFinite(value));
  }

  const price = Number(product.price);
  return Number.isFinite(price) ? [price] : [];
};

const buildPriceCondition = (priceRange) => {
  if (!priceRange || (priceRange.min === null && priceRange.max === null)) return null;

  const condition = {};
  if (priceRange.min !== null && Number.isFinite(Number(priceRange.min))) {
    condition.$gte = Number(priceRange.min);
  }
  if (priceRange.max !== null && Number.isFinite(Number(priceRange.max))) {
    condition[priceRange.maxExclusive ? '$lt' : '$lte'] = Number(priceRange.max);
  }

  return Object.keys(condition).length ? condition : null;
};

const buildPriceMongoFilter = (priceRange) => {
  const priceCondition = buildPriceCondition(priceRange);
  if (!priceCondition) return null;

  return {
    $or: [
      {
        hasVariants: true,
        variants: {
          $elemMatch: {
            isActive: { $ne: false },
            price: priceCondition
          }
        }
      },
      {
        $or: [
          { hasVariants: false },
          { hasVariants: { $exists: false } }
        ],
        price: priceCondition
      }
    ]
  };
};

const productMatchesPriceRange = (product, priceRange) => {
  const priceCondition = buildPriceCondition(priceRange);
  if (!priceCondition) return true;

  return getComparablePrices(product).some((price) => {
    if (priceCondition.$gte !== undefined && price < priceCondition.$gte) return false;
    if (priceCondition.$lte !== undefined && price > priceCondition.$lte) return false;
    if (priceCondition.$lt !== undefined && price >= priceCondition.$lt) return false;
    return true;
  });
};

const buildProductContextText = (product, categoryName = '') => [
  'Type: product',
  `Name: ${product.name}`,
  product.sku ? `SKU: ${product.sku}` : '',
  categoryName ? `Category: ${categoryName}` : '',
  `Price: ${formatPrice(product)}`,
  Number(product.originalPrice) ? `Original price: ${formatNumber(product.originalPrice)}` : '',
  Number(product.discount) > 0 ? `Discount percent: ${formatNumber(product.discount)}` : '',
  `Stock: ${formatNumber(getStock(product))}`,
  `Sold count: ${formatNumber(product.soldCount || 0)}`,
  `View count: ${formatNumber(product.viewCount || 0)}`,
  `Rating average: ${Number(product.rating?.average) || 0}`,
  `Rating count: ${formatNumber(product.rating?.count || 0)}`,
  product.isFeatured ? 'Featured: yes' : 'Featured: no',
  product.isNew ? 'New product: yes' : 'New product: no',
  product.tags?.length ? `Tags: ${product.tags.join(', ')}` : '',
  product.description ? `Description: ${stripHtml(product.description).slice(0, 1200)}` : ''
].filter(Boolean).join('\n');

const buildPromotionContextText = (promotion) => {
  const conditions = promotion.conditions || {};
  const formatDate = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().slice(0, 10);
  };

  return [
    'Type: promotion',
    `Name: ${promotion.name}`,
    promotion.code ? `Code: ${promotion.code}` : '',
    promotion.discountType ? `Discount type: ${promotion.discountType}` : '',
    Number.isFinite(Number(promotion.discountValue))
      ? `Discount value: ${formatNumber(promotion.discountValue)}`
      : '',
    `Min order value: ${formatNumber(conditions.minOrderValue || 0)}`,
    `Min quantity: ${formatNumber(conditions.minQuantity || 0)}`,
    conditions.maxDiscount ? `Max discount: ${formatNumber(conditions.maxDiscount)}` : '',
    conditions.firstOrderOnly ? 'First order only: yes' : 'First order only: no',
    promotion.startDate ? `Valid from: ${formatDate(promotion.startDate)}` : '',
    promotion.endDate ? `Valid until: ${formatDate(promotion.endDate)}` : '',
    promotion.isActive ? 'Active: yes' : 'Active: no'
  ].filter(Boolean).join('\n');
};

const buildCategoryLookup = async () => {
  const categories = await Category.find({}).select('name slug parentId').lean();
  return new Map(categories.map((category) => [String(category._id), category]));
};

const detectProductSearchTerms = (query) => {
  const normalized = normalizeText(query);
  const terms = [];
  const hasStrongCatalogTerm = /phu kien|loc|vat lieu loc|den|anh sang|phan nen|thuc an|tep|cay|seachem/.test(normalized);

  if (/\bcay\b|cay thuy sinh|thuc vat|rong\b/.test(normalized)) {
    terms.push('cay', 'thuy sinh', 'rong');
  }
  if (/\bloc\b|vat lieu loc|phu kien loc|phu kien.*loc|filter/.test(normalized)) {
    terms.push('loc', 'vat lieu loc', 'phu kien loc', 'filter');
  }
  if (/phu kien/.test(normalized)) {
    terms.push('phu kien');
  }
  if (/\bden\b|anh sang/.test(normalized)) {
    terms.push('den', 'anh sang');
  }
  if (/phan nen|\bnen\b/.test(normalized)) {
    terms.push('phan nen', 'nen');
  }
  if (/thuc an/.test(normalized)) {
    terms.push('thuc an');
  }
  if (/\bca\b/.test(normalized) && !/\b(ho|be)\s+ca\b/.test(normalized) && !hasStrongCatalogTerm) {
    terms.push('ca');
  }
  if (/\btep\b/.test(normalized)) {
    terms.push('tep');
  }

  const queryTokens = tokenizeQuery(query).filter((token) => !isMoneyToken(token));
  terms.push(...queryTokens);
  for (let index = 0; index < queryTokens.length - 1; index += 1) {
    terms.push(`${queryTokens[index]} ${queryTokens[index + 1]}`);
  }
  return unique(terms);
};

const isTopSellerQuery = (query) => {
  const normalized = normalizeText(query);
  return /ban chay|mua nhieu|duoc mua nhieu|top|pho bien/.test(normalized);
};

const isSuggestionQuery = (query) => {
  const normalized = normalizeText(query);
  return /goi y|de xuat|tu van|dang co|con hang|tim|can|cho toi|co nhung/.test(normalized);
};

const isPromotionQuery = (query) => {
  const normalized = normalizeText(query);
  return /khuyen mai|ma giam gia|coupon|voucher|giam gia|flash sale|sale|discount/.test(normalized);
};

const buildSearchRegexes = (terms) => unique(
  terms.flatMap((term) => {
    const normalized = normalizeText(term);
    const words = normalized.split(' ').filter(Boolean);
    return [normalized, ...words];
  })
)
  .filter((term) => term.length >= 3 && !QUERY_STOP_WORDS.has(term))
  .map(buildLooseVietnameseRegex)
  .filter(Boolean);

const scoreProductMatch = ({ product, category, terms }) => {
  const categoryText = normalizeText(`${category?.name || ''} ${category?.slug || ''}`);
  const nameText = normalizeText(product.name || '');
  const skuText = normalizeText(product.sku || '');
  const tagText = normalizeText((product.tags || []).join(' '));
  const descriptionText = normalizeText(product.description || '');
  const searchableText = `${nameText} ${skuText} ${tagText} ${categoryText} ${descriptionText}`;

  return terms.reduce((score, term) => {
    const normalizedTerm = normalizeText(term);
    if (!normalizedTerm) return score;
    if (normalizedTerm.includes(' ') && nameText.includes(normalizedTerm)) return score + 16;
    if (nameText.includes(normalizedTerm)) return score + 8;
    if (skuText.includes(normalizedTerm)) return score + 7;
    if (categoryText.includes(normalizedTerm)) return score + 6;
    if (tagText.includes(normalizedTerm)) return score + 5;
    if (descriptionText.includes(normalizedTerm)) return score + 2;
    if (normalizedTerm.split(' ').some((word) => word.length >= 3 && searchableText.includes(word))) {
      return score + 1;
    }
    return score;
  }, 0);
};

const buildProductMatch = ({ product, category, terms, baseScore = 0.75 }) => {
  const relevanceScore = scoreProductMatch({ product, category, terms });
  return {
    payload: {
      source_type: 'catalog_product',
      itemType: 'product',
      itemId: String(product._id),
      title: product.name,
      name: product.name,
      uri: `/product/${product._id}`,
      price: Number(product.price) || 0,
      minPrice: getVariantPriceRange(product.variants || [])?.min || Number(product.price) || 0,
      maxPrice: getVariantPriceRange(product.variants || [])?.max || Number(product.price) || 0,
      stock: getStock(product),
      soldCount: Number(product.soldCount) || 0,
      ratingAverage: Number(product.rating?.average) || 0,
      ratingCount: Number(product.rating?.count) || 0,
      text: buildProductContextText(product, category?.name || '')
    },
    score: Math.max(Number(baseScore) || 0, 0.75 + relevanceScore * 0.02),
    relevanceScore
  };
};

const buildPromotionMatch = ({ promotion, baseScore = 0.75 }) => ({
  payload: {
    source_type: 'catalog_promotion',
    itemType: 'promotion',
    itemId: String(promotion._id),
    title: promotion.name,
    name: promotion.name,
    code: promotion.code,
    uri: '',
    text: buildPromotionContextText(promotion)
  },
  score: Number(baseScore) || 0.75,
  relevanceScore: 0
});

const findDirectCatalogProducts = async ({ query, limit }) => {
  const terms = detectProductSearchTerms(query);
  const ratingAverage = detectCatalogRatingAverage(query);
  const priceRange = detectCatalogPriceRange(query);
  const hasStructuredFilter = ratingAverage !== null || Boolean(priceRange);
  if (!terms.length && !isTopSellerQuery(query) && !isSuggestionQuery(query) && !hasStructuredFilter) {
    return [];
  }

  const categoryLookup = await buildCategoryLookup();
  const matchingCategoryIds = [...categoryLookup.entries()]
    .filter(([, category]) => {
      const categoryText = normalizeText(`${category.name || ''} ${category.slug || ''}`);
      return terms.some((term) => categoryText.includes(normalizeText(term)));
    })
    .map(([id]) => id);

  const orConditions = [];
  if (matchingCategoryIds.length) {
    orConditions.push({ categoryId: { $in: matchingCategoryIds } });
  }

  buildSearchRegexes(terms).forEach((regex) => {
    orConditions.push(
      { name: regex },
      { tags: regex },
      { description: regex },
      { sku: regex }
    );
  });

  const priceFilter = buildPriceMongoFilter(priceRange);
  const andConditions = [];
  if (priceFilter) {
    andConditions.push(priceFilter);
  }
  if (orConditions.length) {
    andConditions.push({ $or: orConditions });
  }

  const queryFilter = {
    status: 'ACTIVE',
    ...(ratingAverage !== null
      ? { 'rating.average': { $gte: ratingAverage, $lt: Math.min(ratingAverage + 1, 5.01) } }
      : {}),
    ...(andConditions.length ? { $and: andConditions } : {})
  };

  const sortOption = isTopSellerQuery(query)
    ? { soldCount: -1, 'rating.average': -1, viewCount: -1, createdAt: -1 }
    : { isFeatured: -1, soldCount: -1, 'rating.average': -1, viewCount: -1, createdAt: -1 };

  const productLimit = Math.max(limit * 30, 100);
  const products = isRandomCatalogQuery(query)
    ? await Product.aggregate([
      { $match: queryFilter },
      { $sample: { size: productLimit } }
    ])
    : await Product.find(queryFilter)
      .select('name sku slug price originalPrice discount stock variants hasVariants categoryId tags rating soldCount viewCount isFeatured isNew status createdAt description')
      .sort(sortOption)
      .limit(productLimit)
      .lean();

  return products
    .filter(hasStock)
    .filter((product) => productMatchesPriceRange(product, priceRange))
    .map((product) => {
      const category = categoryLookup.get(String(product.categoryId));
      return buildProductMatch({ product, category, terms });
    })
    .filter((match) => hasStructuredFilter || !terms.length || match.relevanceScore > 0)
    .sort((a, b) => {
      if (b.relevanceScore !== a.relevanceScore) return b.relevanceScore - a.relevanceScore;
      return (b.payload.soldCount || 0) - (a.payload.soldCount || 0);
    })
    .slice(0, hasStructuredFilter ? limit : Math.max(1, Math.ceil(limit / 2)));
};

const verifyCatalogMatchesWithMongo = async ({ matches, terms, ratingAverage, priceRange }) => {
  if (!matches.length) return [];

  const productIds = unique(matches
    .filter((match) => {
      const payload = match?.payload || {};
      const sourceType = payload.itemType || payload.source_type;
      return sourceType === 'product' || sourceType === 'catalog_product';
    })
    .map((match) => match?.payload?.itemId));

  const promotionIds = unique(matches
    .filter((match) => {
      const payload = match?.payload || {};
      const sourceType = payload.itemType || payload.source_type;
      return sourceType === 'promotion' || sourceType === 'catalog_promotion';
    })
    .map((match) => match?.payload?.itemId));

  const categoryLookup = await buildCategoryLookup();
  const now = new Date();

  const priceFilter = buildPriceMongoFilter(priceRange);
  const [products, promotions] = await Promise.all([
    productIds.length
      ? Product.find({
        _id: { $in: productIds },
        status: 'ACTIVE',
        ...(ratingAverage !== null
          ? { 'rating.average': { $gte: ratingAverage, $lt: Math.min(ratingAverage + 1, 5.01) } }
          : {}),
        ...(priceFilter || {})
      })
        .select('name sku slug price originalPrice discount stock variants hasVariants categoryId tags rating soldCount viewCount isFeatured isNew status createdAt description')
        .lean()
      : [],
    promotionIds.length
      ? Promotion.find({
        _id: { $in: promotionIds },
        promotionType: 'COUPON',
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now }
      }).lean()
      : []
  ]);

  const productsById = new Map(products.map((product) => [String(product._id), product]));
  const promotionsById = new Map(promotions.map((promotion) => [String(promotion._id), promotion]));

  return matches
    .map((match) => {
      const payload = match?.payload || {};
      const itemId = payload.itemId ? String(payload.itemId) : '';
      const sourceType = payload.itemType || payload.source_type;

      if (sourceType === 'product' || sourceType === 'catalog_product') {
        const product = productsById.get(itemId);
        if (!product || !hasStock(product) || !productMatchesPriceRange(product, priceRange)) return null;
        const category = categoryLookup.get(String(product.categoryId));
        return buildProductMatch({
          product,
          category,
          terms,
          baseScore: Math.max(Number(match.score) || 0, 0.75)
        });
      }

      if (sourceType === 'promotion' || sourceType === 'catalog_promotion') {
        const promotion = promotionsById.get(itemId);
        if (!promotion) return null;
        return buildPromotionMatch({
          promotion,
          baseScore: Math.max(Number(match.score) || 0, 0.75)
        });
      }

      return null;
    })
    .filter(Boolean);
};

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
    stock: payload.stock || 0,
    soldCount: payload.soldCount || 0,
    ratingAverage: payload.ratingAverage || 0,
    ratingCount: payload.ratingCount || 0,
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

const retrieveCatalogContext = async ({ query, limit = CATALOG_TOP_K }) => {
  const requestedLimit = detectRequestedCatalogProductLimit(query);
  const terms = detectProductSearchTerms(query);
  const ratingAverage = detectCatalogRatingAverage(query);
  const priceRange = detectCatalogPriceRange(query);
  const effectiveLimit = requestedLimit || (priceRange ? Math.max(limit, 10) : limit);
  const directMatches = await findDirectCatalogProducts({
    query,
    limit: effectiveLimit
  });

  let vectorMatches = [];
  try {
    const vector = await embedText(query);
    vectorMatches = await searchCatalogItems(vector, {
      limit: Math.max(effectiveLimit * 4, effectiveLimit),
      scoreThreshold: CATALOG_SCORE_THRESHOLD,
      sourceTypes: isPromotionQuery(query)
        ? ['catalog_product', 'catalog_promotion']
        : ['catalog_product']
    });
  } catch (error) {
    if (!directMatches.length) {
      throw error;
    }
    console.warn('[catalog-retrieve] vector search failed; using direct catalog matches only', error?.message || error);
  }

  const rankedCandidates = rerankMatchesByLexicalOverlap({
    matches: [...directMatches, ...vectorMatches],
    query
  });
  const verifiedMatches = await verifyCatalogMatchesWithMongo({
    matches: rankedCandidates,
    terms,
    ratingAverage,
    priceRange
  });
  const rankedMatches = rerankMatchesByLexicalOverlap({
    matches: verifiedMatches,
    query
  });

  const seenItemIds = new Set();
  const combinedMatches = rankedMatches
    .filter((match) => {
      const itemId = match?.payload?.itemId || String(match?.id || '');
      if (!itemId || seenItemIds.has(itemId)) return false;
      seenItemIds.add(itemId);
      return true;
    })
    .slice(0, effectiveLimit);

  const sources = attachCitationIds(combinedMatches.map(mapSource).filter((item) => item.itemId));
  const contextText = buildContextText(combinedMatches, sources);

  return {
    contextText,
    sources
  };
};

export { retrieveCatalogContext };
