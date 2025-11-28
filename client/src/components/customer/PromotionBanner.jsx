import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAvailablePromotions } from '../../redux/slices/promotionSlice';
import { FaPercent, FaShippingFast, FaGift, FaTag } from 'react-icons/fa';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const PromotionBanner = () => {
  // Component is disabled since we now only support COUPON type
  // which requires manual input at checkout, not automatic promotion display
  return null;
};

export default PromotionBanner;
