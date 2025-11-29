import { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat } from 'vnpay';

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

    // VNPay yêu cầu ExpireDate (thời gian hết hạn)
    const createDate = new Date();
    const expireDate = new Date(createDate.getTime() + 15 * 60 * 1000); // 15 phút

    // Get return URL - MUST point to backend server, not client
    // If SERVER_PUBLIC_URL is set, use it (production)
    // Otherwise use backend port directly (development)
    const baseUrl = process.env.SERVER_PUBLIC_URL || `http://localhost:${process.env.PORT || 3001}`;
    const returnUrl = `${baseUrl}/api/v1/orders/payment/vnpay/return`;

    console.log('Building VNPay URL with params:', {
      amount: order.totalPrice,
      txnRef: payment.transactionId || order.orderNumber,
      orderInfo: `Thanh toan don hang ${order.orderNumber}`,
      returnUrl
    });

    const paymentUrl = await vnpay.buildPaymentUrl({
      vnp_Amount: Math.round(order.totalPrice), // VND, không nhân 100
      vnp_IpAddr: ipAddr || '127.0.0.1',
      vnp_TxnRef: payment.transactionId || order.orderNumber,
      vnp_OrderInfo: `Thanh toan don hang ${order.orderNumber}`,
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl: returnUrl,
      vnp_Locale: VnpLocale.VN,
      vnp_CreateDate: dateFormat(createDate),
      vnp_ExpireDate: dateFormat(expireDate),
    });

    console.log('VNPay URL generated successfully');
    return paymentUrl;
  } catch (error) {
    console.error('Error building VNPay URL:', error);
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