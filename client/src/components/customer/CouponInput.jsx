import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { validateCoupon, clearAppliedPromotions } from '../../redux/slices/promotionSlice';
import { FaTag, FaTimes, FaCheck } from 'react-icons/fa';
import { toast } from 'react-toastify';

const CouponInput = ({ cart }) => {
  const dispatch = useDispatch();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Vui lòng nhập mã giảm giá');
      return;
    }

    setIsValidating(true);
    try {
      const result = await dispatch(validateCoupon({ 
        code: couponCode.trim().toUpperCase(), 
        cart 
      })).unwrap();
      
      setAppliedCoupon({
        code: couponCode.trim().toUpperCase(),
        discount: result.data.discount
      });
      toast.success(`Áp dụng mã giảm giá thành công! Giảm ${formatCurrency(result.data.discount)}`);
    } catch (error) {
      toast.error(error || 'Mã giảm giá không hợp lệ');
      setAppliedCoupon(null);
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveCoupon = () => {
    dispatch(clearAppliedPromotions());
    setAppliedCoupon(null);
    setCouponCode('');
    toast.info('Đã xóa mã giảm giá');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-4 rounded-lg border-2 border-dashed border-pink-200">
      <div className="flex items-center gap-2 mb-3">
        <FaTag className="text-pink-600" />
        <h3 className="font-semibold text-gray-800">Mã giảm giá</h3>
      </div>

      {appliedCoupon ? (
        // Applied Coupon Display
        <div className="flex items-center justify-between bg-white p-4 rounded-lg border-2 border-green-500 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <FaCheck className="text-green-600 text-lg" />
            </div>
            <div>
              <div className="font-bold text-gray-800">{appliedCoupon.code}</div>
              <div className="text-sm text-green-600">Giảm {formatCurrency(appliedCoupon.discount)}</div>
            </div>
          </div>
          <button
            onClick={handleRemoveCoupon}
            className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition-colors"
            title="Xóa mã"
          >
            <FaTimes />
          </button>
        </div>
      ) : (
        // Coupon Input
        <div className="flex gap-2">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
            placeholder="Nhập mã giảm giá"
            className="flex-1 border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent font-mono uppercase"
            disabled={isValidating}
          />
          <button
            onClick={handleApplyCoupon}
            disabled={isValidating || !couponCode.trim()}
            className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isValidating ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Áp dụng'
            )}
          </button>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-2">
        💡 Nhập mã giảm giá để nhận ưu đãi đặc biệt
      </p>
    </div>
  );
};

export default CouponInput;
