import crypto from 'crypto';
import Category from '../../server-ecommerce/models/Category.js';
import Product from '../../server-ecommerce/models/Product.js';
import Promotion from '../../server-ecommerce/models/Promotion.js';
import {
  CATALOG_AUTO_SYNC_ENABLED,
  CATALOG_SYNC_DEBOUNCE_MS,
  CATALOG_SYNC_INTERVAL_MINUTES,
  GEMINI_EMBED_MODEL
} from '../config/aiConfig.js';
import { embedText } from './geminiService.js';
import {
  ensureCatalogCollection,
  upsertCatalogItems,
  scrollCatalogPoints,
  deleteCatalogItemsByIds
} from './qdrantService.js';

const MAX_DESCRIPTION_CHARS = 1200;
const BATCH_SIZE = 50;

const formatUuidFromBytes = (bytes) => {
  const hex = Buffer.from(bytes).toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

// Deterministic point id derived from the item identity, so the same product
// or promotion always maps to the same Qdrant point across syncs. This is what
// makes incremental reconciliation possible (previously ids were random, which
// forced a full collection rebuild on every sync).
const createPointId = (key) => {
  const hash = crypto.createHash('sha1').update(String(key)).digest();
  const bytes = Buffer.from(hash.subarray(0, 16));
  bytes[6] = (bytes[6] & 0x0f) | 0x50; // UUID version 5
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // RFC 4122 variant
  return formatUuidFromBytes(bytes);
};

const computeContentHash = (text) =>
  crypto.createHash('sha256').update(String(text || '')).digest('hex');

let syncRunning = false;
let syncPending = false;
let syncTimer = null;
let syncIntervalId = null;

let lastSyncAt = null;
let lastSyncResult = null;
let lastSyncError = null;
let lastSyncReason = null;

const formatNumber = (value) => {
  if (!Number.isFinite(value)) return '';
  return new Intl.NumberFormat('en-US').format(value);
};

const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

const trimText = (value, maxChars) => {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (!text) return '';
  if (text.length <= maxChars) return text;
  return `${text.slice(0, maxChars)}...`;
};

const buildCategoryPath = (category, categoryMap) => {
  if (!category) return '';
  const names = [];
  let current = category;
  let safety = 0;

  while (current && safety < 10) {
    if (current.name) {
      names.unshift(current.name);
    }
    if (!current.parentId) break;
    current = categoryMap.get(String(current.parentId)) || null;
    safety += 1;
  }

  return names.join(' > ');
};

const getVariantPriceRange = (variants = []) => {
  const activeVariants = variants.filter((variant) => variant && variant.isActive !== false);
  if (!activeVariants.length) return null;
  const prices = activeVariants
    .map((variant) => Number(variant.price))
    .filter((value) => Number.isFinite(value));
  if (!prices.length) return null;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return { min, max };
};

const getVariantStockTotal = (variants = []) => {
  return variants
    .filter((variant) => variant && variant.isActive !== false)
    .reduce((total, variant) => total + (Number(variant.stock) || 0), 0);
};

const buildProductText = ({ product, categoryPath }) => {
  const variantRange = getVariantPriceRange(product.variants || []);
  const basePrice = Number(product.price) || 0;
  const priceText = variantRange
    ? variantRange.min === variantRange.max
      ? formatNumber(variantRange.min)
      : `${formatNumber(variantRange.min)} - ${formatNumber(variantRange.max)}`
    : formatNumber(basePrice);

  const stockValue = product.hasVariants
    ? getVariantStockTotal(product.variants || [])
    : Number(product.stock) || 0;

  const description = trimText(product.description, MAX_DESCRIPTION_CHARS);
  const tags = Array.isArray(product.tags) ? product.tags.join(', ') : '';
  const specEntries = product.specifications instanceof Map
    ? Array.from(product.specifications.entries())
    : Object.entries(product.specifications || {});
  const specs = specEntries.length
    ? specEntries.map(([key, value]) => `${key}: ${value}`).join(', ')
    : '';

  const lines = [
    'Type: product',
    `Name: ${product.name}`,
    product.sku ? `SKU: ${product.sku}` : '',
    categoryPath ? `Category: ${categoryPath}` : '',
    priceText ? `Price: ${priceText}` : '',
    Number.isFinite(product.originalPrice) ? `Original price: ${formatNumber(product.originalPrice)}` : '',
    Number.isFinite(product.discount) && product.discount > 0 ? `Discount percent: ${product.discount}` : '',
    `Stock: ${formatNumber(stockValue)}`,
    `Sold count: ${formatNumber(Number(product.soldCount) || 0)}`,
    `View count: ${formatNumber(Number(product.viewCount) || 0)}`,
    product.rating?.average ? `Rating average: ${product.rating.average}` : '',
    product.rating?.count ? `Rating count: ${formatNumber(product.rating.count)}` : '',
    product.isFeatured ? 'Featured: yes' : 'Featured: no',
    product.isNew ? 'New product: yes' : 'New product: no',
    product.status ? `Status: ${product.status}` : '',
    tags ? `Tags: ${tags}` : '',
    specs ? `Specs: ${specs}` : '',
    description ? `Description: ${description}` : ''
  ];

  return lines.filter(Boolean).join('\n');
};

const buildPromotionText = (promotion) => {
  const conditions = promotion.conditions || {};
  const lines = [
    'Type: promotion',
    `Name: ${promotion.name}`,
    `Code: ${promotion.code}`,
    `Discount type: ${promotion.discountType}`,
    `Discount value: ${formatNumber(promotion.discountValue)}`,
    `Min order value: ${formatNumber(conditions.minOrderValue || 0)}`,
    `Min quantity: ${formatNumber(conditions.minQuantity || 0)}`,
    conditions.maxDiscount ? `Max discount: ${formatNumber(conditions.maxDiscount)}` : '',
    conditions.firstOrderOnly ? 'First order only: yes' : 'First order only: no',
    `Valid from: ${formatDate(promotion.startDate)}`,
    `Valid until: ${formatDate(promotion.endDate)}`,
    promotion.isActive ? 'Active: yes' : 'Active: no'
  ];

  return lines.filter(Boolean).join('\n');
};

const buildCatalogItems = async () => {
  const [categories, products, promotions] = await Promise.all([
    Category.find({}).lean(),
    Product.find({ status: 'ACTIVE' }).lean(),
    Promotion.find({
      promotionType: 'COUPON',
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    }).lean()
  ]);

  const categoryMap = new Map(categories.map((category) => [String(category._id), category]));

  const productItems = products.map((product) => {
    const category = categoryMap.get(String(product.categoryId));
    const categoryPath = buildCategoryPath(category, categoryMap);
    const text = buildProductText({ product, categoryPath });
    const productId = String(product._id);
    const variantRange = getVariantPriceRange(product.variants || []);
    const basePrice = Number(product.price) || 0;
    const minPrice = variantRange ? variantRange.min : basePrice;
    const maxPrice = variantRange ? variantRange.max : basePrice;
    const contentHash = computeContentHash(text);

    return {
      id: createPointId(`product:${productId}`),
      text,
      contentHash,
      payload: {
        source_type: 'catalog_product',
        itemType: 'product',
        itemId: productId,
        contentHash,
        title: product.name,
        name: product.name,
        sku: product.sku || '',
        slug: product.slug || '',
        uri: `/product/${productId}`,
        category: categoryPath,
        price: basePrice,
        minPrice,
        maxPrice,
        originalPrice: Number(product.originalPrice) || 0,
        discountPercent: Number(product.discount) || 0,
        stock: product.hasVariants
          ? getVariantStockTotal(product.variants || [])
          : Number(product.stock) || 0,
        soldCount: Number(product.soldCount) || 0,
        viewCount: Number(product.viewCount) || 0,
        ratingAverage: Number(product.rating?.average) || 0,
        ratingCount: Number(product.rating?.count) || 0,
        isFeatured: Boolean(product.isFeatured),
        isNew: Boolean(product.isNew),
        status: product.status || '',
        tags: product.tags || [],
        embeddingModel: GEMINI_EMBED_MODEL,
        updatedAt: product.updatedAt || product.createdAt || null,
        text
      }
    };
  });

  const promotionItems = promotions.map((promotion) => {
    const text = buildPromotionText(promotion);
    const promotionId = String(promotion._id);
    const contentHash = computeContentHash(text);

    return {
      id: createPointId(`promotion:${promotionId}`),
      text,
      contentHash,
      payload: {
        source_type: 'catalog_promotion',
        itemType: 'promotion',
        itemId: promotionId,
        contentHash,
        title: promotion.name,
        name: promotion.name,
        code: promotion.code,
        discountType: promotion.discountType,
        discountValue: Number(promotion.discountValue) || 0,
        conditions: promotion.conditions || {},
        startDate: promotion.startDate,
        endDate: promotion.endDate,
        isActive: Boolean(promotion.isActive),
        embeddingModel: GEMINI_EMBED_MODEL,
        updatedAt: promotion.updatedAt || promotion.createdAt || null,
        text
      }
    };
  });

  return {
    items: [...productItems, ...promotionItems],
    counts: {
      products: productItems.length,
      promotions: promotionItems.length
    }
  };
};

// Incremental reconciliation against what is already stored in Qdrant.
// Only new or changed items are re-embedded (the expensive Gemini call);
// unchanged items are left untouched and items removed from the catalog are
// deleted. This replaces the previous "delete everything and re-embed all on
// every sync" behaviour that burned the Gemini quota/budget around the clock.
const reconcileCatalogPoints = async (items) => {
  const existing = await scrollCatalogPoints();
  const existingById = new Map(existing.map((point) => [String(point.id), point]));
  const currentIds = new Set(items.map((item) => String(item.id)));

  const toUpsert = items.filter((item) => {
    const prev = existingById.get(String(item.id));
    return !prev || prev.contentHash !== item.contentHash;
  });

  const toDelete = existing
    .filter((point) => !currentIds.has(String(point.id)))
    .map((point) => point.id);

  let buffer = [];
  // If Qdrant already returned points, the collection exists and has a fixed
  // vector size; otherwise create it from the first embedding's dimensions.
  let collectionReady = existing.length > 0;

  for (const item of toUpsert) {
    const vector = await embedText(item.text);

    if (!collectionReady) {
      await ensureCatalogCollection(vector.length);
      collectionReady = true;
    }

    buffer.push({
      id: item.id,
      vector,
      payload: item.payload
    });

    if (buffer.length >= BATCH_SIZE) {
      await upsertCatalogItems(buffer);
      buffer = [];
    }
  }

  if (buffer.length) {
    await upsertCatalogItems(buffer);
  }

  if (toDelete.length) {
    await deleteCatalogItemsByIds(toDelete);
  }

  return {
    upserted: toUpsert.length,
    deleted: toDelete.length,
    unchanged: items.length - toUpsert.length
  };
};

const syncCatalogIndex = async ({ reason = 'manual' } = {}) => {
  if (syncRunning) {
    syncPending = true;
    return { status: 'queued', reason };
  }

  syncRunning = true;
  lastSyncReason = reason;
  lastSyncError = null;

  try {
    const { items, counts } = await buildCatalogItems();

    // Always reconcile — even with zero items we still need to delete points
    // for products/promotions that were removed or deactivated.
    const changes = await reconcileCatalogPoints(items);

    const result = {
      status: 'ok',
      reason,
      counts,
      changes
    };

    lastSyncAt = new Date();
    lastSyncResult = result;
    return result;
  } catch (error) {
    lastSyncError = error;
    throw error;
  } finally {
    syncRunning = false;
    if (syncPending) {
      syncPending = false;
      syncCatalogIndex({ reason: 'pending' }).catch((error) => {
        lastSyncError = error;
      });
    }
  }
};

const requestCatalogSync = ({ reason = 'auto', delayMs = CATALOG_SYNC_DEBOUNCE_MS } = {}) => {
  if (!CATALOG_AUTO_SYNC_ENABLED) {
    return { status: 'disabled', reason };
  }

  if (syncTimer) {
    return { status: 'scheduled' };
  }

  syncTimer = setTimeout(() => {
    syncTimer = null;
    syncCatalogIndex({ reason }).catch((error) => {
      lastSyncError = error;
      console.error('[catalog-sync] failed:', error.message || error);
    });
  }, Math.max(0, Number(delayMs) || 0));

  return { status: 'scheduled' };
};

const startCatalogSyncScheduler = () => {
  if (!CATALOG_AUTO_SYNC_ENABLED) return;
  if (syncIntervalId) return;
  const minutes = Number(CATALOG_SYNC_INTERVAL_MINUTES || 0);
  if (!minutes || minutes <= 0) return;

  syncIntervalId = setInterval(() => {
    requestCatalogSync({ reason: 'interval', delayMs: 0 });
  }, minutes * 60 * 1000);
};

const getCatalogSyncStatus = () => {
  return {
    autoSyncEnabled: CATALOG_AUTO_SYNC_ENABLED,
    running: syncRunning,
    pending: syncPending,
    lastSyncAt: lastSyncAt ? lastSyncAt.toISOString() : null,
    lastSyncReason,
    lastSyncResult,
    lastSyncError: lastSyncError ? lastSyncError.message || String(lastSyncError) : null
  };
};

export {
  syncCatalogIndex,
  requestCatalogSync,
  startCatalogSyncScheduler,
  getCatalogSyncStatus
};
