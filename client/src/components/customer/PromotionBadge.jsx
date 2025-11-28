import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { getPromotionsForProduct } from '../../redux/slices/promotionSlice';
import { FaPercent, FaFire } from 'react-icons/fa';

const PromotionBadge = ({ productId, className = '' }) => {
  const dispatch = useDispatch();
  const [promotions, setPromotions] = useState([]);

  useEffect(() => {
    if (productId) {
      dispatch(getPromotionsForProduct(productId))
        .unwrap()
        .then((data) => setPromotions(data))
        .catch(() => setPromotions([]));
    }
  }, [productId, dispatch]);

  if (!promotions || promotions.length === 0) {
    return null;
  }

  // Get the best promotion (highest discount)
  const bestPromotion = promotions.reduce((best, current) => {
    const currentValue = current.discountType === 'PERCENTAGE' 
      ? current.discountValue 
      : current.discountValue / 1000; // Convert VND to comparable value
    const bestValue = best.discountType === 'PERCENTAGE' 
      ? best.discountValue 
      : best.discountValue / 1000;
    
    return currentValue > bestValue ? current : best;
  }, promotions[0]);

  const getDiscountText = () => {
    if (bestPromotion.discountType === 'PERCENTAGE') {
      return `-${bestPromotion.discountValue}%`;
    } else if (bestPromotion.discountType === 'FIXED_AMOUNT') {
      return `-${Math.floor(bestPromotion.discountValue / 1000)}K`;
    } else if (bestPromotion.discountType === 'FREE_SHIPPING') {
      return 'FREE SHIP';
    } else {
      return `${bestPromotion.conditions?.buyQuantity}+${bestPromotion.conditions?.getQuantity}`;
    }
  };

  return (
    <div className={`absolute top-2 left-2 z-10 ${className}`}>
      <div className="relative">
        {/* Main Badge */}
        <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5 animate-pulse">
          <FaFire className="text-yellow-300 text-sm" />
          <span className="font-bold text-sm">{getDiscountText()}</span>
        </div>

        {/* Additional promotions indicator */}
        {promotions.length > 1 && (
          <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
            +{promotions.length - 1}
          </div>
        )}
      </div>
    </div>
  );
};

export default PromotionBadge;
