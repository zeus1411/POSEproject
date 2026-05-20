import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchUserOrders, setOrderStatusFilter } from '../../redux/slices/orderSlice';

const statusOptions = [
  { key: '', label: 'Tất cả' },
  { key: 'PENDING', label: 'Chờ xử lý' },
  { key: 'CONFIRMED', label: 'Đã xác nhận' },
  { key: 'SHIPPING', label: 'Đang giao' },
  { key: 'COMPLETED', label: 'Hoàn thành' },
  { key: 'CANCELLED', label: 'Đã hủy' },
];

const formatCurrency = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v || 0);
const formatDate = (d) => new Date(d).toLocaleString('vi-VN');

const StatusBadge = ({ status }) => {
  const statusLabels = {
    PENDING: 'Chờ xử lý',
    CONFIRMED: 'Đã xác nhận',
    SHIPPING: 'Đang giao',
    COMPLETED: 'Hoàn thành',
    CANCELLED: 'Đã hủy',
    FAILED: 'Thất bại',
  };
  
  const map = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    PROCESSING: 'bg-indigo-100 text-indigo-800',
    SHIPPING: 'bg-purple-100 text-purple-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
    FAILED: 'bg-red-100 text-red-800',
  };
  
  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${map[status] || 'bg-gray-100 text-gray-800'}`}>
      {statusLabels[status] || status || 'N/A'}
    </span>
  );
};

const MyOrders = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { orders, pagination, loading, error, filter } = useSelector((s) => s.orders);

  useEffect(() => {
    if (user) dispatch(fetchUserOrders({ page: 1, limit: 10, status: filter.status }));
  }, [dispatch, user, filter.status]);

  const onFilterChange = (status) => {
    dispatch(setOrderStatusFilter(status));
  };

  const onPageChange = (page) => {
    dispatch(fetchUserOrders({ page, limit: pagination.limit, status: filter.status }));
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-600">Vui lòng đăng nhập để xem đơn hàng của bạn.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      <div className="glass-card border-b border-white/6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-white">Đơn hàng của tôi</h1>
          <p className="text-white/70 mt-1">Theo dõi và quản lý các đơn hàng đã đặt</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {statusOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => onFilterChange(opt.key)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                filter.status === opt.key
                  ? 'bg-emerald-400 text-abyss-800 border-emerald-400'
                  : 'bg-transparent text-white/80 border-white/10 hover:bg-white/6'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div className="glass-card rounded-lg shadow-sm border border-white/10">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-300 mx-auto"></div>
              <p className="mt-4 text-white/70">Đang tải đơn hàng...</p>
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-400">{error}</div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-white/70">Bạn chưa có đơn hàng nào.</p>
            </div>
          ) : (
            <ul className="divide-y divide-white/6">
              {orders.map((order) => (
                <li key={order._id} className="p-4 sm:p-6 hover:bg-white/6 transition-colors rounded-lg">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Left: Order meta */}
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-base font-semibold text-white">#{order.orderNumber || order._id.slice(-6)}</h3>
                        <StatusBadge status={order.status} />
                      </div>
                      <p className="text-sm text-white/70 mt-1">{formatDate(order.createdAt)}</p>

                      {/* Thumbnails */}
                      <div className="flex gap-2 mt-3">
                        {order.items?.slice(0, 4).map((it, idx) => {
                          // Handle both string URLs and object formats
                          let imgSrc = '/placeholder-product.jpg';
                          
                          if (it.productImage) {
                            // If productImage is a string URL
                            if (typeof it.productImage === 'string') {
                              imgSrc = it.productImage;
                            } 
                            // If productImage is an object with url property
                            else if (it.productImage.url) {
                              imgSrc = it.productImage.url;
                            }
                          } 
                          // Fallback to product's first image
                          else if (it.productId?.images?.[0]) {
                            imgSrc = Array.isArray(it.productId.images) 
                              ? it.productId.images[0] 
                              : it.productId.images;
                          }
                          
                          return (
                            <img
                              key={it._id}
                              src={imgSrc}
                              alt={it.productName || it.productId?.name || 'Sản phẩm'}
                              className="w-12 h-12 rounded object-cover border border-white/6"
                              onError={(e) => {
                                e.target.src = '/placeholder-product.jpg';
                              }}
                            />
                          );
                        })}
                        {order.items?.length > 4 && (
                          <span className="text-xs text-white/60 self-center">+{order.items.length - 4} nữa</span>
                        )}
                      </div>
                    </div>

                    {/* Right: Summary */}
                      <div className="text-right">
                      <div className="text-sm text-white/70">Tổng thanh toán</div>
                      <div className="text-lg font-bold text-emerald-300">{formatCurrency(order.totalPrice)}</div>
                      <div className="mt-2 text-sm text-white/60">{order.items?.reduce((s, i)=> s + i.quantity, 0)} sản phẩm</div>
                      <div className="mt-3">
                        <button 
                          onClick={() => navigate(`/orders/${order._id}`)}
                          className="px-4 py-2 text-sm font-medium text-abyss-800 bg-gradient-to-r from-emerald-400 to-cyan-300 rounded-lg hover:shadow-md transition shadow-sm"
                        >
                          Xem chi tiết
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
              disabled={pagination.page === 1}
              className={`w-10 h-10 flex items-center justify-center rounded-full border transition-colors ${pagination.page === 1 ? 'border-white/10 text-white/40 bg-transparent cursor-not-allowed' : 'border-white/20 text-white hover:bg-white/6'}`}
              aria-label="Trang trước"
            >
              &lt;
            </button>

            <span className="text-sm text-white/70">Trang {pagination.page} / {pagination.pages}</span>

            <button
              onClick={() => onPageChange(Math.min(pagination.pages, pagination.page + 1))}
              disabled={pagination.page === pagination.pages}
              className={`w-10 h-10 flex items-center justify-center rounded-full border transition-colors ${pagination.page === pagination.pages ? 'border-white/10 text-white/40 bg-transparent cursor-not-allowed' : 'border-white/20 text-white hover:bg-white/6'}`}
              aria-label="Trang sau"
            >
              &gt;
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;