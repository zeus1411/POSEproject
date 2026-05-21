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
    <div className="my-orders-page min-h-screen bg-transparent text-foreground">
      <div className="glass-card border-b border-water/35 dark:border-white/6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-foreground dark:text-white">Đơn hàng của tôi</h1>
          <p className="text-muted-foreground mt-1 dark:text-white/70">Theo dõi và quản lý các đơn hàng đã đặt</p>
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
                  ? 'bg-ocean text-primary-foreground border-ocean shadow-sm dark:bg-emerald-400 dark:text-abyss-800 dark:border-emerald-400'
                  : 'bg-card/80 text-foreground border-water/45 hover:bg-aqua/20 hover:border-ocean/60 dark:bg-transparent dark:text-white/80 dark:border-white/10 dark:hover:bg-white/6'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div className="glass-card rounded-lg shadow-sm border border-water/40 dark:border-white/10">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-ocean mx-auto dark:border-emerald-300"></div>
              <p className="mt-4 text-muted-foreground dark:text-white/70">Đang tải đơn hàng...</p>
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-400">{error}</div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-muted-foreground dark:text-white/70">Bạn chưa có đơn hàng nào.</p>
            </div>
          ) : (
            <ul className="divide-y divide-water/30 dark:divide-white/6">
              {orders.map((order) => (
                <li key={order._id} className="p-4 sm:p-6 hover:bg-aqua/14 transition-colors rounded-lg dark:hover:bg-white/6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Left: Order meta */}
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-base font-semibold text-foreground dark:text-white">#{order.orderNumber || order._id.slice(-6)}</h3>
                        <StatusBadge status={order.status} />
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 dark:text-white/70">{formatDate(order.createdAt)}</p>

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
                              className="w-12 h-12 rounded object-cover border border-water/35 dark:border-white/6"
                              onError={(e) => {
                                e.target.src = '/placeholder-product.jpg';
                              }}
                            />
                          );
                        })}
                        {order.items?.length > 4 && (
                          <span className="text-xs text-muted-foreground self-center dark:text-white/60">+{order.items.length - 4} nữa</span>
                        )}
                      </div>
                    </div>

                    {/* Right: Summary */}
                      <div className="text-right">
                      <div className="text-sm text-muted-foreground dark:text-white/70">Tổng thanh toán</div>
                      <div className="text-lg font-bold text-nature dark:text-emerald-300">{formatCurrency(order.totalPrice)}</div>
                      <div className="mt-2 text-sm text-muted-foreground dark:text-white/60">{order.items?.reduce((s, i)=> s + i.quantity, 0)} sản phẩm</div>
                      <div className="mt-3">
                        <button 
                          onClick={() => navigate(`/orders/${order._id}`)}
                          className="px-4 py-2 text-sm font-medium text-primary-foreground bg-gradient-to-r from-nature to-ocean rounded-lg hover:shadow-md transition shadow-sm dark:text-abyss-800 dark:from-emerald-400 dark:to-cyan-300"
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
              className={`w-10 h-10 flex items-center justify-center rounded-full border transition-colors ${pagination.page === 1 ? 'border-water/30 text-muted-foreground/60 bg-transparent cursor-not-allowed dark:border-white/10 dark:text-white/40' : 'border-water/45 text-foreground hover:bg-aqua/20 dark:border-white/20 dark:text-white dark:hover:bg-white/6'}`}
              aria-label="Trang trước"
            >
              &lt;
            </button>

            <span className="text-sm text-muted-foreground dark:text-white/70">Trang {pagination.page} / {pagination.pages}</span>

            <button
              onClick={() => onPageChange(Math.min(pagination.pages, pagination.page + 1))}
              disabled={pagination.page === pagination.pages}
              className={`w-10 h-10 flex items-center justify-center rounded-full border transition-colors ${pagination.page === pagination.pages ? 'border-water/30 text-muted-foreground/60 bg-transparent cursor-not-allowed dark:border-white/10 dark:text-white/40' : 'border-water/45 text-foreground hover:bg-aqua/20 dark:border-white/20 dark:text-white dark:hover:bg-white/6'}`}
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
