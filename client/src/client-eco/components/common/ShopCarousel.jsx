import React, { useEffect, useMemo, useState } from 'react';
import {
  ChevronRightIcon,
  MapPinIcon,
  SparklesIcon,
} from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const ShopCarousel = () => {
  const { isDark } = useTheme();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);

  const banners = useMemo(
    () => [
      {
        id: 1,
        eyebrow: 'Signature Collection',
        location: 'AquaticStore, Viet Nam',
        title: 'Một bể cá đẹp bắt đầu từ lựa chọn tinh tuyển.',
        subtitle: 'Cá cảnh khỏe, màu sắc nổi bật và được chọn lọc kỹ cho hồ thủy sinh hiện đại.',
        description: 'Khám phá các dòng cá cảnh đang được yêu thích với ưu đãi theo mùa, phù hợp cho cả người mới chơi và bể trưng bày cao cấp.',
        image: 'https://res.cloudinary.com/dxtrwinoc/image/upload/v1763628787/pose/products/p3nxduci3bvndlhdkmzn.jpg',
      },
      {
        id: 2,
        eyebrow: 'New Arrival',
        location: 'Planted Aquarium Edit',
        title: 'Cây thủy sinh tươi cho bố cục tự nhiên hơn.',
        subtitle: 'Tông xanh sạch, dáng cây khỏe và dễ phối trong nhiều layout hồ.',
        description: 'Từ tiền cảnh đến hậu cảnh, bộ sưu tập cây mới giúp hồ có chiều sâu, mềm mại và cân bằng ánh nhìn hơn.',
        image: 'https://res.cloudinary.com/dxtrwinoc/image/upload/v1763658539/Screenshot_2025-11-21_000846_uuz6nt.png',
      },
      {
        id: 3,
        eyebrow: 'Equipment Edit',
        location: 'Premium Aquarium Gear',
        title: 'Thiết bị êm, ổn định và nâng tầm trải nghiệm.',
        subtitle: 'Lọc, đèn và phụ kiện được chọn theo tiêu chí bền, gọn và hiệu quả.',
        description: 'Hoàn thiện hệ sinh thái hồ cá với các thiết bị vận hành ổn định, giúp nước trong, ánh sáng đẹp và chăm hồ nhẹ nhàng hơn.',
        image: 'https://res.cloudinary.com/dxtrwinoc/image/upload/v1763699070/Screenshot_2025-11-21_112147_jmz5pe.png',
      },
      {
        id: 4,
        eyebrow: 'Rare Selection',
        location: 'Imported Fish Gallery',
        title: 'Dòng cá nhập khẩu cho điểm nhấn khác biệt.',
        subtitle: 'Sắc màu rõ, form đẹp và được chăm theo quy trình an toàn.',
        description: 'Những lựa chọn hiếm hơn cho người chơi muốn tạo một hồ cá có cá tính riêng, tinh tế nhưng vẫn dễ thưởng thức mỗi ngày.',
        image: 'https://res.cloudinary.com/dxtrwinoc/image/upload/v1763658505/Screenshot_2025-11-21_000748_s3ueus.png',
      },
    ],
    []
  );

  const activeBanner = banners[currentSlide];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setDirection(1);
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 7000);

    return () => window.clearInterval(timer);
  }, [banners.length]);

  const nextSlide = () => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  return (
    <section className="shop-carousel relative w-full px-3 pt-6 pb-8 sm:px-5 lg:px-6">
      <div className={`relative mx-auto min-h-[430px] max-w-[1380px] overflow-hidden rounded-[28px] border transition-all duration-300 ${
        isDark 
          ? 'border-[#e8ddbd]/22 bg-[#071411] shadow-[0_22px_70px_rgba(0,0,0,0.34)]' 
          : 'border-water/42 bg-gradient-to-br from-white/90 to-[#E8F6F6]/80 shadow-[0_22px_50px_rgba(70,130,169,0.12)]'
      } sm:min-h-[470px] lg:min-h-[500px]`}>
        <AnimatePresence initial={false} mode="wait" custom={direction}>
          <motion.div
            key={activeBanner.id}
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? 56 : -56 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -56 : 56 }}
            transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <motion.img
              src={activeBanner.image}
              alt={activeBanner.title}
              className="absolute inset-0 h-full w-full object-cover object-center"
              initial={{ scale: 1.045 }}
              animate={{ scale: 1 }}
              transition={{ duration: 6.5, ease: 'easeOut' }}
            />
            <div className={`absolute inset-0 transition-all duration-300 ${
              isDark 
                ? 'bg-[linear-gradient(90deg,rgba(4,15,12,0.93)_0%,rgba(5,18,14,0.84)_36%,rgba(5,18,14,0.36)_62%,rgba(5,18,14,0.08)_100%)]' 
                : 'bg-[linear-gradient(90deg,rgba(255,255,255,0.82)_0%,rgba(255,255,255,0.62)_35%,rgba(255,255,255,0.20)_65%,rgba(255,255,255,0)_100%)]'
            }`} />
            <div className={`absolute inset-0 transition-all duration-300 ${
              isDark 
                ? 'bg-[linear-gradient(180deg,rgba(3,10,8,0.18)_0%,rgba(3,10,8,0)_46%,rgba(3,10,8,0.38)_100%)]' 
                : 'bg-[linear-gradient(180deg,rgba(255,255,255,0.1)_0%,rgba(255,255,255,0)_46%,rgba(255,255,255,0.2)_100%)]'
            }`} />
          </motion.div>
        </AnimatePresence>
 
        <div className="relative z-20 flex min-h-[430px] items-center px-5 py-10 sm:min-h-[470px] sm:px-9 lg:min-h-[500px] lg:px-14">
          <motion.div
            key={`content-${activeBanner.id}`}
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.54 }}
            className="max-w-[660px]"
          >
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(0,0,0,0.08)] backdrop-blur-md transition-all duration-300 ${
                isDark 
                  ? 'border-[#e6d7aa]/28 bg-[#f7efd8]/12 text-white' 
                  : 'border-[#1F4D3A]/28 bg-[#1F4D3A]/8 text-[#1F4D3A]'
              }`}>
                <SparklesIcon className="h-4 w-4 text-[#d6b46c]" />
                {activeBanner.eyebrow}
              </div>
              <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] shadow-[0_10px_30px_rgba(0,0,0,0.08)] backdrop-blur-md transition-all duration-300 ${
                isDark 
                  ? 'border-[#fff4d8]/28 bg-[#071411]/56 text-white' 
                  : 'border-[#4682A9]/28 bg-[#4682A9]/8 text-[#4682A9]'
              }`}>
                <MapPinIcon className="h-4 w-4 text-[#d6b46c]" />
                {activeBanner.location}
              </div>
            </div>
 
            <h1 className={`max-w-3xl font-headline text-[2.45rem] font-bold leading-[1.04] tracking-normal transition-all duration-300 sm:text-5xl lg:text-[4rem] ${
              isDark 
                ? 'text-[#fff8e7] drop-shadow-[0_12px_28px_rgba(0,0,0,0.5)]' 
                : 'text-[#051C1C] drop-shadow-none'
            }`}>
              {activeBanner.title}
            </h1>
 
            <p className={`carousel-subtitle mt-5 max-w-2xl text-lg font-semibold leading-8 transition-all duration-300 sm:text-xl ${
              isDark 
                ? 'text-[#f2e7cb] drop-shadow-[0_6px_18px_rgba(0,0,0,0.38)]' 
                : 'text-[#1F4D3A] drop-shadow-none'
            }`}>
              {activeBanner.subtitle}
            </p>
 
            <p className={`carousel-description mt-4 max-w-xl rounded-2xl border px-4 py-3 text-sm font-medium leading-7 shadow-[0_14px_34px_rgba(0,0,0,0.08)] backdrop-blur-sm sm:text-base transition-all duration-300 ${
              isDark 
                ? 'border-[#fff4d8]/14 bg-[#06130f]/42 text-white' 
                : 'border-[#1F4D3A]/14 bg-white/60 text-[#1F4D3A]'
            }`}>
              {activeBanner.description}
            </p>
          </motion.div>
        </div>
 
        <button
          type="button"
          onClick={nextSlide}
          aria-label="Slide tiếp theo"
          className={`absolute right-5 top-1/2 z-30 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border shadow-[0_16px_38px_rgba(0,0,0,0.18)] backdrop-blur-md transition duration-300 hover:-translate-y-[52%] sm:right-7 ${
            isDark 
              ? 'border-[#f4e8c8]/28 bg-[#06130f]/54 text-[#fff8e7] hover:border-[#d6b46c]/70 hover:bg-[#f4e8c8]/14' 
              : 'border-[#4682A9]/28 bg-white/60 text-[#4682A9] hover:border-[#4682A9]/80 hover:bg-[#4682A9]/14'
          }`}
        >
          <ChevronRightIcon className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
};

export default ShopCarousel;
