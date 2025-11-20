import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      title: "Chào mừng đến với AquaticPose",
      subtitle: "Thiên đường thủy sinh của bạn",
      description: "Khám phá hàng nghìn sản phẩm chất lượng với giá cả hợp lý",
      gradient: "from-blue-500 to-cyan-500",
      icon: "🐠"
    },
    {
      id: 2,
      title: "Cây thủy sinh đa dạng",
      subtitle: "Tạo không gian xanh tự nhiên",
      description: "Bộ sưu tập cây thủy sinh đẹp và dễ chăm sóc",
      gradient: "from-green-500 to-emerald-500",
      icon: "🌱"
    },
    {
      id: 3,
      title: "Thiết bị chuyên nghiệp",
      subtitle: "Công nghệ hiện đại cho bể cá",
      description: "Đèn LED, lọc nước, CO2 và nhiều thiết bị khác",
      gradient: "from-purple-500 to-pink-500",
      icon: "🔧"
    },
    {
      id: 4,
      title: "Cá cảnh đẹp mắt",
      subtitle: "Những loài cá độc đáo",
      description: "Cá cảnh nhập khẩu chất lượng cao, đủ loại",
      gradient: "from-orange-500 to-red-500",
      icon: "🐟"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="relative w-full h-96 lg:h-[500px] overflow-hidden rounded-2xl shadow-2xl mb-8">
      {/* Slides */}
      <div className="relative h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`
              absolute inset-0 transition-all duration-700 ease-in-out
              ${index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}
            `}
          >
            <div className={`w-full h-full bg-gradient-to-br ${slide.gradient} flex items-center justify-center relative overflow-hidden`}>
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-4000"></div>
              </div>

              {/* Content */}
              <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
                <div className="text-8xl mb-6 animate-bounce-slow">
                  {slide.icon}
                </div>
                <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
                  {slide.title}
                </h1>
                <p className="text-2xl md:text-3xl text-white/90 font-semibold mb-4">
                  {slide.subtitle}
                </p>
                <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
                  {slide.description}
                </p>
              </div>

              {/* Decorative elements */}
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 group"
        aria-label="Previous slide"
      >
        <ChevronLeftIcon className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 group"
        aria-label="Next slide"
      >
        <ChevronRightIcon className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
      </button>

      {/* Dots Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`
              transition-all duration-300 rounded-full
              ${index === currentSlide 
                ? 'bg-white w-8 h-3' 
                : 'bg-white/50 hover:bg-white/70 w-3 h-3'
              }
            `}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Slide counter */}
      <div className="absolute top-6 right-6 z-20 bg-black/30 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold">
        {currentSlide + 1} / {slides.length}
      </div>
    </div>
  );
};

export default HeroCarousel;
