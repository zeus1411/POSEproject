import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const formatCurrency = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v || 0);

const CouponDropdown = ({ 
  selectedCoupons = [], 
  onCouponsChange,
  isValidating = false,
  cartTotal = 0 // Add cartTotal prop to check eligibility
}) => {
  const [availableCoupons, setAvailableCoupons] = useState({ freeShipping: [], discount: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [eligibilityStatus, setEligibilityStatus] = useState({}); // Track eligibility for each coupon

  // Load available coupons and check eligibility
  useEffect(() => {
    const loadCoupons = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.get('/promotions/coupons/active');
        const coupons = response.data.data || { freeShipping: [], discount: [] };
        setAvailableCoupons(coupons);
        
        // Check eligibility for each coupon if we have cartTotal
        if (cartTotal > 0) {
          const allCoupons = [...coupons.freeShipping, ...coupons.discount];
          const eligibilityChecks = {};
          
          for (const coupon of allCoupons) {
            try {
              const eligRes = await api.post('/promotions/check-eligibility', {
                code: coupon.code,
                cartTotal
              });
              eligibilityChecks[coupon.code] = eligRes.data.data;
            } catch (err) {
              console.error(`Error checking eligibility for ${coupon.code}:`, err);
              eligibilityChecks[coupon.code] = { eligible: false, reason: 'Lỗi kiểm tra' };
            }
          }
          
          setEligibilityStatus(eligibilityChecks);
        }
      } catch (err) {
        console.error('Error loading coupons:', err);
        setError('Không thể tải danh sách mã giảm giá');
      } finally {
        setLoading(false);
      }
    };

    loadCoupons();
  }, [cartTotal]); // Re-check when cart total changes

  const handleCouponToggle = (coupon) => {
    const isSelected = selectedCoupons.some(c => c.code === coupon.code);
    
    if (isSelected) {
      // Remove coupon
      const updated = selectedCoupons.filter(c => c.code !== coupon.code);
      onCouponsChange(updated);
    } else {
      // Check if we can add this coupon type
      const isFreeShipping = coupon.discountType === 'FREE_SHIPPING';
      const hasConflictingType = selectedCoupons.some(c => {
        if (isFreeShipping) {
          return c.discountType === 'FREE_SHIPPING';
        } else {
          return c.discountType !== 'FREE_SHIPPING';
        }
      });

      if (hasConflictingType) {
        if (isFreeShipping) {
          toast.warning('Chỉ có thể chọn một mã miễn phí vận chuyển');
        } else {
          toast.warning('Chỉ có thể chọn một mã giảm giá');
        }
        return;
      }

      // Check max 2 coupons
      if (selectedCoupons.length >= 2) {
        toast.warning('Chỉ có thể chọn tối đa 2 mã (1 Free ship + 1 Giảm giá)');
        return;
      }

      // Add coupon
      const updated = [...selectedCoupons, coupon];
      onCouponsChange(updated);
    }
  };

  const CouponItem = ({ coupon, isSelected }) => {
    const eligibility = eligibilityStatus[coupon.code];
    const isEligible = eligibility?.eligible !== false;
    const eligibilityReason = eligibility?.reason;

    const getDiscountDisplay = () => {
      if (coupon.discountType === 'FREE_SHIPPING') {
        return 'Miễn phí vận chuyển';
      } else if (coupon.discountType === 'PERCENTAGE') {
        let text = `Giảm ${coupon.discountValue}%`;
        if (coupon.conditions?.maxDiscount) {
          text += ` (Tối đa ${formatCurrency(coupon.conditions.maxDiscount)})`;
        }
        return text;
      } else {
        return `Giảm ${formatCurrency(coupon.discountValue)}`;
      }
    };

    const getConditionDisplay = () => {
      if (coupon.conditions?.minOrderValue) {
        return `Đơn tối thiểu ${formatCurrency(coupon.conditions.minOrderValue)}`;
      }
      return '';
    };

    return (
      <div
        onClick={() => isEligible && handleCouponToggle(coupon)}
        className={`p-3 border rounded-lg transition-all ${
          !isEligible 
            ? 'opacity-60 cursor-not-allowed bg-gray-50 border-gray-300' 
            : isSelected 
              ? 'border-pink-500 bg-pink-50 cursor-pointer hover:shadow-md' 
              : 'border-gray-200 hover:border-gray-300 cursor-pointer hover:shadow-md'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                !isEligible 
                  ? 'border-gray-400 bg-gray-200'
                  : isSelected 
                    ? 'border-pink-500 bg-pink-500' 
                    : 'border-gray-300'
              }`}>
                {isSelected && isEligible && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {!isEligible && (
                  <svg className="w-3 h-3 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div>
                <div className={`font-semibold ${isEligible ? 'text-gray-900' : 'text-gray-500'}`}>
                  {coupon.code}
                </div>
                {coupon.description && (
                  <div className="text-xs text-gray-600 mt-0.5">{coupon.description}</div>
                )}
                {!isEligible && eligibilityReason && (
                  <div className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {eligibilityReason}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="text-right ml-3">
            <div className={`font-semibold text-sm ${isEligible ? 'text-pink-600' : 'text-gray-500'}`}>
              {getDiscountDisplay()}
            </div>
            {getConditionDisplay() && (
              <div className={`text-xs mt-0.5 ${isEligible ? 'text-orange-600' : 'text-gray-500'}`}>
                {getConditionDisplay()}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <h2 className="text-lg font-semibold text-gray-900">Mã giảm giá</h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
          <span className="ml-3 text-gray-600">Đang tải mã giảm giá...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <h2 className="text-lg font-semibold text-gray-900">Mã giảm giá</h2>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const selectedCount = selectedCoupons.length;
  const displayText = selectedCount === 0 
    ? 'Chọn mã giảm giá' 
    : `${selectedCount} mã đã chọn`;

  const totalCoupons = availableCoupons.freeShipping.length + availableCoupons.discount.length;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
        <h2 className="text-lg font-semibold text-gray-900">Mã giảm giá</h2>
        <span className="text-xs text-gray-500">(Không bắt buộc)</span>
      </div>

      {totalCoupons === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-sm">Hiện tại không có mã giảm giá nào khả dụng</p>
        </div>
      ) : (
        <>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              disabled={isValidating}
              className="w-full flex items-center justify-between p-3 border-2 border-gray-300 rounded-lg bg-white hover:border-pink-400 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className={selectedCount > 0 ? 'font-semibold text-gray-900' : 'text-gray-500'}>
                {displayText}
              </span>
              <svg 
                className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-96 overflow-y-auto">
                {/* Free Shipping Section */}
                {availableCoupons.freeShipping.length > 0 && (
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      Miễn phí vận chuyển
                    </h3>
                    <div className="space-y-2">
                      {availableCoupons.freeShipping.map(coupon => (
                        <CouponItem
                          key={coupon._id}
                          coupon={coupon}
                          isSelected={selectedCoupons.some(c => c.code === coupon.code)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Discount Section */}
                {availableCoupons.discount.length > 0 && (
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                      Giảm giá đơn hàng
                    </h3>
                    <div className="space-y-2">
                      {availableCoupons.discount.map(coupon => (
                        <CouponItem
                          key={coupon._id}
                          coupon={coupon}
                          isSelected={selectedCoupons.some(c => c.code === coupon.code)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Selected Coupons Display */}
          {selectedCount > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-gray-700">Mã đã chọn:</p>
              <div className="flex flex-wrap gap-2">
                {selectedCoupons.map(coupon => (
                  <div 
                    key={coupon.code}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-100 to-purple-100 text-pink-800 px-3 py-1 rounded-full text-sm font-medium border border-pink-200"
                  >
                    <span>{coupon.code}</span>
                    <button
                      type="button"
                      onClick={() => handleCouponToggle(coupon)}
                      className="text-pink-600 hover:text-pink-800 ml-1"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800 flex items-start gap-2">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>
                Bạn có thể chọn <strong>một mã miễn phí vận chuyển</strong> và <strong>một mã giảm giá đơn hàng</strong> cùng lúc để tối ưu hóa ưu đãi.
              </span>
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default CouponDropdown;
