import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAvailablePromotions } from '../../redux/slices/promotionSlice';
import { FaPercent, FaShippingFast, FaGift, FaTag } from 'react-icons/fa';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const PromotionBanner = () => {
  const dispatch = useDispatch();
  const { availablePromotions } = useSelector(state => state.promotions);

  useEffect(() => {
    dispatch(getAvailablePromotions());
  }, [dispatch]);

  const getPromotionIcon = (discountType) => {
    switch(discountType) {
      case 'PERCENTAGE':
      case 'FIXED_AMOUNT':
        return <FaPercent className="text-white text-2xl" />;
      case 'FREE_SHIPPING':
        return <FaShippingFast className="text-white text-2xl" />;
      case 'BUY_X_GET_Y':
        return <FaGift className="text-white text-2xl" />;
      default:
        return <FaTag className="text-white text-2xl" />;
    }
  };

  const getPromotionGradient = (promotionType) => {
    switch(promotionType) {
      case 'PRODUCT_DISCOUNT':
        return 'from-purple-500 to-pink-500';
      case 'ORDER_DISCOUNT':
        return 'from-blue-500 to-cyan-500';
      case 'CONDITIONAL_DISCOUNT':
        return 'from-orange-500 to-red-500';
      case 'COUPON':
        return 'from-green-500 to-teal-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getDiscountDisplay = (promotion) => {
    if (promotion.discountType === 'PERCENTAGE') {
      return `Giảm ${promotion.discountValue}%`;
    } else if (promotion.discountType === 'FIXED_AMOUNT') {
      return `Giảm ${formatCurrency(promotion.discountValue)}`;
    } else if (promotion.discountType === 'FREE_SHIPPING') {
      return 'Miễn phí vận chuyển';
    } else {
      return `Mua ${promotion.conditions?.buyQuantity} tặng ${promotion.conditions?.getQuantity}`;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  if (!availablePromotions || availablePromotions.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
      <div className="bg-gradient-to-r from-pink-600 to-purple-600 px-4 py-2 flex items-center gap-2">
        <FaTag className="text-white text-lg animate-pulse" />
        <h2 className="text-white font-bold text-lg">🎉 Ưu đãi đặc biệt</h2>
      </div>

      <Swiper
        modules={[Autoplay, Pagination]}
        spaceBetween={0}
        slidesPerView={1}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        className="promotion-swiper"
      >
        {availablePromotions.map((promotion) => (
          <SwiperSlide key={promotion._id}>
            <div className={`bg-gradient-to-r ${getPromotionGradient(promotion.promotionType)} p-6 flex items-center gap-6`}>
              {/* Icon */}
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                {getPromotionIcon(promotion.discountType)}
              </div>

              {/* Content */}
              <div className="flex-1 text-white">
                <h3 className="text-xl font-bold mb-1">{promotion.name}</h3>
                <p className="text-white/90 text-sm mb-2">{promotion.description || getDiscountDisplay(promotion)}</p>
                
                {/* Details */}
                <div className="flex flex-wrap gap-4 text-xs">
                  {promotion.code && (
                    <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                      <FaTag className="text-yellow-300" />
                      <span className="font-mono font-bold">{promotion.code}</span>
                    </div>
                  )}
                  {promotion.conditions?.minOrderValue && (
                    <div className="flex items-center gap-1">
                      <span>Đơn tối thiểu:</span>
                      <span className="font-bold">{formatCurrency(promotion.conditions.minOrderValue)}</span>
                    </div>
                  )}
                  {promotion.endDate && (
                    <div className="flex items-center gap-1">
                      <span>Hết hạn:</span>
                      <span className="font-bold">{new Date(promotion.endDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Badge */}
              <div className="hidden md:flex items-center justify-center">
                <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-lg border-2 border-white/40">
                  <div className="text-3xl font-black text-white drop-shadow-lg">
                    {promotion.discountType === 'PERCENTAGE' 
                      ? `${promotion.discountValue}%` 
                      : promotion.discountType === 'FREE_SHIPPING'
                      ? 'FREE'
                      : '🎁'}
                  </div>
                  <div className="text-xs text-white/80 text-center mt-1">GIẢM GIÁ</div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <style jsx>{`
        .promotion-swiper {
          --swiper-pagination-color: #ec4899;
          --swiper-pagination-bullet-inactive-color: #cbd5e1;
          padding-bottom: 40px;
        }
      `}</style>
    </div>
  );
};

export default PromotionBanner;
