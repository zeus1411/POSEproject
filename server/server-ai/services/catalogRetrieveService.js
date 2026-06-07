import { CATALOG_TOP_K, CATALOG_SCORE_THRESHOLD } from '../config/aiConfig.js';
import Category from '../../server-ecommerce/models/Category.js';
import Product from '../../server-ecommerce/models/Product.js';
import { embedText } from './geminiService.js';
import { searchCatalogItems } from './qdrantService.js';
import { attachCitationIds, rerankMatchesByLexicalOverlap } from '../utils/ragUtils.js';

const escapeRegex = (value) => String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizeText = (value) => String(value || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/\s+/g, ' ')
  .trim();

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

const getStock = (product) => product.hasVariants
  ? getVariantStockTotal(product.variants || [])
  : Number(product.stock) || 0;

const hasStock = (product) => getStock(product) > 0;

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
  product.tags?.length ? `Tags: ${product.tags.join(', ')}` : ''
].filter(Boolean).join('\n');

const buildCategoryLookup = async () => {
  const categories = await Category.find({}).select('name slug parentId').lean();
  return new Map(categories.map((category) => [String(category._id), category]));
};

const detectProductSearchTerms = (query) => {
  const normalized = normalizeText(query);
  const terms = [];

  if (/\bcay\b|cay thuy sinh|thuc vat|rong\b/.test(normalized)) {
    terms.push('cây', 'cay', 'thủy sinh', 'thuy sinh', 'rong');
  }
  if (/\bloc\b|vat lieu loc|phu kien loc/.test(normalized)) {
    terms.push('lọc', 'loc', 'vật liệu lọc', 'vat lieu loc');
  }
  if (/phu kien/.test(normalized)) {
    terms.push('phụ kiện', 'phu kien');
  }
  if (/\bden\b|anh sang/.test(normalized)) {
    terms.push('đèn', 'den', 'ánh sáng', 'anh sang');
  }
  if (/phan nen|\bnen\b/.test(normalized)) {
    terms.push('phân nền', 'phan nen', 'nền', 'nen');
  }
  if (/thuc an/.test(normalized)) {
    terms.push('thức ăn', 'thuc an');
  }
  if (/\bca\b/.test(normalized)) {
    terms.push('cá', 'ca');
  }
  if (/\btep\b/.test(normalized)) {
    terms.push('tép', 'tep');
  }

  return [...new Set(terms)];
};

const isTopSellerQuery = (query) => {
  const normalized = normalizeText(query);
  return /ban chay|mua nhieu|duoc mua nhieu|top|pho bien/.test(normalized);
};

const isSuggestionQuery = (query) => {
  const normalized = normalizeText(query);
  return /goi y|de xuat|tu van|dang co|con hang|tim|can|cho toi|co nhung/.test(normalized);
};

const findDirectCatalogProducts = async ({ query, limit }) => {
  const terms = detectProductSearchTerms(query);
  if (!terms.length && !isTopSellerQuery(query) && !isSuggestionQuery(query)) {
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

  terms.forEach((term) => {
    const regex = new RegExp(escapeRegex(term), 'i');
    orConditions.push(
      { name: regex },
      { tags: regex },
      { description: regex },
      { sku: regex }
    );
  });

  const queryFilter = {
    status: 'ACTIVE',
    ...(orConditions.length ? { $or: orConditions } : {})
  };

  const sortOption = isTopSellerQuery(query)
    ? { soldCount: -1, 'rating.average': -1, viewCount: -1, createdAt: -1 }
    : { isFeatured: -1, soldCount: -1, 'rating.average': -1, viewCount: -1, createdAt: -1 };

  const products = await Product.find(queryFilter)
    .select('name sku slug price originalPrice discount stock variants hasVariants categoryId tags rating soldCount viewCount isFeatured isNew status createdAt')
    .sort(sortOption)
    .limit(Math.max(limit * 2, limit))
    .lean();

  return products
    .filter(hasStock)
    .slice(0, limit)
    .map((product) => {
      const category = categoryLookup.get(String(product.categoryId));
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
          text: buildProductContextText(product, category?.name || '')
        },
        score: 1
      };
    });
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
  const directMatches = await findDirectCatalogProducts({
    query,
    limit: CATALOG_TOP_K
  });

  let vectorMatches = [];
  try {
    const vector = await embedText(query);
    vectorMatches = await searchCatalogItems(vector, {
      limit: Math.max(CATALOG_TOP_K * 4, CATALOG_TOP_K),
      scoreThreshold: CATALOG_SCORE_THRESHOLD
    });
  } catch (error) {
    if (!directMatches.length) {
      throw error;
    }
    console.warn('[catalog-retrieve] vector search failed; using direct catalog matches only', error?.message || error);
  }
  const rankedMatches = rerankMatchesByLexicalOverlap({
    matches: vectorMatches,
    query
  }).slice(0, CATALOG_TOP_K);

  const seenItemIds = new Set();
  const combinedMatches = [...directMatches, ...rankedMatches]
    .filter((match) => {
      const itemId = match?.payload?.itemId || String(match?.id || '');
      if (!itemId || seenItemIds.has(itemId)) return false;
      seenItemIds.add(itemId);
      return true;
    })
    .slice(0, CATALOG_TOP_K);

  const sources = attachCitationIds(combinedMatches.map(mapSource).filter((item) => item.itemId));
  const contextText = buildContextText(combinedMatches, sources);

  return {
    contextText,
    sources
  };
};

export { retrieveCatalogContext };
