import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchCart, resetCart } from '../../redux/slices/cartSlice';
import { setUser } from '../../redux/slices/authSlice';
import * as orderService from '../../services/orderService';
import userService from '../../services/userService';
import addressService from '../../services/addressService';
import api from '../../services/api';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { calculateShippingFee } from '../../utils/shippingCalculator';
import CouponDropdown from '../../components/checkout/CouponDropdown';

// ==================== Edit Address Modal Component ====================
const EditAddressModal = ({ isOpen, onClose, currentAddress, onSuccess }) => {
  const [formData, setFormData] = useState({
    street: '',
    ward: '',
    wardCode: '',
    district: '',
    districtId: '',
    city: '',
    cityId: '',
  });

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      loadProvinces();
      
      // Load current address data
      if (currentAddress) {
        setFormData({
          street: currentAddress.street || '',
          ward: currentAddress.ward || '',
          wardCode: currentAddress.wardCode || '',
          district: currentAddress.district || '',
          districtId: currentAddress.districtId || '',
          city: currentAddress.city || '',
          cityId: currentAddress.cityId || '',
        });

        if (currentAddress.cityId) {
          loadDistricts(currentAddress.cityId);
        }
        if (currentAddress.districtId) {
          loadWards(currentAddress.districtId);
        }
      }
    }
  }, [isOpen, currentAddress]);

  const loadProvinces = async () => {
    try {
      setLoadingLocation(true);
      const response = await addressService.getProvinces();
      setProvinces(response.data.provinces || []);
    } catch (error) {
      console.error('Error loading provinces:', error);
      toast.error('Không thể tải danh sách tỉnh/thành phố');
    } finally {
      setLoadingLocation(false);
    }
  };

  const loadDistricts = async (provinceId) => {
    try {
      setLoadingLocation(true);
      const response = await addressService.getDistricts(provinceId);
      setDistricts(response.data.districts || []);
      setWards([]);
    } catch (error) {
      console.error('Error loading districts:', error);
      toast.error('Không thể tải danh sách quận/huyện');
    } finally {
      setLoadingLocation(false);
    }
  };

  const loadWards = async (districtId) => {
    try {
      setLoadingLocation(true);
      const response = await addressService.getWards(districtId);
      setWards(response.data.wards || []);
    } catch (error) {
      console.error('Error loading wards:', error);
      toast.error('Không thể tải danh sách phường/xã');
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleProvinceChange = (e) => {
    const selectedId = e.target.value;
    const selectedProvince = provinces.find(p => p.id === parseInt(selectedId));
    
    if (selectedProvince) {
      setFormData(prev => ({
        ...prev,
        cityId: selectedProvince.id,
        city: selectedProvince.name,
        districtId: '',
        district: '',
        wardCode: '',
        ward: ''
      }));
      loadDistricts(selectedProvince.id);
      setWards([]);
    }
  };

  const handleDistrictChange = (e) => {
    const selectedId = e.target.value;
    const selectedDistrict = districts.find(d => d.id === parseInt(selectedId));
    
    if (selectedDistrict) {
      setFormData(prev => ({
        ...prev,
        districtId: selectedDistrict.id,
        district: selectedDistrict.name,
        wardCode: '',
        ward: ''
      }));
      loadWards(selectedDistrict.id);
    }
  };

  const handleWardChange = (e) => {
    const selectedId = e.target.value;
    const selectedWard = wards.find(w => w.id === parseInt(selectedId));
    
    if (selectedWard) {
      setFormData(prev => ({
        ...prev,
        wardCode: selectedWard.id,
        ward: selectedWard.name
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.street.trim()) newErrors.street = 'Vui lòng nhập địa chỉ cụ thể';
    if (!formData.city) newErrors.city = 'Vui lòng chọn tỉnh/thành phố';
    if (!formData.district) newErrors.district = 'Vui lòng chọn quận/huyện';
    if (!formData.ward) newErrors.ward = 'Vui lòng chọn phường/xã';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      // Update user profile with new address
      const response = await userService.updateProfile({
        address: formData
      });
      
      toast.success('Cập nhật địa chỉ thành công!');
      onSuccess?.(response.data.user);
      onClose();
    } catch (error) {
      console.error('Error updating address:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật địa chỉ');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto p-0">
        <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white/4 backdrop-blur-md">
          <h2 className="text-lg font-bold text-white">Cập nhật địa chỉ giao hàng</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/6 rounded-full transition-colors"
            aria-label="Đóng"
          >
            <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/90 mb-1">
              Tỉnh/Thành phố *
            </label>
            <select
              value={formData.cityId}
              onChange={handleProvinceChange}
              disabled={loadingLocation}
              className={`w-full px-3 py-2 bg-transparent border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
                errors.city ? 'border-red-500' : 'border-white/30'
              } text-white`}
            >
                <option value="" style={{ color: '#0f172a' }}>-- Chọn tỉnh/thành phố --</option>
                {provinces.map(province => (
                  <option key={province.id} value={province.id} style={{ color: '#0f172a' }}>
                    {province.name}
                  </option>
                ))}
            </select>
            {errors.city && (
              <p className="text-red-500 text-xs mt-1">{errors.city}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-white/90 mb-1">
              Quận/Huyện *
            </label>
            <select
              value={formData.districtId}
              onChange={handleDistrictChange}
              disabled={!formData.cityId || loadingLocation}
              className={`w-full px-3 py-2 bg-transparent border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
                errors.district ? 'border-red-500' : 'border-white/30'
              } text-white`}
            >
              <option value="" style={{ color: '#0f172a' }}>-- Chọn quận/huyện --</option>
              {districts.map(district => (
                <option key={district.id} value={district.id} style={{ color: '#0f172a' }}>
                  {district.name}
                </option>
              ))}
            </select>
            {errors.district && (
              <p className="text-red-500 text-xs mt-1">{errors.district}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-white/90 mb-1">
              Phường/Xã *
            </label>
            <select
              value={formData.wardCode}
              onChange={handleWardChange}
              disabled={!formData.districtId || loadingLocation}
              className={`w-full px-3 py-2 bg-transparent border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
                errors.ward ? 'border-red-500' : 'border-white/30'
              } text-white`}
            >
              <option value="" style={{ color: '#0f172a' }}>-- Chọn phường/xã --</option>
              {wards.map(ward => (
                <option key={ward.id} value={ward.id} style={{ color: '#0f172a' }}>
                  {ward.name}
                </option>
              ))}
            </select>
            {errors.ward && (
              <p className="text-red-500 text-xs mt-1">{errors.ward}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-white/90 mb-1">
              Địa chỉ cụ thể (số nhà, tên đường) *
            </label>
            <input
              type="text"
              name="street"
              value={formData.street}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-transparent border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
                errors.street ? 'border-red-500' : 'border-white/30'
              } text-white`}
              placeholder="Số 123, Đường Nguyễn Văn Linh"
            />
            {errors.street && (
              <p className="text-red-400 text-xs mt-1">{errors.street}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t border-white/6">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-white/20 rounded-lg hover:bg-white/6 transition-colors disabled:opacity-50 text-white"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-400 to-cyan-300 text-abyss-800 rounded-lg hover:shadow-md disabled:opacity-50 transition-colors"
            >
              {loading ? 'Đang lưu...' : 'Cập nhật địa chỉ'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== VNPay Payment Modal Component ====================
const VNPayPaymentModal = ({ order, paymentData, onClose, onSuccess, onError }) => {
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [countdown, setCountdown] = useState(600);
  const [isRedirecting, setIsRedirecting] = useState(false);
  
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
  
  const handleTestPayment = async () => {
    setPaymentStatus('processing');
    
    try {
      // ✅ Call API to simulate VNPay payment success using transactionId
      await orderService.simulateVNPaySuccess(paymentData.payment.transactionId);
      
      setPaymentStatus('success');
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (error) {
      console.error('Error simulating payment:', error);
      setPaymentStatus('failed');
      onError('Lỗi khi giả lập thanh toán');
    }
  };
  
  const openVNPayWindow = () => {
    if (paymentData?.paymentUrl) {
      setIsRedirecting(true);
      // ✅ Redirect toàn bộ trang thay vì mở popup
      // VNPay sẽ redirect về đúng localhost sau khi thanh toán xong
      setTimeout(() => {
        window.location.href = paymentData.paymentUrl;
      }, 500);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
      <div className="glass-card rounded-2xl max-w-md w-full shadow-2xl overflow-hidden my-auto max-h-[98vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-cyan-600 to-emerald-500 p-4 sm:p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white/10 rounded-full p-1 transition"
            disabled={paymentStatus === 'processing' || paymentStatus === 'success'}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="flex items-center justify-center mb-3">
            <div className="bg-white/10 rounded px-4 py-2">
              <span className="text-white font-bold text-xl">VNPAY</span>
            </div>
          </div>
          
          <h2 className="text-lg sm:text-xl font-bold text-center">Thanh toán VNPay</h2>
          <p className="text-white/80 text-xs sm:text-sm text-center mt-1">
            Đơn hàng: {order?.orderNumber || 'N/A'}
          </p>
        </div>

        <div className="p-4 sm:p-6">
          {paymentStatus === 'pending' && (
            <>
              <div className="bg-white/6 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 text-center">
                <p className="text-xs sm:text-sm text-white/70 mb-1">Số tiền thanh toán</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">
                  {formatCurrency(order?.totalPrice || 0)}
                </p>
              </div>
              
              <div className="bg-white/6 border-2 border-white/10 rounded-lg p-3 sm:p-6 mb-4 sm:mb-6">
                <p className="text-center text-xs sm:text-sm text-white/70 mb-3 sm:mb-4">
                  Quét mã QR để thanh toán
                </p>
                {qrCodeUrl ? (
                  <div className="flex justify-center">
                    <img 
                      src={qrCodeUrl} 
                      alt="QR Code" 
                      className="w-48 h-48 sm:w-64 sm:h-64 border border-white/10 rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-48 sm:h-64 bg-white/6 rounded-lg">
                    <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-center gap-2 mb-4 sm:mb-6 text-white/80">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-base sm:text-lg font-mono font-semibold">
                  {formatTime(countdown)}
                </span>
              </div>
              
              <div className="bg-white/6 border border-white/6 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                <p className="text-xs sm:text-sm text-white font-medium mb-2">
                  📌 Hướng dẫn thanh toán:
                </p>
                <ol className="text-xs sm:text-sm text-white/80 space-y-1 ml-4 list-decimal">
                  <li>Mở ứng dụng ngân hàng hoặc ví điện tử</li>
                  <li>Quét mã QR ở trên</li>
                  <li>Xác nhận thanh toán</li>
                  <li>Chờ xác nhận từ hệ thống</li>
                </ol>
              </div>
              
              <div className="space-y-2 sm:space-y-3">
                <button
                  onClick={openVNPayWindow}
                  disabled={isRedirecting}
                  className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-400 to-cyan-300 text-abyss-800 rounded-lg hover:shadow-md transition font-medium text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isRedirecting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Đang chuyển hướng...</span>
                    </>
                  ) : (
                    'Thanh toán ngay qua VNPay'
                  )}
                </button>
                
                <button
                  onClick={handleTestPayment}
                  disabled={isRedirecting}
                  className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition font-medium text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ✓ Test: Giả lập thanh toán thành công
                </button>
                
                <button
                  onClick={onClose}
                  disabled={isRedirecting}
                  className="w-full px-4 sm:px-6 py-2.5 sm:py-3 border border-white/20 text-white rounded-lg hover:bg-white/6 transition font-medium text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Hủy thanh toán
                </button>
              </div>
              
              <p className="text-xs text-white/70 text-center mt-3 sm:mt-4">
                Lưu ý: Bạn sẽ được chuyển đến trang thanh toán VNPay. Sau khi thanh toán xong, bạn sẽ được tự động chuyển về trang đơn hàng.
              </p>
            </>
          )}
          
          {paymentStatus === 'processing' && (
            <div className="text-center py-6 sm:py-8">
              <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-blue-600 mx-auto mb-3 sm:mb-4"></div>
              <p className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                Đang xử lý thanh toán...
              </p>
              <p className="text-xs sm:text-sm text-gray-600">
                Vui lòng đợi trong giây lát
              </p>
            </div>
          )}
          
          {paymentStatus === 'success' && (
            <div className="text-center py-6 sm:py-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg className="w-10 h-10 sm:w-12 sm:h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                Thanh toán thành công!
              </p>
              <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                Đơn hàng của bạn đã được xác nhận
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-green-800">
                  Cảm ơn bạn đã mua hàng. Chúng tôi sẽ xử lý đơn hàng của bạn ngay.
                </p>
              </div>
            </div>
          )}
          
          {paymentStatus === 'failed' && (
            <div className="text-center py-6 sm:py-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg className="w-10 h-10 sm:w-12 sm:h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                Thanh toán thất bại
              </p>
              <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                Vui lòng thử lại hoặc chọn phương thức thanh toán khác
              </p>
              <button
                onClick={onClose}
                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium text-sm sm:text-base"
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
  
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showVNPayModal, setShowVNPayModal] = useState(false);
  const [vnpayData, setVnpayData] = useState(null);
  const [showEditAddressModal, setShowEditAddressModal] = useState(false);
  
  // Coupon state - updated for multiple coupons
  const [selectedCoupons, setSelectedCoupons] = useState([]);
  const [isValidatingCoupons, setIsValidatingCoupons] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    dispatch(fetchCart());

    // ✅ Kiểm tra query params nếu redirect từ VNPay
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');
    
    if (paymentStatus === 'failed') {
      toast.error('Thanh toán thất bại hoặc đã bị hủy. Vui lòng thử lại.');
      // Xóa query params
      window.history.replaceState({}, '', '/checkout');
    }
  }, [user, dispatch, navigate]);

  useEffect(() => {
    const loadPreview = async () => {
      try {
        if (selectedCoupons.length > 0) {
          const promotionCodes = selectedCoupons.map(c => c.code);
          const res = await orderService.previewOrder(null, promotionCodes);
          setPreview(res);
        } else {
          const res = await orderService.previewOrder();
          setPreview(res);
        }
      } catch (e) {
        console.error('Preview error:', e);
        setPreview(null);
      }
    };
    loadPreview();
  }, [selectedCoupons]);

  // Handle multiple coupons selection
  const handleCouponsChange = (coupons) => {
    setSelectedCoupons(coupons);
  };

  // Handle address update
  const handleAddressUpdate = (updatedUser) => {
    // Update Redux store with new user data
    dispatch(setUser(updatedUser));
    setShowEditAddressModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ Kiểm tra thông tin cá nhân
    if (!user?.fullName && !user?.username) {
      await Swal.fire({
        icon: 'warning',
        title: 'Thiếu thông tin!',
        html: `
          <p class="text-gray-600 mb-3">Bạn chưa cập nhật họ tên.</p>
          <p class="text-sm text-gray-500">Vui lòng cập nhật trong <strong>Thông tin cá nhân</strong> để tiếp tục đặt hàng.</p>
        `,
        confirmButtonText: 'Cập nhật ngay',
        confirmButtonColor: 'rgb(var(--primary))',
        showCancelButton: true,
        cancelButtonText: 'Đóng',
        cancelButtonColor: '#6B7280'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/profile');
        }
      });
      return;
    }

    if (!user?.phone) {
      await Swal.fire({
        icon: 'warning',
        title: 'Thiếu thông tin!',
        html: `
          <p class="text-gray-600 mb-3">Bạn chưa cập nhật số điện thoại.</p>
          <p class="text-sm text-gray-500">Vui lòng cập nhật trong <strong>Thông tin cá nhân</strong> để tiếp tục đặt hàng.</p>
        `,
        confirmButtonText: 'Cập nhật ngay',
        confirmButtonColor: 'rgb(var(--primary))',
        showCancelButton: true,
        cancelButtonText: 'Đóng',
        cancelButtonColor: '#6B7280'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/profile');
        }
      });
      return;
    }

    // ✅ Kiểm tra địa chỉ giao hàng
    if (!user?.address) {
      await Swal.fire({
        icon: 'warning',
        title: 'Chưa có địa chỉ giao hàng!',
        html: `
          <p class="text-gray-600 mb-3">Bạn chưa cập nhật địa chỉ giao hàng.</p>
          <p class="text-sm text-gray-500">Vui lòng cập nhật <strong>Địa chỉ giao hàng</strong> trong trang Thông tin cá nhân để tiếp tục.</p>
        `,
        confirmButtonText: 'Cập nhật ngay',
        confirmButtonColor: 'rgb(var(--primary))',
        showCancelButton: true,
        cancelButtonText: 'Đóng',
        cancelButtonColor: '#6B7280'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/profile');
        }
      });
      return;
    }

    const addr = user.address;
    if (!addr.street || !addr.ward || !addr.district || !addr.city) {
      await Swal.fire({
        icon: 'warning',
        title: 'Địa chỉ chưa đầy đủ!',
        html: `
          <p class="text-gray-600 mb-3">Địa chỉ giao hàng của bạn chưa đầy đủ thông tin.</p>
          <div class="text-left bg-amber-50 rounded p-3 mb-3">
            <p class="text-sm font-medium text-amber-800 mb-2">Thông tin còn thiếu:</p>
            <ul class="text-sm text-amber-700 space-y-1 ml-4 list-disc">
              ${!addr.street ? '<li>Địa chỉ chi tiết (số nhà, tên đường)</li>' : ''}
              ${!addr.ward ? '<li>Phường/Xã</li>' : ''}
              ${!addr.district ? '<li>Quận/Huyện</li>' : ''}
              ${!addr.city ? '<li>Tỉnh/Thành phố</li>' : ''}
            </ul>
          </div>
          <p class="text-sm text-gray-500">Vui lòng cập nhật đầy đủ thông tin trong trang Thông tin cá nhân.</p>
        `,
        confirmButtonText: 'Cập nhật ngay',
        confirmButtonColor: 'rgb(var(--primary))',
        showCancelButton: true,
        cancelButtonText: 'Đóng',
        cancelButtonColor: '#6B7280'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/profile');
        }
      });
      return;
    }
    
    setShowConfirmModal(true);
  };

  const handleConfirmOrder = async () => {
    setSubmitting(true);
    setError(null);
    
    try {
      const addr = user.address;
      const orderData = {
        shippingAddress: {
          fullName: user.fullName || user.username,
          phone: user.phone || '',
          street: addr.street,
          ward: addr.ward,
          district: addr.district,
          city: addr.city,
          country: addr.country || 'Việt Nam',
          postalCode: addr.postalCode || ''
        },
        paymentMethod: paymentMethod === 'VNPAY' ? 'VNPAY' : 'COD',
        promotionCodes: selectedCoupons.map(c => c.code),
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
        // Clear selected coupons after successful order
        setSelectedCoupons([]);
        
        // ✅ Hiển thị SweetAlert2 thông báo thành công
        await Swal.fire({
          icon: 'success',
          title: '🎉 Chúc mừng!',
          text: 'Bạn đã đặt hàng thành công! Cảm ơn bạn đã mua hàng.',
          confirmButtonText: 'Xem đơn hàng',
          confirmButtonColor: 'rgb(var(--natural-green))',
          showCancelButton: true,
          cancelButtonText: 'Tiếp tục mua sắm',
          cancelButtonColor: '#6B7280'
        }).then((result) => {
          if (result.isConfirmed) {
            navigate('/orders');
          } else {
            navigate('/shop');
          }
        });
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
    // ✅ Chỉ reset cart sau khi thanh toán thành công
    await dispatch(resetCart());
    toast.success('Thanh toán thành công!');
    setShowVNPayModal(false);
    navigate('/orders');
  };

  const handleVNPayError = (error) => {
    // ⚠️ KHÔNG reset cart khi lỗi - giữ nguyên để user thử lại
    toast.error(error);
    setShowVNPayModal(false);
    // Reload cart để đảm bảo dữ liệu chính xác
    dispatch(fetchCart());
  };

  const handleVNPayCancel = () => {
    // ⚠️ KHÔNG reset cart khi user hủy - giữ nguyên
    setShowVNPayModal(false);
    setVnpayData(null);
    toast.info('Bạn đã hủy thanh toán thành công');
    // Reload cart để đảm bảo dữ liệu chính xác
    dispatch(fetchCart());
  };

  const items = cart?.items || [];
  
  // Calculate discount for multiple coupons
  const hasCoupons = selectedCoupons.length > 0;
  
  const displayTotals = preview ? {
    subtotal: preview.subtotal,
    shippingFee: preview.shippingFee,
    discount: preview.discount, // Already includes coupon discount if promotionCodes was sent
    hasCoupons: hasCoupons,
    selectedCoupons: selectedCoupons,
    total: preview.totalPrice,
  } : {
    subtotal: summary.subtotal,
    shippingFee: calculateShippingFee(summary.subtotal), // Bậc thang: 14%, 8%, 5%, 3%, 1.8%
    discount: 0,
    hasCoupons: hasCoupons,
    selectedCoupons: selectedCoupons,
    total: summary.total,
  };

  // ✅ Format địa chỉ sử dụng user thay vì userProfile
  const formatAddress = () => {
    if (!user?.address) return 'Chưa có địa chỉ';
    const addr = user.address;
    const parts = [addr.street, addr.ward, addr.district, addr.city, addr.country].filter(Boolean);
    return parts.join(', ') || 'Chưa có địa chỉ';
  };

  return (
    <div className="checkout-page min-h-screen bg-gradient-to-b from-[#021717] via-[#042a2a] to-[#062f2f] text-white">
      <div className="bg-transparent border-b border-white/6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Xác nhận đơn hàng</h1>
            <p className="text-white/70 mt-1">Xác nhận thông tin đơn hàng, thông tin cá nhân và đặt hàng</p>
          </div>
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
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Thông tin cá nhân</h2>
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-white/80">Họ và tên:</span>
                  <span className="font-medium text-white">{user.fullName || user.username}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-white/80">Email:</span>
                  <span className="font-medium text-white">{user.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-white/80">Số điện thoại:</span>
                  <span className="font-medium text-white">{user.phone || 'Chưa cập nhật'}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              </div>
            )}
          </div>

          {/* Địa chỉ giao hàng */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Địa chỉ giao hàng</h2>
              <button
                onClick={() => setShowEditAddressModal(true)}
                className="text-sm text-cyan-200 hover:text-white font-medium flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Chỉnh sửa
              </button>
            </div>
            
            {user?.address ? (
              <div className="bg-white/4 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-white/60 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{formatAddress()}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800">
                  Bạn chưa cập nhật địa chỉ. Vui lòng nhấn nút "Chỉnh sửa" ở trên để thêm địa chỉ giao hàng.
                </p>
              </div>
            )}
          </div>

          {/* Mã giảm giá */}
          <CouponDropdown
            selectedCoupons={selectedCoupons}
            onCouponsChange={handleCouponsChange}
            isValidating={isValidatingCoupons}
            cartTotal={summary.subtotal || 0}
          />

          {/* Payment Method */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Phương thức thanh toán</h2>
            <div className="space-y-3">
              <div className="flex items-center p-3 border border-white/10 rounded-lg hover:bg-white/4 cursor-pointer">
                <input 
                  id="cod" 
                  type="radio" 
                  name="payment" 
                  value="COD" 
                  checked={paymentMethod === 'COD'} 
                  onChange={() => setPaymentMethod('COD')} 
                  className="h-4 w-4 text-cyan-300 focus:ring-cyan-300 border-white/30"
                />
                <label htmlFor="cod" className="ml-3 block text-sm text-white cursor-pointer flex-1">
                  <span className="font-medium">Thanh toán khi nhận hàng (COD)</span>
                  <p className="text-xs text-white/70 mt-1">Thanh toán bằng tiền mặt khi nhận hàng</p>
                </label>
              </div>
              <div className="flex items-center p-3 border border-white/10 rounded-lg hover:bg-white/4 cursor-pointer">
                <input 
                  id="vnpay" 
                  type="radio" 
                  name="payment" 
                  value="VNPAY" 
                  checked={paymentMethod === 'VNPAY'} 
                  onChange={() => setPaymentMethod('VNPAY')} 
                  className="h-4 w-4 text-cyan-300 focus:ring-cyan-300 border-white/30"
                />
                <label htmlFor="vnpay" className="ml-3 block text-sm text-white cursor-pointer flex-1">
                  <span className="font-medium">Thanh toán qua VNPay</span>
                  <p className="text-xs text-white/70 mt-1">Thanh toán trực tuyến qua VNPay</p>
                </label>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <button
              onClick={() => navigate('/shop')}
              className="px-6 py-3 text-white bg-gradient-to-r from-emerald-400 to-cyan-300 rounded-lg hover:from-emerald-500 hover:to-cyan-400 transition font-medium shadow-sm flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Tiếp tục mua sắm
            </button>
            
              <div className="relative group">
              <button 
                onClick={handleSubmit}
                disabled={submitting || items.length === 0 || !user?.address} 
                className="w-full sm:w-auto px-6 py-3 text-abyss-800 bg-gradient-to-r from-emerald-400 to-cyan-300 rounded-lg hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm transition-all"
              >
                {submitting ? 'Đang tạo đơn hàng...' : 'Đặt hàng'}
              </button>
              
              {/* ✅ Tooltip khi button bị disabled */}
              {(items.length === 0 || !user?.address) && !submitting && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                  {items.length === 0 
                    ? 'Giỏ hàng trống' 
                    : 'Vui lòng cập nhật địa chỉ giao hàng'}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                    <div className="border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary Section */}
        <div className="glass-card p-6 h-fit">
          <h2 className="text-lg font-semibold text-white mb-4">Tóm tắt đơn hàng</h2>
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
              <ul className="divide-y divide-white/6 max-h-64 overflow-y-auto">
                {items.map((it) => {
                  // Get price - use variant price if available
                  let price = it.productId?.salePrice || it.productId?.price;
                  if (it.selectedVariant && it.selectedVariant.price) {
                    price = it.selectedVariant.price;
                  } else if (it.productId?.hasVariants && it.variantId) {
                    const variant = it.productId.variants?.find(v => v._id === it.variantId);
                    if (variant) {
                      price = variant.price;
                    }
                  }
                  
                  const itemTotal = (price || 0) * it.quantity;
                  
                  return (
                    <li key={it._id} className="py-3 flex items-center gap-3">
                      <img 
                        src={it.productId?.images?.[0] || '/placeholder-product.jpg'} 
                        alt={it.productId?.name} 
                        className="w-12 h-12 rounded object-cover border flex-shrink-0"
                        onError={(e) => {
                          e.target.src = '/placeholder-product.jpg';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white line-clamp-2">{it.productId?.name}</div>
                        
                        {/* Display selected variant options */}
                        {it.selectedVariant && it.selectedVariant.optionValues && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {Object.entries(it.selectedVariant.optionValues).map(([key, value]) => (
                              <span 
                                key={key} 
                                className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {key}: {value}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        <div className="text-xs text-white/70">x{it.quantity}</div>
                      </div>
                      <div className="text-sm font-semibold text-white flex-shrink-0">
                        {formatCurrency(itemTotal)}
                      </div>
                    </li>
                  );
                })}
              </ul>
              <div className="space-y-2 text-sm pt-4 border-t">
                <div className="flex justify-between">
                  <span className="text-white/70">Tạm tính</span>
                  <span className="font-medium text-white">{formatCurrency(displayTotals.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Phí vận chuyển</span>
                  <span className="font-medium text-white">
                    {displayTotals.shippingFee === 0 ? <span className="text-emerald-300">Miễn phí</span> : formatCurrency(displayTotals.shippingFee)}
                  </span>
                </div>
                
                {/* Display individual coupon discounts */}
                {displayTotals.discount > 0 && (
                  <>
                    {preview?.promotion?.promotions && preview.promotion.promotions.length > 0 ? (
                      <>
                        {preview.promotion.promotions.map((promo, index) => (
                          <div key={index} className="flex justify-between">
                            <span className="text-gray-600 flex items-center gap-1">
                              <svg className="w-4 h-4 text-ocean dark:text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                              </svg>
                              <span className="text-xs">
                                {promo.discountType === 'FREE_SHIPPING' ? 'Miễn phí ship' : 
                                 promo.discountType === 'PERCENTAGE' ? `Giảm ${promo.discountValue}%` : 
                                 `Giảm ${formatCurrency(promo.discountValue)}`}
                                {' '}({promo.code})
                              </span>
                            </span>
                            <span className="font-semibold text-green-600 text-sm">-{formatCurrency(promo.discountAmount)}</span>
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="flex justify-between">
                        <span className="text-gray-600 flex items-center gap-1">
                          {displayTotals.hasCoupons && (
                            <svg className="w-4 h-4 text-ocean dark:text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                          )}
                          Giảm giá
                          {displayTotals.selectedCoupons?.length > 0 && (
                            <span className="text-xs">({displayTotals.selectedCoupons.length} mã)</span>
                          )}
                        </span>
                        <span className="font-semibold text-green-600">-{formatCurrency(displayTotals.discount)}</span>
                      </div>
                    )}
                  </>
                )}
                
                <div className="pt-3 mt-3 border-t flex justify-between text-base">
                  <span className="font-semibold text-white">Tổng cộng</span>
                  <span className="font-bold text-emerald-300 text-lg">{formatCurrency(displayTotals.total)}</span>
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
                <span className="text-gray-600">Tạm tính:</span>
                <span className="font-medium text-gray-900">{formatCurrency(displayTotals.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Phí vận chuyển:</span>
                <span className="font-medium text-gray-900">
                  {displayTotals.shippingFee === 0 ? 'Miễn phí' : formatCurrency(displayTotals.shippingFee)}
                </span>
              </div>
              {displayTotals.discount > 0 && (
                <>
                  {preview?.promotion?.promotions && preview.promotion.promotions.length > 0 ? (
                    <>
                      {preview.promotion.promotions.map((promo, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {promo.discountType === 'FREE_SHIPPING' ? 'Miễn phí ship' : 'Giảm giá'} ({promo.code}):
                          </span>
                          <span className="font-semibold text-green-600">-{formatCurrency(promo.discountAmount)}</span>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Giảm giá:</span>
                      <span className="font-semibold text-green-600">-{formatCurrency(displayTotals.discount)}</span>
                    </div>
                  )}
                </>
              )}
              <div className="pt-3 border-t flex justify-between">
                <span className="font-semibold text-gray-900">Tổng tiền:</span>
                <span className="font-bold text-primary-600 text-lg">{formatCurrency(displayTotals.total)}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t">
                <span className="text-gray-600">Phương thức:</span>
                <span className="font-medium text-gray-900">{paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : 'VNPay'}</span>
              </div>
              <div className="text-sm pt-2 border-t">
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
          onClose={handleVNPayCancel}
          onSuccess={handleVNPaySuccess}
          onError={handleVNPayError}
        />
      )}

      {/* Edit Address Modal */}
      <EditAddressModal
        isOpen={showEditAddressModal}
        onClose={() => setShowEditAddressModal(false)}
        currentAddress={user?.address}
        onSuccess={handleAddressUpdate}
      />
    </div>
  );
};

export default Checkout;
