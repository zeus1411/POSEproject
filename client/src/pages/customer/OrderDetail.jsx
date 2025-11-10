import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderById, cancelOrder } from '../../redux/slices/orderSlice';
import { FiArrowLeft, FiPackage, FiTruck, FiCheckCircle, FiXCircle, FiClock, FiDollarSign, FiMapPin, FiX, FiAlertCircle, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';

const formatCurrency = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v || 0);

const formatDateTime = (dateString) => {
  if (!dateString) return 'Chưa có thông tin';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Chưa có thông tin';
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

const statusMap = {
  PENDING: { 
    label: 'Chờ xác nhận', 
    color: 'bg-yellow-100 text-yellow-800',
    description: 'Đơn hàng đang chờ được xác nhận từ cửa hàng.'
  },
  CONFIRMED: { 
    label: 'Đã xác nhận', 
    color: 'bg-blue-100 text-blue-800',
    description: 'Đơn hàng đã được xác nhận và đang được chuẩn bị.'
  },
  SHIPPING: { 
    label: 'Đang giao hàng', 
    color: 'bg-purple-100 text-purple-800',
    description: 'Đơn hàng đang được vận chuyển đến bạn.'
  },
  COMPLETED: { 
    label: 'Hoàn thành', 
    color: 'bg-green-100 text-green-800',
    description: 'Đơn hàng đã được giao thành công.'
  },
  CANCELLED: { 
    label: 'Đã hủy', 
    color: 'bg-red-100 text-red-800',
    description: 'Đơn hàng đã bị hủy.'
  },
  FAILED: { 
    label: 'Thất bại', 
    color: 'bg-red-100 text-red-800',
    description: 'Đơn hàng thất bại do lỗi thanh toán hoặc lỗi hệ thống.'
  },
};

const statusSteps = [
  { status: 'PENDING', icon: <FiClock className="w-5 h-5" />, label: 'Chờ xử lý' },
  { status: 'CONFIRMED', icon: <FiCheckCircle className="w-5 h-5" />, label: 'Đã xác nhận' },
  { status: 'SHIPPING', icon: <FiTruck className="w-5 h-5" />, label: 'Đang giao hàng' },
  { status: 'COMPLETED', icon: <FiPackage className="w-5 h-5" />, label: 'Hoàn thành' },
];

const OrderDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { orderDetail, orderDetailLoading, orderDetailError } = useSelector((state) => state.orders);
  const { user } = useSelector((state) => state.auth);
  
  // State for cancel confirmation dialog
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

  useEffect(() => {
    if (id) {
      dispatch(fetchOrderById(id));
    }
  }, [dispatch, id]);

  // Extract order details with proper fallbacks
  const { 
    _id: orderId, 
    orderNumber, 
    status, 
    createdAt, 
    items = [], 
    shippingAddress = {},
    paymentMethod = 'COD', 
    paymentStatus = 'unpaid',
    subTotal = items?.reduce((sum, item) => {
      const price = item.price || item.unitPrice || 0;
      const quantity = item.quantity || 1;
      return sum + (price * quantity);
    }, 0) || 0,
    shippingFee = 0, 
    discount = 0, 
    total = (() => {
      const calculatedTotal = subTotal + (shippingFee || 0) - (discount || 0);
      return calculatedTotal > 0 ? calculatedTotal : 0;
    })()
  } = orderDetail || {};

  // Derive payment info from populated paymentId (backend)
  const derivedPaymentMethod = orderDetail?.paymentId?.method || paymentMethod;
  const derivedPaymentStatus = orderDetail?.paymentId?.status
    ? (orderDetail.paymentId.status === 'COMPLETED' ? 'paid' : 'unpaid')
    : paymentStatus;
  
  // Use user's address as fallback if shipping address is incomplete
  const effectiveShippingAddress = {
    fullName: shippingAddress.fullName || shippingAddress.name || user?.fullName || 'Không có tên',
    phoneNumber: shippingAddress.phoneNumber || shippingAddress.phone || user?.phoneNumber || user?.phone || 'Chưa có số điện thoại',
    street: shippingAddress.street || shippingAddress.address || user?.address?.street || 'Chưa có địa chỉ',
    ward: shippingAddress.ward || shippingAddress.wardName || user?.address?.ward || '',
    district: shippingAddress.district || shippingAddress.districtName || user?.address?.district || '',
    city: shippingAddress.city || shippingAddress.province || shippingAddress.provinceName || user?.address?.city || ''
  };

  // Open confirm dialog
  const handleCancelOrder = () => {
    if (!canCancel) {
      toast.warning('Đơn hàng không thể hủy ở trạng thái hiện tại');
      return;
    }
    setCancelError('');
    setShowCancelDialog(true);
  };

  // Confirm from dialog
  const handleConfirmCancel = async () => {
    try {
      setIsCancelling(true);
      setCancelError('');
      await dispatch(cancelOrder(id)).unwrap();
      setShowCancelDialog(false);
      // Show success message
      toast.success('Đã hủy đơn hàng thành công');
    } catch (error) {
      console.error('Error cancelling order:', error);
      setCancelError(error?.message || 'Có lỗi xảy ra khi hủy đơn hàng');
    } finally {
      setIsCancelling(false);
    }
  };

  // Close dialog without action
  const handleCloseDialog = () => {
    if (!isCancelling) setShowCancelDialog(false);
  };

  // Get current status info
  const currentStatus = statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
  
  // Check if order can be cancelled - bao gồm cả FAILED
  const canCancel = ['PENDING', 'CONFIRMED', 'PROCESSING', 'FAILED'].includes(status) && !isCancelling;
  
  // Format order date
  const orderDate = formatDateTime(createdAt) || 'Chưa có thông tin';

  if (orderDetailLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (orderDetailError) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <FiXCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              {orderDetailError || 'Có lỗi xảy ra khi tải thông tin đơn hàng'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!orderDetail) {
    return (
      <div className="text-center py-12">
        <FiPackage className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Không tìm thấy đơn hàng</h3>
        <p className="mt-1 text-sm text-gray-500">Đơn hàng bạn đang tìm kiếm không tồn tại.</p>
        <div className="mt-6">
          <button
            type="button"
            onClick={() => navigate('/orders')}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FiArrowLeft className="-ml-1 mr-2 h-5 w-5" />
            Quay lại danh sách đơn hàng
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Order Header */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Đơn hàng #{orderNumber || id?.substring(0, 8) || ''}
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Đặt ngày: {orderDate}
                </p>
              </div>
              <div className="mt-2 sm:mt-0">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${currentStatus.color}`}>
                  {status === 'CANCELLED' && <FiXCircle className="mr-1.5 h-4 w-4" />}
                  {status === 'FAILED' && <FiXCircle className="mr-1.5 h-4 w-4" />}
                  {status === 'COMPLETED' && <FiCheckCircle className="mr-1.5 h-4 w-4" />}
                  {status === 'SHIPPING' && <FiTruck className="mr-1.5 h-4 w-4" />}
                  {status === 'CONFIRMED' && <FiCheckCircle className="mr-1.5 h-4 w-4" />}
                  {status === 'PENDING' && <FiClock className="mr-1.5 h-4 w-4" />}
                  {currentStatus.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Tình trạng đơn hàng
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {currentStatus.description}
            </p>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="flow-root">
              <ul className="-mb-8">
                {statusSteps.map((step, stepIdx) => {
                  const isCompleted = status === 'CANCELLED' 
                    ? false 
                    : statusSteps.findIndex(s => s.status === status) >= statusSteps.findIndex(s => s.status === step.status);
                  const isCurrent = status === step.status;
                  
                  return (
                    <li key={step.status}>
                      <div className="relative pb-8">
                        {stepIdx !== statusSteps.length - 1 ? (
                          <span 
                            className={`absolute top-4 left-4 -ml-px h-full w-0.5 ${isCompleted ? 'bg-green-600' : 'bg-gray-200'}`} 
                            aria-hidden="true"
                          />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span
                              className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                                isCompleted 
                                  ? 'bg-green-500 text-white' 
                                  : isCurrent 
                                    ? 'bg-blue-500 text-white' 
                                    : 'bg-gray-300 text-gray-600'
                              }`}
                            >
                              {isCompleted ? (
                                <FiCheckCircle className="h-5 w-5" />
                              ) : isCurrent ? (
                                <div className="h-2 w-2 rounded-full bg-white" />
                              ) : (
                                <div className="h-2 w-2 rounded-full bg-gray-500" />
                              )}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className={`text-sm ${
                                isCompleted || isCurrent 
                                  ? 'text-gray-900 font-medium' 
                                  : 'text-gray-500'
                              }`}>
                                {step.label}
                              </p>
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                              {isCurrent && status !== 'CANCELLED' && (
                                <span className="text-blue-600 font-medium">
                                  Đang xử lý
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
                
                {/* Cancelled status (shown at the end if order is cancelled) */}
                {status === 'CANCELLED' && (
                  <li>
                    <div className="relative">
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-red-500 text-white flex items-center justify-center ring-8 ring-white">
                            <FiX className="h-5 w-5" />
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Đã hủy đơn hàng
                            </p>
                            {orderDetail?.cancelledAt && (
                              <p className="text-sm text-gray-500">
                                Ngày hủy: {formatDateTime(orderDetail.cancelledAt)}
                              </p>
                            )}
                            {orderDetail?.cancelReason && (
                              <p className="text-sm text-gray-500 mt-1">
                                Lý do: {orderDetail.cancelReason}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Sản phẩm</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {items && items.length > 0 ? (
                  items.map((item, index) => {
                    // Handle backend shape: productId populated with name/images and our fallbacks
                    const productImage =
                      (Array.isArray(item.productId?.images) && item.productId.images.length > 0
                        ? (typeof item.productId.images[0] === 'string'
                            ? item.productId.images[0]
                            : (item.productId.images[0]?.url || ''))
                        : '') ||
                      (typeof item.productImage === 'string' ? item.productImage : item.productImage?.url) ||
                      item.image ||
                      'https://via.placeholder.com/80';

                    const productName =
                      item.productId?.name || item.productName || item.name || 'Sản phẩm không xác định';

                    const price = item.price || item.unitPrice || 0;
                    const quantity = item.quantity || item.amount || 1;
                    const totalPrice = (item.subtotal != null ? item.subtotal : price * quantity);
                    
                    return (
                      <div key={item._id || `item-${index}`} className="p-4 sm:p-6 flex">
                        <div className="flex-shrink-0 h-20 w-20 rounded-md overflow-hidden border border-gray-200">
                          <img
                            src={productImage}
                            alt={productName}
                            className="h-full w-full object-cover object-center"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/80';
                            }}
                          />
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex justify-between">
                            <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                              {productName}
                              {item.color && (
                                <span className="ml-2 text-xs text-gray-500">
                                  Màu: {item.color}
                                </span>
                              )}
                              {item.size && (
                                <span className="ml-2 text-xs text-gray-500">
                                  Size: {item.size}
                                </span>
                              )}
                            </h4>
                            <p className="ml-4 font-medium text-gray-900 whitespace-nowrap">
                              {formatCurrency(price)}
                            </p>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">
                            Số lượng: {quantity}
                          </p>
                          <p className="mt-2 text-sm font-medium text-gray-900">
                            Thành tiền: {formatCurrency(totalPrice)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    <p>Không có sản phẩm nào trong đơn hàng này.</p>
                    {orderDetail?._id && (
                      <p className="text-xs mt-2">Mã đơn hàng: {orderDetail._id}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Tổng đơn hàng</h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <dl className="space-y-4">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Tạm tính</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {formatCurrency(subTotal)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Phí vận chuyển</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {shippingFee ? formatCurrency(shippingFee) : 'Miễn phí'}
                    </dd>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Giảm giá</dt>
                      <dd className="text-sm font-medium text-red-600">
                        -{formatCurrency(discount)}
                      </dd>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
                    <dt className="text-base font-medium text-gray-900">Tổng cộng</dt>
                    <dd className="text-base font-bold text-gray-900">
                      {formatCurrency(total)}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          {/* Order Info */}
          <div className="space-y-6">
            {/* Shipping Address */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Địa chỉ giao hàng</h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <FiMapPin className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {effectiveShippingAddress.fullName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {effectiveShippingAddress.phoneNumber}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {[
                        effectiveShippingAddress.street,
                        effectiveShippingAddress.ward,
                        effectiveShippingAddress.district,
                        effectiveShippingAddress.city
                      ].filter(Boolean).join(', ') || 'Chưa có địa chỉ'}
                    </p>
                    {orderDetail?.cancelReason && (
                      <div className="mt-2 p-2 bg-red-50 rounded-md">
                        <p className="text-xs text-red-600 font-medium">Lý do hủy:</p>
                        <p className="text-xs text-red-600">{orderDetail.cancelReason}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Phương thức thanh toán</h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <FiDollarSign className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {derivedPaymentMethod === 'COD' 
                        ? 'Thanh toán khi nhận hàng (COD)' 
                        : derivedPaymentMethod === 'VNPAY' 
                          ? 'Thanh toán qua VNPAY'
                          : derivedPaymentMethod || 'Không xác định'
                      }
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {derivedPaymentStatus === 'paid' 
                        ? 'Đã thanh toán' 
                        : derivedPaymentMethod === 'COD'
                          ? 'Bạn sẽ thanh toán khi nhận được hàng'
                          : 'Chưa thanh toán'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Actions - Only show Cancel button for cancelable orders */}
            {canCancel && (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Thao tác</h3>
                </div>
                <div className="px-4 py-5 sm:p-6">
                  <button
                    onClick={handleCancelOrder}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                    disabled={isCancelling}
                  >
                    <FiTrash2 className="w-4 h-4" />
                    {isCancelling ? 'Đang xử lý...' : 'Hủy đơn hàng'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <FiAlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Xác nhận hủy đơn hàng</h3>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này không thể hoàn tác.
            </p>

            {cancelError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{cancelError}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleCloseDialog}
                disabled={isCancelling}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
              >
                Không, giữ đơn hàng
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={isCancelling}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
              >
                {isCancelling ? 'Đang hủy...' : 'Có, hủy đơn'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;