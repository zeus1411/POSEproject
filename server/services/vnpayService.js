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

export function createVNPayInstance() {
  return new VNPay({
    tmnCode: process.env.VNPAY_TMN_CODE,
    secureSecret: process.env.VNPAY_HASH_SECRET,
    vnpayHost: process.env.VNPAY_HOST || 'https://sandbox.vnpayment.vn',
    testMode: true, // sandbox
    hashAlgorithm: 'SHA512', // Changed from SHA256 to SHA512 (VNPay sandbox default)
    loggerFn: ignoreLogger,
  });
}

// Build URL thanh toán cho 1 order
export async function buildVNPayUrl({ order, payment, ipAddr }) {
  try {
    const vnpay = createVNPayInstance();

    // ✅ VNPay yêu cầu ExpireDate (thời gian hết hạn) - Sử dụng Vietnam timezone
    const now = new Date();
    const createDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
    const expireDate = new Date(createDate.getTime() + 15 * 60 * 1000); // 15 phút sau

    // Get return URL - MUST point to backend server, not client
    // If SERVER_PUBLIC_URL is set, use it (production)
    // Otherwise use backend port directly (development)
    const baseUrl = process.env.SERVER_PUBLIC_URL || `http://localhost:${process.env.PORT || 3001}`;
    const returnUrl = `${baseUrl}/api/v1/orders/payment/vnpay/return`;

    // ✅ Format dates using custom formatter with Vietnam timezone
    const vnp_CreateDate = formatDateForVNPay(createDate);
    const vnp_ExpireDate = formatDateForVNPay(expireDate);

    console.log('🔵 Building VNPay URL with params:', {
      amount: order.totalPrice,
      txnRef: payment.transactionId || order.orderNumber,
      orderInfo: `Thanh toan don hang ${order.orderNumber}`,
      returnUrl,
      createDate: vnp_CreateDate,
      expireDate: vnp_ExpireDate,
      timezone: 'Asia/Ho_Chi_Minh (GMT+7)'
    });

    const paymentUrl = await vnpay.buildPaymentUrl({
      vnp_Amount: Math.round(order.totalPrice), // VND, không nhân 100
      vnp_IpAddr: ipAddr || '127.0.0.1',
      vnp_TxnRef: payment.transactionId || order.orderNumber,
      vnp_OrderInfo: `Thanh toan don hang ${order.orderNumber}`,
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl: returnUrl,
      vnp_Locale: VnpLocale.VN,
      vnp_CreateDate: vnp_CreateDate,
      vnp_ExpireDate: vnp_ExpireDate,
    });

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
    const vnpay = createVNPayInstance();
    const verifyResult = vnpay.verifyReturnUrl(queryObj);
    
    console.log('VNPay verification result:', verifyResult);
    return verifyResult;
  } catch (error) {
    console.error('Error verifying VNPay return:', error);
    return { isVerified: false, error: error.message };
  }
}