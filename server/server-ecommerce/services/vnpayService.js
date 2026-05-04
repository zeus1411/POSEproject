import crypto from 'crypto';
import { VNPay, ignoreLogger, ProductCode, VnpLocale } from 'vnpay';

/**
 * Format date to VNPay format (yyyyMMddHHmmss) in Vietnam timezone (GMT+7)
 * @param {Date} date - Date object to format
 * @returns {string} Formatted date string
 */
function formatDateForVNPay(date) {
  // ✅ Force Vietnam timezone (GMT+7) using toLocaleString
  const vnTime = new Date(date.toLocaleString('en-US', { 
    timeZone: 'Asia/Ho_Chi_Minh' 
  }));
  
  const year = vnTime.getFullYear();
  const month = String(vnTime.getMonth() + 1).padStart(2, '0');
  const day = String(vnTime.getDate()).padStart(2, '0');
  const hours = String(vnTime.getHours()).padStart(2, '0');
  const minutes = String(vnTime.getMinutes()).padStart(2, '0');
  const seconds = String(vnTime.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

function normalizeOrderInfo(text) {
  if (!text) {
    return '';
  }

  const noDiacritics = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  return noDiacritics
    .replace(/[^a-zA-Z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeIpAddr(ipAddr) {
  if (!ipAddr) {
    return '127.0.0.1';
  }

  const first = String(ipAddr).split(',')[0].trim();

  if (first.startsWith('::ffff:')) {
    return first.replace('::ffff:', '');
  }

  if (first === '::1') {
    return '127.0.0.1';
  }

  return first;
}

function encodeRfc3986(value) {
  return encodeURIComponent(value)
    .replace(/[!'()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);
}

function buildQueryStringRaw(params) {
  const sortedKeys = Object.keys(params).sort();
  const entries = [];

  for (const key of sortedKeys) {
    const value = params[key];
    if (value !== undefined && value !== null && value !== '') {
      entries.push(`${key}=${value}`);
    }
  }

  return entries.join('&');
}

function buildQueryStringUrlSearch(params) {
  const sortedKeys = Object.keys(params).sort();
  const searchParams = new URLSearchParams();

  for (const key of sortedKeys) {
    const value = params[key];
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  }

  return searchParams.toString();
}

function buildQueryStringRfc3986(params) {
  const sortedKeys = Object.keys(params).sort();
  const entries = [];

  for (const key of sortedKeys) {
    const value = params[key];
    if (value !== undefined && value !== null && value !== '') {
      entries.push(`${key}=${encodeRfc3986(String(value))}`);
    }
  }

  return entries.join('&');
}

function buildQueryStringLegacy(params) {
  const sortedKeys = Object.keys(params).sort();
  const entries = [];

  for (const key of sortedKeys) {
    const value = params[key];
    if (value !== undefined && value !== null && value !== '') {
      const encodedKey = encodeURIComponent(key).replace(/%20/g, '+');
      const encodedValue = encodeURIComponent(String(value)).replace(/%20/g, '+');
      entries.push(`${encodedKey}=${encodedValue}`);
    }
  }

  return entries.join('&');
}

function getSignMode() {
  const mode = (process.env.VNPAY_SIGN_MODE || 'rfc3986').toLowerCase();
  if (mode === 'raw' || mode === 'urlsearch' || mode === 'rfc3986' || mode === 'legacy') {
    return mode;
  }

  return 'rfc3986';
}

function buildQueryString(params, mode) {
  if (mode === 'raw') {
    return buildQueryStringRaw(params);
  }

  if (mode === 'urlsearch') {
    return buildQueryStringUrlSearch(params);
  }

  if (mode === 'legacy') {
    return buildQueryStringLegacy(params);
  }

  return buildQueryStringRfc3986(params);
}

export function createVNPayInstance() {
  return new VNPay({
    tmnCode: process.env.VNPAY_TMN_CODE,
    secureSecret: process.env.VNPAY_HASH_SECRET,
    vnpayHost: process.env.VNPAY_HOST || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
    testMode: true, // sandbox
    hashAlgorithm: 'SHA512', // Changed from SHA256 to SHA512 (VNPay sandbox default)
    loggerFn: ignoreLogger,
  });
}

// Build URL thanh toán cho 1 order
export async function buildVNPayUrl({ order, payment, ipAddr }) {
  try {
    const debugEnabled = process.env.VNPAY_DEBUG === 'true';
    const includeIpnParam = process.env.VNPAY_INCLUDE_IPN_PARAM === 'true';

    // ✅ VNPay yêu cầu ExpireDate (thời gian hết hạn) - Sử dụng Vietnam timezone
    const now = new Date();
    const createDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
    const expireDate = new Date(createDate.getTime() + 15 * 60 * 1000); // 15 phút sau

    // Get return URL - MUST point to backend server, not client
    // If SERVER_PUBLIC_URL is set, use it (production)
    // Otherwise use backend port directly (development)
    const baseUrl = process.env.SERVER_PUBLIC_URL || `http://localhost:${process.env.PORT || 3001}`;
    const returnUrl = `${baseUrl}/api/v1/orders/payment/vnpay/return`;
    const ipnUrl = `${baseUrl}/api/v1/orders/payment/vnpay/ipn`;

    // ✅ Format dates using custom formatter with Vietnam timezone
    const vnp_CreateDate = formatDateForVNPay(createDate);
    const vnp_ExpireDate = formatDateForVNPay(expireDate);

    const orderInfo = normalizeOrderInfo(`Thanh toan don hang ${order.orderNumber}`);

    const vnp_IpAddr = normalizeIpAddr(ipAddr);

    console.log('🔵 Building VNPay URL with params:', {
      amount: order.totalPrice,
      txnRef: payment.transactionId || order.orderNumber,
      orderInfo,
      returnUrl,
      ipnUrl,
      includeIpnParam,
      ipAddr: vnp_IpAddr,
      createDate: vnp_CreateDate,
      expireDate: vnp_ExpireDate,
      timezone: 'Asia/Ho_Chi_Minh (GMT+7)'
    });

    const vnpParams = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: process.env.VNPAY_TMN_CODE,
      vnp_Amount: Math.round(order.totalPrice * 100),
      vnp_CurrCode: 'VND',
      vnp_TxnRef: payment.transactionId || order.orderNumber,
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl: returnUrl,
      vnp_Locale: VnpLocale.VN,
      vnp_IpAddr: vnp_IpAddr,
      vnp_CreateDate: vnp_CreateDate,
      vnp_ExpireDate: vnp_ExpireDate,
    };

    if (includeIpnParam) {
      vnpParams.vnp_IpnUrl = ipnUrl;
    }

    const signMode = getSignMode();
    const signedData = buildQueryString(vnpParams, signMode);
    const secret = process.env.VNPAY_HASH_SECRET || '';
    const vnp_SecureHash = crypto
      .createHmac('sha512', secret)
      .update(Buffer.from(signedData, 'utf-8'))
      .digest('hex');

    const paymentUrl = `${
      process.env.VNPAY_HOST || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html'
    }?${buildQueryString({ ...vnpParams, vnp_SecureHash }, signMode)}`;

    if (debugEnabled) {
      console.log('🧪 VNPay debug: signing info', {
        tmnCode: process.env.VNPAY_TMN_CODE,
        secretLength: secret.length,
        secretPreview: `${secret.slice(0, 4)}...${secret.slice(-4)}`,
        signMode,
        vnp_Amount: String(vnpParams.vnp_Amount),
        vnp_IpAddr: vnp_IpAddr,
        signedData,
        vnp_SecureHash
      });
      console.log('🧪 VNPay debug: paymentUrl', paymentUrl);
    }

    console.log('✅ VNPay URL generated successfully');
    return paymentUrl;
  } catch (error) {
    console.error('❌ Error building VNPay URL:', error);
    throw error;
  }
}

// Verify response từ VNPay khi redirect về
export function verifyVNPayReturn(queryObj) {
  try {
    const { vnp_SecureHash = '', vnp_SecureHashType, ...rest } = queryObj || {};
    const signMode = getSignMode();
    const signedData = buildQueryString(rest, signMode);
    const secret = process.env.VNPAY_HASH_SECRET || '';
    const expectedHash = crypto
      .createHmac('sha512', secret)
      .update(Buffer.from(signedData, 'utf-8'))
      .digest('hex');
    const isVerified = expectedHash === vnp_SecureHash;

    const result = {
      ...rest,
      isVerified,
      vnp_SecureHash,
      signMode
    };

    console.log('VNPay verification result:', result);
    return result;
  } catch (error) {
    console.error('Error verifying VNPay return:', error);
    return { isVerified: false, error: error.message };
  }
}
