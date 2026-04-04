import React, { useEffect, useState } from 'react';
import { FiGift, FiX, FiPercent, FiTruck } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { markPromotionAsViewed } from '../../services/promotionService';

/**
 * PromotionToast - Pop-up thông báo promotion góc dưới trái màn hình
 * @param {Object} promotion - Thông tin promotion mới
 * @param {Function} onClose - Callback khi đóng toast
 */
const PromotionToast = ({ promotion, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Animation vào
    const timer = setTimeout(() => setIsVisible(true), 100);
    
    // Tự động đóng sau 10 giây
    const autoCloseTimer = setTimeout(() => {
      handleClose();
    }, 10000);

    return () => {
      clearTimeout(timer);
      clearTimeout(autoCloseTimer);
    };
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      
      // 🎁 Mark promotion as viewed khi đóng toast
      if (promotion?._id) {
        markPromotionAsViewed(promotion._id)
          .then(() => console.log('✅ Marked promotion as viewed:', promotion._id))
          .catch(err => console.error('❌ Error marking promotion as viewed:', err));
      }
      
      onClose();
    }, 300);
  };

  const handleClick = () => {
    navigate('/shop');
    handleClose();
  };

  const getDiscountText = () => {
    if (promotion.discountType === 'PERCENTAGE') {
      return `${promotion.discountValue}%`;
    } else if (promotion.discountType === 'FIXED') {
      return `${promotion.discountValue.toLocaleString('vi-VN')}đ`;
    } else if (promotion.discountType === 'FREE_SHIPPING') {
      return 'Miễn phí ship';
    }
    return '';
  };

  const getIcon = () => {
    if (promotion.discountType === 'FREE_SHIPPING') {
      return <FiTruck className="w-8 h-8 text-white" />;
    } else if (promotion.discountType === 'PERCENTAGE') {
      return <FiPercent className="w-8 h-8 text-white" />;
    }
    return <FiGift className="w-8 h-8 text-white" />;
  };

  if (!promotion) return null;

  return (
    <div
      className={`fixed bottom-6 left-6 z-[9999] transition-all duration-300 ease-out ${
        isVisible && !isExiting
          ? 'translate-y-0 opacity-100'
          : 'translate-y-full opacity-0'
      }`}
      style={{ width: '360px' }}
    >
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header với gradient - Compact hơn */}
        <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 px-4 py-3 relative">
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <FiX className="w-4 h-4 text-white" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              {getIcon()}
            </div>
            <div className="flex-1 text-white pr-6">
              <p className="text-xs font-semibold uppercase tracking-wider opacity-90">
                🎉 Khuyến mãi mới
              </p>
              <h3 className="text-base font-bold mt-0.5 line-clamp-1">
                {promotion.name}
              </h3>
            </div>
          </div>
        </div>

        {/* Body - Gọn gàng hơn */}
        <div className="p-4">
          {/* Description */}
          {promotion.description && (
            <p className="text-sm text-gray-700 mb-3 line-clamp-2 text-center">
              {promotion.description}
            </p>
          )}

          {/* Info Grid - Horizontal layout cho cân đối */}
          {(promotion.minOrderValue > 0 || promotion.endDate) && (
            <div className="flex gap-2 mb-3">
              {promotion.minOrderValue > 0 && (
                <div className="flex-1 p-2.5 bg-blue-50 rounded-lg border border-blue-200 text-center">
                  <p className="text-xs text-blue-600 font-medium mb-0.5">Đơn tối thiểu</p>
                  <p className="text-sm text-blue-800 font-bold">{promotion.minOrderValue.toLocaleString('vi-VN')}đ</p>
                </div>
              )}
              {promotion.endDate && (
                <div className="flex-1 p-2.5 bg-orange-50 rounded-lg border border-orange-200 text-center">
                  <p className="text-xs text-orange-600 font-medium mb-0.5">Hết hạn</p>
                  <p className="text-sm text-orange-800 font-bold">
                    {new Date(promotion.endDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* CTA Button */}
          <button
            onClick={handleClick}
            className="w-full py-2.5 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white text-sm font-bold rounded-lg shadow-lg transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
          >
            🛍️ Mua sắm ngay
          </button>
        </div>

        {/* Progress bar - Mỏng hơn */}
        <div className="h-1 bg-gray-200 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500"
            style={{
              animation: 'progressBar 10s linear forwards'
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes progressBar {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default PromotionToast;
