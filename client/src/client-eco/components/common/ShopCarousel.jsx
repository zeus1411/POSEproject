import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const ShopCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  // Dữ liệu banner - có thể thay thế hình ảnh tại đây
  const banners = [
    {
      id: 1,
      title: "Khuyến mãi đặc biệt",
      subtitle: "Giảm giá lên đến 50%",
      image: "https://res.cloudinary.com/dxtrwinoc/image/upload/v1763628787/pose/products/p3nxduci3bvndlhdkmzn.jpg",
      buttonText: "Mua ngay",
      buttonLink: "#"
    },
    {
      id: 2,
      title: "Bộ sưu tập mới",
      subtitle: "Cây thủy sinh cao cấp vừa về",
      image: "https://res.cloudinary.com/dxtrwinoc/image/upload/v1763658539/Screenshot_2025-11-21_000846_uuz6nt.png",
      buttonText: "Xem chi tiết",
      buttonLink: "#"
    },
    {
      id: 3,
      title: "Thiết bị chuyên dụng",
      subtitle: "Công nghệ mới nhất cho bể cá",
      image: "https://res.cloudinary.com/dxtrwinoc/image/upload/v1763699070/Screenshot_2025-11-21_112147_jmz5pe.png",
      buttonText: "Khám phá",
      buttonLink: "#"
    },
    {
      id: 4,
      title: "Cá cảnh nhập khẩu",
      subtitle: "Các loài cá quý hiếm, chất lượng đảm bảo",
      image: "https://res.cloudinary.com/dxtrwinoc/image/upload/v1763658505/Screenshot_2025-11-21_000748_s3ueus.png",
      buttonText: "Xem ngay",
      buttonLink: "#"
    }
  ];

  // Auto-play carousel
  useEffect(() => {
    if (!autoPlay) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [autoPlay, banners.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
    setAutoPlay(false);
    setTimeout(() => setAutoPlay(true), 10000);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
    setAutoPlay(false);
    setTimeout(() => setAutoPlay(true), 10000);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setAutoPlay(false);
    setTimeout(() => setAutoPlay(true), 10000);
  };

  return (
    <div className="relative w-full h-80 sm:h-96 lg:h-[450px] overflow-hidden rounded-2xl shadow-2xl mb-8 bg-gray-200">
      {/* Slides Container */}
      <div className="relative w-full h-full">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`
              absolute inset-0 transition-all duration-700 ease-in-out
              ${index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'}
            `}
          >
            {/* Background Image */}
            <img
              src={banner.image}
              alt={banner.title}
              className="w-full h-full object-cover"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>

            {/* Content */}
            <div className="absolute inset-0 flex items-center justify-start pl-6 sm:pl-10 lg:pl-16">
              <div className="max-w-2xl text-white">
                <p className="text-sm sm:text-base font-semibold text-teal-400 mb-2 uppercase tracking-widest">
                  Ưu đãi đặc biệt
                </p>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 drop-shadow-lg">
                  {banner.title}
                </h2>
                <p className="text-lg sm:text-xl text-gray-100 mb-6 drop-shadow-md max-w-lg">
                  {banner.subtitle}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Previous Button */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-2 sm:p-3 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg group"
        aria-label="Slide trước"
      >
        <ChevronLeftIcon className="w-5 sm:w-6 h-5 sm:h-6 group-hover:-translate-x-1 transition-transform" />
      </button>

      {/* Next Button */}
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-2 sm:p-3 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg group"
        aria-label="Slide tiếp theo"
      >
        <ChevronRightIcon className="w-5 sm:w-6 h-5 sm:h-6 group-hover:translate-x-1 transition-transform" />
      </button>

      {/* Dots Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`
              transition-all duration-300 rounded-full backdrop-blur-sm
              ${index === currentSlide 
                ? 'bg-white w-8 h-3 shadow-lg' 
                : 'bg-white/50 hover:bg-white/70 w-3 h-3'
              }
            `}
            aria-label={`Đi đến slide ${index + 1}`}
          />
        ))}
      </div>

      
      {/* Loading dots indicator (auto-play status) */}
      {autoPlay && (
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 flex gap-1">
          <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div>
          <div className="text-white/70 text-xs font-semibold">Tự động</div>
        </div>
      )}
    </div>
  );
};

export default ShopCarousel;
