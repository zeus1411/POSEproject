// Temporary storage for VNPay pending orders
// Since we're removing PENDING_PAYMENT status, we need to store order data temporarily
// until VNPay payment is confirmed

const tempOrders = new Map();

// Store temporary order data before VNPay payment
export const storeTempOrder = (transactionId, orderData) => {
  const tempOrder = {
    ...orderData,
    transactionId,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes expiry
  };
  
  tempOrders.set(transactionId, tempOrder);
  console.log(`🗃️ Stored temp order for transaction: ${transactionId}`);
  
  // Auto cleanup after expiry
  setTimeout(() => {
    if (tempOrders.has(transactionId)) {
      console.log(`🧹 Auto-cleaned expired temp order: ${transactionId}`);
      tempOrders.delete(transactionId);
    }
  }, 15 * 60 * 1000);
  
  return tempOrder;
};

// Retrieve temporary order data
export const getTempOrder = (transactionId) => {
  const tempOrder = tempOrders.get(transactionId);
  
  if (!tempOrder) {
    return null;
  }
  
  // Check if expired
  if (new Date() > tempOrder.expiresAt) {
    console.log(`⏰ Temp order expired: ${transactionId}`);
    tempOrders.delete(transactionId);
    return null;
  }
  
  return tempOrder;
};

// Remove temporary order data (after successful creation or cancellation)
export const removeTempOrder = (transactionId) => {
  const existed = tempOrders.has(transactionId);
  tempOrders.delete(transactionId);
  
  if (existed) {
    console.log(`🗑️ Removed temp order: ${transactionId}`);
  }
  
  return existed;
};

// Clean up expired orders (utility function)
export const cleanupExpiredOrders = () => {
  const now = new Date();
  let cleanedCount = 0;
  
  for (const [transactionId, tempOrder] of tempOrders.entries()) {
    if (now > tempOrder.expiresAt) {
      tempOrders.delete(transactionId);
      cleanedCount++;
    }
  }
  
  if (cleanedCount > 0) {
    console.log(`🧹 Cleaned up ${cleanedCount} expired temp orders`);
  }
  
  return cleanedCount;
};

// Get stats (for monitoring)
export const getTempOrderStats = () => {
  return {
    totalCount: tempOrders.size,
    orders: Array.from(tempOrders.entries()).map(([transactionId, order]) => ({
      transactionId,
      userId: order.userId,
      totalPrice: order.totalPrice,
      createdAt: order.createdAt,
      expiresAt: order.expiresAt,
      isExpired: new Date() > order.expiresAt
    }))
  };
};