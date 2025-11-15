// client/src/pages/admin/AdminOrderDetail.jsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiArrowLeft, FiPackage, FiTruck, FiCheckCircle, FiXCircle, FiClock, FiDollarSign, FiMapPin, FiX } from 'react-icons/fi';

// ✅ BƯỚC 1: Thay đổi import Redux
import { 
  fetchAdminOrderDetail, 
  clearCurrentOrder 
} from '../../redux/slices/adminOrderSlice'; // Dùng slice của Admin

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
    color: 'bg-yellow-100 text-yellow-800',
    description: 'Đơn hàng đang chờ được xác nhận từ cửa hàng.'
  },
  CONFIRMED: { 
    label: 'Đã xác nhận', 
    color: 'bg-blue-100 text-blue-800',
    description: 'Đơn hàng đã được xác nhận và đang được chuẩn bị.'
  },
  PROCESSING: { // Thêm status này (nếu có)
    label: 'Đang xử lý',
    color: 'bg-indigo-100 text-indigo-800',
    description: 'Đơn hàng đang được cửa hàng xử lý.'
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
  { status: 'PROCESSING', icon: <FiCheckCircle className="w-5 h-5" />, label: 'Đang xử lý' }, // Thêm bước này
  { status: 'SHIPPING', icon: <FiTruck className="w-5 h-5" />, label: 'Đang giao hàng' },
  { status: 'COMPLETED', icon: <FiPackage className="w-5 h-5" />, label: 'Hoàn thành' },
];
// -----------------------------------------------------------------
// HẾT PHẦN SAO CHÉP HELPER
// -----------------------------------------------------------------


// ✅ Đổi tên component thành AdminOrderDetail
const AdminOrderDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
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


  // ✅ BƯỚC 6: XÓA LOGIC HỦY ĐƠN
  // Xóa hết state [showCancelDialog], [isCancelling], [cancelError]
  // Xóa hết các hàm handleCancelOrder, handleConfirmCancel, handleCloseDialog


  // === TOÀN BỘ LOGIC RENDER BÊN DƯỚI ĐƯỢC SAO CHÉP GẦN NHƯ 100% ===
  // === VÀ NÓ SẼ TỰ ĐỘNG CHẠY VÌ CHÚNG TA ĐÃ ĐỔI TÊN STATE (BƯỚC 4) ===

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

  const currentStatus = statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800', description: 'Trạng thái không xác định' };
  
  // ✅ BƯỚC 6: XÓA LOGIC HỦY ĐƠN (biến canCancel)

  const orderDate = formatDateTime(createdAt) || 'Chưa có thông tin';

  if (orderDetailLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </AdminLayout>
    );
  }

  if (orderDetailError) {
    return (
      <AdminLayout>
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-sm text-red-700">
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
          <FiPackage className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Không tìm thấy đơn hàng</h3>
        </div>
      </AdminLayout>
    );
  }
  
  // ✅ BƯỚC 7: BỌC TOÀN BỘ UI TRONG <AdminLayout>
  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* ✅ BƯỚC 8: THÊM HEADER MỚI CÓ NÚT "QUAY LẠI" */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/admin/orders')} // Nút quay lại
            className="p-2 rounded-full hover:bg-gray-200"
          >
            <FiArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Chi tiết đơn hàng #{orderNumber || id.slice(-6)}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Đặt ngày: {orderDate}
            </p>
          </div>
          <span className={`ml-auto inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${currentStatus.color}`}>
            {currentStatus.label}
          </span>
        </div>

        {/* ✅ BƯỚC 9: XÓA HEADER CŨ (ĐÃ TÍCH HỢP VÀO BƯỚC 8) */}
        {/* <div className="bg-white shadow ... mb-6"> ... </div> */}


        {/* === PHẦN UI CÒN LẠI SAO CHÉP Y HỆT TỪ ORDERDETAIL.JSX === */}
        
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
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
                
                {status === 'CANCELLED' && (
                  <li>
                    <div className="relative">
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-red-500 text-white flex items-center justify-center ring-8 ring-white">
                            <FiX className="h-5 w-5" />
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5">
                          <p className="text-sm font-medium text-gray-900">Đã hủy đơn hàng</p>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cột trái: Sản phẩm & Tổng tiền */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Sản phẩm</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {items && items.length > 0 ? (
                  items.map((item, index) => {
                    const productImage = (Array.isArray(item.productId?.images) && item.productId.images.length > 0 ? (typeof item.productId.images[0] === 'string' ? item.productId.images[0] : (item.productId.images[0]?.url || '')) : '') || (typeof item.productImage === 'string' ? item.productImage : item.productImage?.url) || item.image || 'https://via.placeholder.com/80';
                    const productName = item.productId?.name || item.productName || item.name || 'Sản phẩm không xác định';
                    const price = item.price || item.unitPrice || 0;
                    const quantity = item.quantity || 1;
                    const totalPrice = (item.subtotal != null ? item.subtotal : price * quantity);
                    
                    return (
                      <div key={item._id || `item-${index}`} className="p-4 sm:p-6 flex">
                        <div className="flex-shrink-0 h-20 w-20 rounded-md overflow-hidden border border-gray-200">
                          <img
                            src={productImage}
                            alt={productName}
                            className="h-full w-full object-cover object-center"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/80'; }}
                          />
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex justify-between">
                            <h4 className="text-sm font-medium text-gray-900 line-clamp-2">{productName}</h4>
                            <p className="ml-4 font-medium text-gray-900 whitespace-nowrap">{formatCurrency(price)}</p>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">Số lượng: {quantity}</p>
                          <p className="mt-2 text-sm font-medium text-gray-900">Thành tiền: {formatCurrency(totalPrice)}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-6 text-center text-gray-500"><p>Không có sản phẩm.</p></div>
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
                    <dd className="text-sm font-medium text-gray-900">{formatCurrency(subTotal)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Phí vận chuyển</dt>
                    <dd className="text-sm font-medium text-gray-900">{shippingFee ? formatCurrency(shippingFee) : 'Miễn phí'}</dd>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Giảm giá</dt>
                      <dd className="text-sm font-medium text-red-600">-{formatCurrency(discount)}</dd>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
                    <dt className="text-base font-medium text-gray-900">Tổng cộng</dt>
                    <dd className="text-base font-bold text-gray-900">{formatCurrency(total)}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          {/* Cột phải: Địa chỉ & Thanh toán */}
          <div className="space-y-6">
            {/* Customer Info (Admin only) */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Thông tin khách hàng</h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                 <p className="text-sm font-medium text-gray-900">{userId?.username || 'Khách vãng lai'}</p>
                 <p className="text-sm text-gray-500">{userId?.email || 'Không có email'}</p>
                 <p className="text-sm text-gray-500">{userId?.phone || 'Không có SĐT'}</p>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Địa chỉ giao hàng</h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0"><FiMapPin className="h-6 w-6 text-gray-400" /></div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{effectiveShippingAddress.fullName}</p>
                    <p className="text-sm text-gray-500">{effectiveShippingAddress.phoneNumber}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {[effectiveShippingAddress.street, effectiveShippingAddress.ward, effectiveShippingAddress.district, effectiveShippingAddress.city].filter(Boolean).join(', ') || 'Chưa có địa chỉ'}
                    </p>
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
                  <div className="flex-shrink-0"><FiDollarSign className="h-6 w-6 text-gray-400" /></div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {derivedPaymentMethod === 'COD' ? 'Thanh toán khi nhận hàng (COD)' : derivedPaymentMethod === 'VNPAY' ? 'Thanh toán qua VNPAY' : derivedPaymentMethod || 'Không xác định'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
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