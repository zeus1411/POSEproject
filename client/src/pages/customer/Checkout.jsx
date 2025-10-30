import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchCart, resetCart } from '../../redux/slices/cartSlice';
import * as orderService from '../../services/orderService';

const formatCurrency = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v || 0);

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { cart, summary, loading } = useSelector((s) => s.cart);
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.username || '',
    phone: user?.phone || '',
    street: '',
    ward: '',
    district: '',
    city: '',
    country: 'Việt Nam',
    postalCode: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    dispatch(fetchCart());
  }, [user, dispatch, navigate]);

  useEffect(() => {
    // load preview from API for accurate totals
    const loadPreview = async () => {
      try {
        const res = await orderService.previewOrder();
        setPreview(res);
      } catch (e) {
        // fallback to cart summary
        setPreview(null);
      }
    };
    loadPreview();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
  };

  // In Checkout.jsx, update the handleSubmit function:
const handleSubmit = async (e) => {
  e.preventDefault();
  setSubmitting(true);
  setError(null);
  try {
    const orderData = {
      shippingAddress,
      paymentMethod,
      notes: '', // Add any additional fields if needed
    };
    const response = await orderService.createOrder(orderData);
    console.log('Order created:', response); // Debug log
    await dispatch(fetchCart()); // Refresh cart
    navigate('/orders');
  } catch (err) {
    console.error('Order creation error:', err);
    setError(err.response?.data?.message || 'Đã xảy ra lỗi khi đặt hàng. Vui lòng thử lại.');
  } finally {
    setSubmitting(false);
  }
};
  const items = cart?.items || [];
  const displayTotals = preview ? {
    subtotal: preview.subtotal,
    shippingFee: preview.shippingFee,
    discount: preview.discount,
    total: preview.totalPrice,
  } : {
    subtotal: summary.subtotal,
    shippingFee: summary.shippingFee,
    discount: 0,
    total: summary.total,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Thanh toán</h1>
          <p className="text-gray-600 mt-1">Nhập địa chỉ giao hàng và đặt hàng</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          {error && <div className="p-3 bg-red-50 text-red-700 rounded">{error}</div>}

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Địa chỉ giao hàng</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Họ và tên</label>
                <input name="fullName" value={shippingAddress.fullName} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Số điện thoại</label>
                <input name="phone" value={shippingAddress.phone} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-700 mb-1">Địa chỉ</label>
                <input name="street" value={shippingAddress.street} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Phường/Xã</label>
                <input name="ward" value={shippingAddress.ward} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Quận/Huyện</label>
                <input name="district" value={shippingAddress.district} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Tỉnh/Thành phố</label>
                <input name="city" value={shippingAddress.city} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Phương thức thanh toán</h2>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input type="radio" name="payment" value="COD" checked={paymentMethod==='COD'} onChange={()=>setPaymentMethod('COD')} />
                <span>Thanh toán khi nhận hàng (COD)</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={submitting || items.length===0} className="px-5 py-3 text-white bg-gradient-to-r from-primary-600 to-purple-600 rounded-lg hover:from-primary-700 hover:to-purple-700 disabled:opacity-50">
              {submitting ? 'Đang tạo đơn hàng...' : 'Đặt hàng'}
            </button>
          </div>
        </form>

        {/* Summary */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 h-fit">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tóm tắt đơn hàng</h2>
          {loading ? (
            <div className="text-gray-600">Đang tải giỏ hàng...</div>
          ) : items.length === 0 ? (
            <div className="text-gray-600">Giỏ hàng trống</div>
          ) : (
            <div className="space-y-4">
              <ul className="divide-y divide-gray-100">
                {items.map((it) => (
                  <li key={it._id} className="py-3 flex items-center gap-3">
                    <img src={it.productId?.images?.[0]?.url || '/placeholder-product.jpg'} alt={it.productId?.name} className="w-12 h-12 rounded object-cover border" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 line-clamp-1">{it.productId?.name}</div>
                      <div className="text-xs text-gray-500">x{it.quantity}</div>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {formatCurrency((it.productId?.salePrice || it.productId?.price) * it.quantity)}
                    </div>
                  </li>
                ))}
              </ul>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Tạm tính</span><span className="font-medium">{formatCurrency(displayTotals.subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Phí vận chuyển</span><span className="font-medium">{displayTotals.shippingFee===0 ? 'Miễn phí' : formatCurrency(displayTotals.shippingFee)}</span></div>
                {displayTotals.discount>0 && (<div className="flex justify-between"><span className="text-gray-600">Giảm giá</span><span className="font-medium text-green-600">-{formatCurrency(displayTotals.discount)}</span></div>)}
                <div className="pt-2 mt-2 border-t flex justify-between text-base"><span className="font-semibold">Tổng cộng</span><span className="font-bold text-primary-600">{formatCurrency(displayTotals.total)}</span></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;
