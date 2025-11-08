import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchCart, resetCart } from '../../redux/slices/cartSlice';
import * as orderService from '../../services/orderService';
import { toast } from 'react-toastify';

// ==================== VNPay Payment Modal Component ====================
const VNPayPaymentModal = ({ order, paymentData, onClose, onSuccess, onError }) => {
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [countdown, setCountdown] = useState(600);
  
  useEffect(() => {
    if (paymentData?.paymentUrl) {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(paymentData.paymentUrl)}`;
      setQrCodeUrl(qrUrl);
    }
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setPaymentStatus('failed');
          onError('Hết thời gian thanh toán');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [paymentData, onError]);
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };
  
  const handleTestPayment = () => {
    setPaymentStatus('processing');
    setTimeout(() => {
      setPaymentStatus('success');
      setTimeout(() => {
        onSuccess();
      }, 2000);
    }, 2000);
  };
  
  const openVNPayWindow = () => {
    if (paymentData?.paymentUrl) {
      window.open(paymentData.paymentUrl, 'vnpay', 'width=800,height=600');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-1 transition"
            disabled={paymentStatus === 'processing' || paymentStatus === 'success'}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="flex items-center justify-center mb-3">
            <div className="bg-white rounded px-4 py-2">
              <span className="text-blue-600 font-bold text-xl">VNPAY</span>
            </div>
          </div>
          
          <h2 className="text-xl font-bold text-center">Thanh toán VNPay</h2>
          <p className="text-blue-100 text-sm text-center mt-1">
            Đơn hàng: {order?.orderNumber || 'N/A'}
          </p>
        </div>
        
        <div className="p-6">
          {paymentStatus === 'pending' && (
            <>
              <div className="bg-blue-50 rounded-lg p-4 mb-6 text-center">
                <p className="text-sm text-gray-600 mb-1">Số tiền thanh toán</p>
                <p className="text-3xl font-bold text-blue-600">
                  {formatCurrency(order?.totalPrice || 0)}
                </p>
              </div>
              
              <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-6 mb-6">
                <p className="text-center text-sm text-gray-600 mb-4">
                  Quét mã QR để thanh toán
                </p>
                {qrCodeUrl ? (
                  <div className="flex justify-center">
                    <img 
                      src={qrCodeUrl} 
                      alt="QR Code" 
                      className="w-64 h-64 border border-gray-200 rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-64 bg-gray-100 rounded-lg">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-center gap-2 mb-6 text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-lg font-mono font-semibold">
                  {formatTime(countdown)}
                </span>
              </div>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-amber-800 font-medium mb-2">
                  📌 Hướng dẫn thanh toán:
                </p>
                <ol className="text-sm text-amber-700 space-y-1 ml-4 list-decimal">
                  <li>Mở ứng dụng ngân hàng hoặc ví điện tử</li>
                  <li>Quét mã QR ở trên</li>
                  <li>Xác nhận thanh toán</li>
                  <li>Chờ xác nhận từ hệ thống</li>
                </ol>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={openVNPayWindow}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition font-medium shadow-md"
                >
                  Mở cổng thanh toán VNPay
                </button>
                
                <button
                  onClick={handleTestPayment}
                  className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                >
                  ✓ Test: Giả lập thanh toán thành công
                </button>
                
                <button
                  onClick={onClose}
                  className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Hủy thanh toán
                </button>
              </div>
              
              <p className="text-xs text-gray-500 text-center mt-4">
                Lưu ý: Vui lòng không tắt cửa sổ này cho đến khi hoàn tất thanh toán
              </p>
            </>
          )}
          
          {paymentStatus === 'processing' && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-lg font-medium text-gray-900 mb-2">
                Đang xử lý thanh toán...
              </p>
              <p className="text-sm text-gray-600">
                Vui lòng đợi trong giây lát
              </p>
            </div>
          )}
          
          {paymentStatus === 'success' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-xl font-bold text-gray-900 mb-2">
                Thanh toán thành công!
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Đơn hàng của bạn đã được xác nhận
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  Cảm ơn bạn đã mua hàng. Chúng tôi sẽ xử lý đơn hàng của bạn ngay.
                </p>
              </div>
            </div>
          )}
          
          {paymentStatus === 'failed' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-xl font-bold text-gray-900 mb-2">
                Thanh toán thất bại
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Vui lòng thử lại hoặc chọn phương thức thanh toán khác
              </p>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
              >
                Đóng
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==================== Main Checkout Component ====================
const formatCurrency = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v || 0);

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { cart, summary, loading } = useSelector((s) => s.cart);
  
  const [userProfile, setUserProfile] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showVNPayModal, setShowVNPayModal] = useState(false);
  const [vnpayData, setVnpayData] = useState(null);

  // Fetch user profile để lấy địa chỉ
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      try {
        // Import api từ service
        const api = (await import('../../services/api')).default;
        const response = await api.get('/users/profile');
        setUserProfile(response.data?.data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, [user]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    dispatch(fetchCart());
  }, [user, dispatch, navigate]);

  useEffect(() => {
    const loadPreview = async () => {
      try {
        const res = await orderService.previewOrder();
        setPreview(res);
      } catch (e) {
        console.error('Preview error:', e);
        setPreview(null);
      }
    };
    loadPreview();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Kiểm tra user profile và địa chỉ
    if (!userProfile?.address) {
      toast.error('Vui lòng cập nhật địa chỉ của bạn trong trang Thông tin cá nhân trước khi đặt hàng');
      return;
    }

    const addr = userProfile.address;
    if (!addr.street || !addr.ward || !addr.district || !addr.city) {
      toast.error('Địa chỉ của bạn chưa đầy đủ. Vui lòng cập nhật trong trang Thông tin cá nhân');
      return;
    }
    
    setShowConfirmModal(true);
  };

  const handleConfirmOrder = async () => {
    setSubmitting(true);
    setError(null);
    
    try {
      const addr = userProfile.address;
      const orderData = {
        shippingAddress: {
          fullName: userProfile.username || user.username,
          phone: userProfile.phone || user.phone || '',
          street: addr.street,
          ward: addr.ward,
          district: addr.district,
          city: addr.city,
          country: addr.country || 'Việt Nam',
          postalCode: addr.postalCode || ''
        },
        paymentMethod: paymentMethod === 'VNPAY' ? 'VNPAY' : 'COD',
        notes: ''
      };
      
      console.log('Submitting order with data:', JSON.stringify(orderData, null, 2));
      
      const result = await orderService.createOrder(orderData);
      console.log('Order result:', result);
      
      setShowConfirmModal(false);
      
      if (paymentMethod === 'VNPAY') {
        if (result?.data?.order && result?.data?.paymentUrl) {
          setVnpayData({
            order: result.data.order,
            paymentUrl: result.data.paymentUrl,
            payment: result.data.payment
          });
          setShowVNPayModal(true);
        } else {
          throw new Error('Không nhận được thông tin thanh toán VNPay');
        }
      } else {
        await dispatch(resetCart());
        toast.success('Đặt hàng thành công!');
        navigate('/orders');
      }
    } catch (err) {
      console.error('Order error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Đã xảy ra lỗi khi đặt hàng. Vui lòng thử lại.';
      setError(errorMessage);
      toast.error(errorMessage);
      setShowConfirmModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVNPaySuccess = async () => {
    await dispatch(resetCart());
    toast.success('Thanh toán thành công!');
    setShowVNPayModal(false);
    navigate('/orders');
  };

  const handleVNPayError = (error) => {
    toast.error(error);
    setShowVNPayModal(false);
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

  // Format địa chỉ để hiển thị
  const formatAddress = () => {
    if (!userProfile?.address) return 'Chưa có địa chỉ';
    const addr = userProfile.address;
    const parts = [addr.street, addr.ward, addr.district, addr.city, addr.country].filter(Boolean);
    return parts.join(', ') || 'Chưa có địa chỉ';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Xác nhận đơn hàng</h1>
          <p className="text-gray-600 mt-1">Xác nhận thông tin đơn hàng, thông tin cá nhân và đặt hàng</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-2 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              <p className="font-medium">Lỗi:</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          )}

          {/* Thông tin cá nhân */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cá nhân</h2>
            {userProfile ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-gray-600">Họ và tên:</span>
                  <span className="font-medium text-gray-900">{userProfile.username || user.username}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium text-gray-900">{userProfile.email || user.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-gray-600">Số điện thoại:</span>
                  <span className="font-medium text-gray-900">{userProfile.phone || 'Chưa cập nhật'}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              </div>
            )}
          </div>

          {/* Địa chỉ giao hàng */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Địa chỉ giao hàng</h2>
              <button
                onClick={() => navigate('/profile')}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Cập nhật địa chỉ
              </button>
            </div>
            
            {userProfile?.address ? (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{formatAddress()}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800">
                  Bạn chưa cập nhật địa chỉ. Vui lòng cập nhật địa chỉ trong trang Thông tin cá nhân để tiếp tục đặt hàng.
                </p>
                <button
                  onClick={() => navigate('/profile')}
                  className="mt-2 text-sm font-medium text-amber-900 hover:text-amber-700"
                >
                  Cập nhật ngay →
                </button>
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Phương thức thanh toán</h2>
            <div className="space-y-3">
              <div className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input 
                  id="cod" 
                  type="radio" 
                  name="payment" 
                  value="COD" 
                  checked={paymentMethod === 'COD'} 
                  onChange={() => setPaymentMethod('COD')} 
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                />
                <label htmlFor="cod" className="ml-3 block text-sm text-gray-900 cursor-pointer flex-1">
                  <span className="font-medium">Thanh toán khi nhận hàng (COD)</span>
                  <p className="text-xs text-gray-500 mt-1">Thanh toán bằng tiền mặt khi nhận hàng</p>
                </label>
              </div>
              <div className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input 
                  id="vnpay" 
                  type="radio" 
                  name="payment" 
                  value="VNPAY" 
                  checked={paymentMethod === 'VNPAY'} 
                  onChange={() => setPaymentMethod('VNPAY')} 
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                />
                <label htmlFor="vnpay" className="ml-3 block text-sm text-gray-900 cursor-pointer flex-1">
                  <span className="font-medium">Thanh toán qua VNPay</span>
                  <p className="text-xs text-gray-500 mt-1">Thanh toán trực tuyến qua VNPay</p>
                </label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button 
              onClick={handleSubmit}
              disabled={submitting || items.length === 0 || !userProfile?.address} 
              className="px-6 py-3 text-white bg-gradient-to-r from-primary-600 to-purple-600 rounded-lg hover:from-primary-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
            >
              {submitting ? 'Đang tạo đơn hàng...' : 'Đặt hàng'}
            </button>
          </div>
        </div>

        {/* Summary Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 h-fit">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tóm tắt đơn hàng</h2>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-2 text-gray-600 text-sm">Đang tải giỏ hàng...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Giỏ hàng trống</p>
              <button 
                onClick={() => navigate('/shop')}
                className="mt-4 text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                Tiếp tục mua sắm
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <ul className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
                {items.map((it) => (
                  <li key={it._id} className="py-3 flex items-center gap-3">
                    <img 
                      src={it.productId?.images?.[0]?.url || '/placeholder-product.jpg'} 
                      alt={it.productId?.name} 
                      className="w-12 h-12 rounded object-cover border flex-shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 line-clamp-2">{it.productId?.name}</div>
                      <div className="text-xs text-gray-500">x{it.quantity}</div>
                    </div>
                    <div className="text-sm font-semibold text-gray-900 flex-shrink-0">
                      {formatCurrency((it.productId?.salePrice || it.productId?.price) * it.quantity)}
                    </div>
                  </li>
                ))}
              </ul>
              <div className="space-y-2 text-sm pt-4 border-t">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tạm tính</span>
                  <span className="font-medium">{formatCurrency(displayTotals.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phí vận chuyển</span>
                  <span className="font-medium">
                    {displayTotals.shippingFee === 0 ? <span className="text-green-600">Miễn phí</span> : formatCurrency(displayTotals.shippingFee)}
                  </span>
                </div>
                {displayTotals.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Giảm giá</span>
                    <span className="font-medium text-green-600">-{formatCurrency(displayTotals.discount)}</span>
                  </div>
                )}
                <div className="pt-3 mt-3 border-t flex justify-between text-base">
                  <span className="font-semibold text-gray-900">Tổng cộng</span>
                  <span className="font-bold text-primary-600 text-lg">{formatCurrency(displayTotals.total)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal for COD */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-primary-100 rounded-full mb-4">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Xác nhận đơn hàng</h3>
            <div className="space-y-3 mb-6 bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tổng tiền:</span>
                <span className="font-semibold text-gray-900">{formatCurrency(displayTotals.total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Phương thức:</span>
                <span className="font-medium text-gray-900">{paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : 'VNPay'}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-600">Địa chỉ:</span>
                <p className="font-medium text-gray-900 mt-1">{formatAddress()}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={submitting}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-gray-700 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmOrder}
                disabled={submitting}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-lg hover:from-primary-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm transition"
              >
                {submitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang xử lý...
                  </span>
                ) : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VNPay Payment Modal */}
      {showVNPayModal && vnpayData && (
        <VNPayPaymentModal
          order={vnpayData.order}
          paymentData={vnpayData}
          onClose={() => {
            setShowVNPayModal(false);
            setVnpayData(null);
          }}
          onSuccess={handleVNPaySuccess}
          onError={handleVNPayError}
        />
      )}
    </div>
  );
};

export default Checkout;