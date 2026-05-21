import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiArrowLeft, FiPackage, FiTruck, FiCheckCircle, FiXCircle, FiClock, FiDollarSign, FiMapPin, FiX } from 'react-icons/fi';
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { useTheme } from '../../context/ThemeContext';

// ✅ BƯỚC 1: Thay đổi import Redux
import { 
  fetchAdminOrderDetail, 
  clearCurrentOrder 
} from '../../redux/slices/adminOrderSlice';

// ✅ BƯỚC 2: Thêm import Layout
import AdminLayout from '../../components/admin/AdminLayout';

// -----------------------------------------------------------------
// ✅ BƯỚC 3: SAO CHÉP TOÀN BỘ HELPER TỪ ORDERDETAIL.JSX CỦA USER
// -----------------------------------------------------------------
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
    color: 'bg-yellow-100/80 text-yellow-800 border border-yellow-200/50 dark:bg-yellow-950/30 dark:text-yellow-300 dark:border-yellow-900/30',
    description: 'Đơn hàng đang chờ được xác nhận từ cửa hàng.'
  },
  CONFIRMED: { 
    label: 'Đã xác nhận', 
    color: 'bg-blue-100/80 text-blue-800 border border-blue-200/50 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700/30',
    description: 'Đơn hàng đã được xác nhận và đang được chuẩn bị.'
  },
  PROCESSING: {
    label: 'Đang xử lý',
    color: 'bg-indigo-100/80 text-indigo-800 border border-indigo-200/50 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800/30',
    description: 'Đơn hàng đang được cửa hàng xử lý.'
  },
  SHIPPING: { 
    label: 'Đang giao hàng', 
    color: 'bg-purple-100/80 text-purple-800 border border-purple-200/50 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800/30',
    description: 'Đơn hàng đang được vận chuyển đến bạn.'
  },
  COMPLETED: { 
    label: 'Hoàn thành', 
    color: 'bg-green-100/80 text-green-800 border border-green-200/50 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800/30',
    description: 'Đơn hàng đã được giao thành công.'
  },
  CANCELLED: { 
    label: 'Đã hủy', 
    color: 'bg-red-100/80 text-red-800 border border-red-200/50 dark:bg-red-950/30 dark:text-red-300 dark:border-red-900/30',
    description: 'Đơn hàng đã bị hủy.'
  },
  FAILED: { 
    label: 'Thất bại', 
    color: 'bg-red-100/80 text-red-800 border border-red-200/50 dark:bg-red-950/30 dark:text-red-300 dark:border-red-900/30',
    description: 'Đơn hàng thất bại do lỗi thanh toán hoặc lỗi hệ thống.'
  },
};

const statusSteps = [
  { status: 'PENDING', icon: <FiClock className="w-5 h-5" />, label: 'Chờ xử lý' },
  { status: 'CONFIRMED', icon: <FiCheckCircle className="w-5 h-5" />, label: 'Đã xác nhận' },
  { status: 'PROCESSING', icon: <FiCheckCircle className="w-5 h-5" />, label: 'Đang xử lý' },
  { status: 'SHIPPING', icon: <FiTruck className="w-5 h-5" />, label: 'Đang giao hàng' },
  { status: 'COMPLETED', icon: <FiPackage className="w-5 h-5" />, label: 'Hoàn thành' },
];

// ✅ Đổi tên component thành AdminOrderDetail
const AdminOrderDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  
  // ✅ BƯỚC 4: THAY ĐỔI REDUX SELECTOR
  // Lấy data từ "adminOrders" slice
  const { 
    currentOrder: orderDetail, // Đổi tên "currentOrder" thành "orderDetail" để code UI cũ chạy được
    loadingDetail: orderDetailLoading, // Tương tự
    error: orderDetailError // Tương tự
  } = useSelector((state) => state.adminOrders); 

  // ✅ BƯỚC 5: THAY ĐỔI REDUX DISPATCH
  useEffect(() => {
    if (id) {
      dispatch(fetchAdminOrderDetail(id)); // Gọi action của Admin
    }
    // Cleanup function
    return () => {
      dispatch(clearCurrentOrder()); // Dùng action của Admin
    };
  }, [dispatch, id]);

  const { 
    orderNumber, 
    status, 
    createdAt, 
    items = [], 
    shippingAddress = {},
    paymentMethod = 'COD', 
    paymentStatus = 'unpaid',
    subTotal = items?.reduce((sum, item) => (sum + (item.price * item.quantity)), 0) || 0,
    shippingFee = 0, 
    discount = 0, 
    total = subTotal + (shippingFee || 0) - (discount || 0),
    userId // Lấy thêm userId để xem thông tin khách hàng
  } = orderDetail || {};

  const derivedPaymentMethod = orderDetail?.paymentId?.method || paymentMethod;
  const derivedPaymentStatus = orderDetail?.paymentId?.status
    ? (orderDetail.paymentId.status === 'COMPLETED' ? 'paid' : 'unpaid')
    : paymentStatus;
  
  const effectiveShippingAddress = {
    fullName: shippingAddress.fullName || shippingAddress.name || userId?.username || 'Không có tên',
    phoneNumber: shippingAddress.phoneNumber || shippingAddress.phone || userId?.phone || 'Chưa có số điện thoại',
    street: shippingAddress.street || shippingAddress.address || 'Chưa có địa chỉ',
    ward: shippingAddress.ward || shippingAddress.wardName || '',
    district: shippingAddress.district || shippingAddress.districtName || '',
    city: shippingAddress.city || shippingAddress.province || shippingAddress.provinceName || ''
  };

  const currentStatus = statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800 border border-gray-200/50', description: 'Trạng thái không xác định' };
  const orderDate = formatDateTime(createdAt) || 'Chưa có thông tin';

  if (orderDetailLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  if (orderDetailError) {
    return (
      <AdminLayout>
        <div className="bg-red-50/80 dark:bg-red-950/20 border-l-4 border-red-500 p-4 rounded-r-xl max-w-7xl mx-auto my-8">
          <p className="text-sm font-semibold text-red-700 dark:text-red-400">
            {orderDetailError || 'Có lỗi xảy ra khi tải thông tin đơn hàng'}
          </p>
        </div>
      </AdminLayout>
    );
  }

  if (!orderDetail) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <FiPackage className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" />
          <h3 className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-200">Không tìm thấy đơn hàng</h3>
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 bg-transparent">
        
        {/* ✅ BƯỚC 8: THÊM HEADER MỚI CÓ NÚT "QUAY LẠI" */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/orders')} // Nút quay lại
              className="p-2.5 rounded-xl text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white bg-water/10 dark:bg-white/5 border border-water/20 dark:border-white/10 hover:bg-water/20 dark:hover:bg-white/10 hover:scale-105 active:scale-95 transition-all"
              title="Quay lại danh sách đơn hàng"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white">
                Chi tiết đơn hàng #{orderNumber || id.slice(-6)}
              </h1>
              <p className="mt-1.5 text-sm font-semibold text-slate-600 dark:text-slate-300">
                Đặt ngày: {orderDate}
              </p>
            </div>
          </div>
          <div>
            <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${currentStatus.color}`}>
              {currentStatus.label}
            </span>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="glass-panel rounded-3xl shadow-xl overflow-hidden mb-8 border border-water/30 dark:border-white/10">
          <div className="px-6 py-5 border-b border-water/20 dark:border-white/10 bg-water/5 dark:bg-white/5">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              Tình trạng đơn hàng
            </h3>
            <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
              {currentStatus.description}
            </p>
          </div>
          <div className="px-6 py-8 sm:px-8">
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
                            className={`absolute top-4 left-4 -ml-px h-full w-0.5 ${isCompleted ? 'bg-emerald-500' : 'bg-water/20 dark:bg-white/10'}`} 
                            aria-hidden="true"
                          />
                        ) : null}
                        <div className="relative flex space-x-4">
                          <div>
                            <span
                              className={`h-8 w-8 rounded-full flex items-center justify-center ring-4 ring-transparent ${
                                isCompleted 
                                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                                  : isCurrent 
                                    ? 'bg-primary text-white shadow-md shadow-primary/20' 
                                    : 'bg-water/20 text-slate-400 dark:bg-white/5 dark:text-slate-500'
                              }`}
                            >
                              {isCompleted ? (
                                <FiCheckCircle className="h-5 w-5" />
                              ) : isCurrent ? (
                                <div className="h-2.5 w-2.5 rounded-full bg-white" />
                              ) : (
                                <div className="h-2 w-2 rounded-full bg-slate-400 dark:bg-slate-600" />
                              )}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className={`text-sm font-semibold ${
                                isCompleted || isCurrent 
                                  ? 'text-slate-800 dark:text-white' 
                                  : 'text-slate-400 dark:text-slate-500'
                              }`}>
                                {step.label}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
                
                {status === 'CANCELLED' && (
                  <li>
                    <div className="relative">
                      <div className="relative flex space-x-4">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-500/20">
                            <FiX className="h-5 w-5" />
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5">
                          <p className="text-sm font-bold text-slate-800 dark:text-white">Đã hủy đơn hàng</p>
                          {orderDetail?.cancelledAt && (
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                              Ngày hủy: {formatDateTime(orderDetail.cancelledAt)}
                            </p>
                          )}
                          {orderDetail?.cancelReason && (
                            <div className="mt-2 p-3 bg-red-100/80 dark:bg-red-950/30 border border-red-200/50 dark:border-red-900/20 rounded-xl">
                              <p className="text-xs font-bold text-red-800 dark:text-red-300 mb-1">Lý do hủy:</p>
                              <p className="text-sm font-semibold text-red-700 dark:text-red-400">{orderDetail.cancelReason}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Layout 2 cột */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cột trái: Sản phẩm & Tổng tiền */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Items */}
            <div className="glass-panel rounded-3xl shadow-xl overflow-hidden border border-water/30 dark:border-white/10">
              <div className="px-6 py-5 border-b border-water/20 dark:border-white/10 bg-water/5 dark:bg-white/5">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Sản phẩm</h3>
              </div>
              <div className="divide-y divide-water/10 dark:divide-white/5">
                {items && items.length > 0 ? (
                  items.map((item, index) => {
                    const productImage = (Array.isArray(item.productId?.images) && item.productId.images.length > 0 ? (typeof item.productId.images[0] === 'string' ? item.productId.images[0] : (item.productId.images[0]?.url || '')) : '') || (typeof item.productImage === 'string' ? item.productImage : item.productImage?.url) || item.image || 'https://via.placeholder.com/80';
                    const productName = item.productId?.name || item.productName || item.name || 'Sản phẩm không xác định';
                    const price = item.price || item.unitPrice || 0;
                    const quantity = item.quantity || 1;
                    const totalPrice = (item.subtotal != null ? item.subtotal : price * quantity);
                    
                    return (
                      <div key={item._id || `item-${index}`} className="p-6 flex flex-col sm:flex-row gap-4 sm:items-center">
                        <div className="flex-shrink-0 h-20 w-20 rounded-xl overflow-hidden border border-water/30 dark:border-white/10 bg-water/5 dark:bg-white/5">
                          <img
                            src={productImage}
                            alt={productName}
                            className="h-full w-full object-cover object-center"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/80'; }}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-1">
                            <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                              {productName}
                            </h4>
                            <p className="font-bold text-slate-800 dark:text-white whitespace-nowrap">{formatCurrency(price)}</p>
                          </div>
                          
                          {/* Display selected variant options */}
                          {item.selectedVariant && item.selectedVariant.optionValues && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {Object.entries(item.selectedVariant.optionValues).map(([key, value]) => (
                                <span 
                                  key={key} 
                                  className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-water/20 text-slate-800 dark:bg-white/10 dark:text-white border border-water/30 dark:border-white/20"
                                >
                                  <span className="font-bold">{key}:</span>&nbsp;{value}
                                </span>
                              ))}
                            </div>
                          )}
                          
                          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 font-semibold">Số lượng: {quantity}</p>
                          <p className="mt-2.5 text-sm font-bold text-slate-800 dark:text-slate-300">Thành tiền: {formatCurrency(totalPrice)}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-6 text-center text-slate-500 dark:text-slate-400 font-semibold"><p>Không có sản phẩm.</p></div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="glass-panel rounded-3xl shadow-xl overflow-hidden border border-water/30 dark:border-white/10">
              <div className="px-6 py-5 border-b border-water/20 dark:border-white/10 bg-water/5 dark:bg-white/5">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Tổng đơn hàng</h3>
              </div>
              <div className="px-6 py-5 sm:p-6">
                <dl className="space-y-4">
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Tạm tính</dt>
                    <dd className="text-sm font-bold text-slate-800 dark:text-slate-200">{formatCurrency(subTotal)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Phí vận chuyển</dt>
                    <dd className="text-sm font-bold text-slate-800 dark:text-slate-200">{shippingFee ? formatCurrency(shippingFee) : 'Miễn phí'}</dd>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Giảm giá</dt>
                      <dd className="text-sm font-bold text-rose-600 dark:text-rose-400">-{formatCurrency(discount)}</dd>
                    </div>
                  )}
                  <div className="border-t border-water/20 dark:border-white/10 pt-4 flex items-center justify-between">
                    <dt className="text-base font-bold text-slate-800 dark:text-white">Tổng cộng</dt>
                    <dd className="text-lg font-black text-slate-800 dark:text-white">{formatCurrency(total)}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          {/* Cột phải: Địa chỉ & Thanh toán */}
          <div className="space-y-8">
            {/* Customer Info (Admin only) */}
            <div className="glass-panel rounded-3xl shadow-xl overflow-hidden border border-water/30 dark:border-white/10">
              <div className="px-6 py-5 border-b border-water/20 dark:border-white/10 bg-water/5 dark:bg-white/5">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Thông tin khách hàng</h3>
              </div>
              <div className="px-6 py-5">
                 <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{userId?.username || 'Khách vãng lai'}</p>
                 <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">{userId?.email || 'Không có email'}</p>
                 <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">{userId?.phone || 'Không có SĐT'}</p>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="glass-panel rounded-3xl shadow-xl overflow-hidden border border-water/30 dark:border-white/10">
              <div className="px-6 py-5 border-b border-water/20 dark:border-white/10 bg-water/5 dark:bg-white/5">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Địa chỉ giao hàng</h3>
              </div>
              <div className="px-6 py-5">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-0.5"><FiMapPin className="h-5 w-5 text-slate-400 dark:text-slate-500" /></div>
                  <div className="ml-3">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{effectiveShippingAddress.fullName}</p>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">{effectiveShippingAddress.phoneNumber}</p>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                      {[effectiveShippingAddress.street, effectiveShippingAddress.ward, effectiveShippingAddress.district, effectiveShippingAddress.city].filter(Boolean).join(', ') || 'Chưa có địa chỉ'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="glass-panel rounded-3xl shadow-xl overflow-hidden border border-water/30 dark:border-white/10">
              <div className="px-6 py-5 border-b border-water/20 dark:border-white/10 bg-water/5 dark:bg-white/5">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Phương thức thanh toán</h3>
              </div>
              <div className="px-6 py-5">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-0.5"><FiDollarSign className="h-5 w-5 text-slate-400 dark:text-slate-500" /></div>
                  <div className="ml-3">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {derivedPaymentMethod === 'COD' ? 'Thanh toán khi nhận hàng (COD)' : derivedPaymentMethod === 'VNPAY' ? 'Thanh toán qua VNPAY' : derivedPaymentMethod || 'Không xác định'}
                    </p>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1.5">
                      {derivedPaymentStatus === 'paid' ? 'Đã thanh toán' : derivedPaymentMethod === 'COD' ? 'Sẽ thanh toán khi nhận hàng' : 'Chưa thanh toán'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>        
      </div>
    </AdminLayout>
  );
};

export default AdminOrderDetail;