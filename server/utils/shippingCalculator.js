/**
 * Calculate shipping fee based on tiered pricing
 * @param {Number} subtotal - Tạm tính (VND)
 * @returns {Number} Phí vận chuyển (VND)
 */
export const calculateShippingFee = (subtotal) => {
  if (subtotal < 100000) {
    // < 100k: 14%
    return Math.round(subtotal * 0.14);
  } else if (subtotal < 300000) {
    // 100k - 300k: 8%
    return Math.round(subtotal * 0.08);
  } else if (subtotal < 600000) {
    // 300k - 600k: 5%
    return Math.round(subtotal * 0.05);
  } else if (subtotal < 1000000) {
    // 600k - 1M: 3%
    return Math.round(subtotal * 0.03);
  } else {
    // >= 1M: 1.8%
    return Math.round(subtotal * 0.018);
  }
};

/**
 * Get shipping fee percentage based on subtotal
 * @param {Number} subtotal - Tạm tính (VND)
 * @returns {Number} Percentage (0.14, 0.08, etc.)
 */
export const getShippingPercentage = (subtotal) => {
  if (subtotal < 100000) return 0.14;
  if (subtotal < 300000) return 0.08;
  if (subtotal < 600000) return 0.05;
  if (subtotal < 1000000) return 0.03;
  return 0.018;
};

/**
 * Get shipping tier info for display
 * @param {Number} subtotal - Tạm tính (VND)
 * @returns {Object} { percentage, nextTier, nextTierThreshold }
 */
export const getShippingTierInfo = (subtotal) => {
  if (subtotal < 100000) {
    return { percentage: 14, nextTier: 8, nextTierThreshold: 100000 };
  } else if (subtotal < 300000) {
    return { percentage: 8, nextTier: 5, nextTierThreshold: 300000 };
  } else if (subtotal < 600000) {
    return { percentage: 5, nextTier: 3, nextTierThreshold: 600000 };
  } else if (subtotal < 1000000) {
    return { percentage: 3, nextTier: 1.8, nextTierThreshold: 1000000 };
  } else {
    return { percentage: 1.8, nextTier: null, nextTierThreshold: null };
  }
};
