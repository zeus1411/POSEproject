import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';

const ShopCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [direction, setDirection] = useState(0);

  const banners = [
    {
      id: 1,
      icon: '🐠',
      title: "Khuyến mãi đặc biệt",
      subtitle: "Giảm giá lên đến 50%",
      description: "Khám phá những loài cá cảnh quý hiếm với giá tốt nhất",
      image: "https://res.cloudinary.com/dxtrwinoc/image/upload/v1763628787/pose/products/p3nxduci3bvndlhdkmzn.jpg",
      buttonText: "Mua ngay",
      buttonLink: "#",
      accent: "from-emerald-300 to-cyan-300",
      badge: "-50%"
    },
    {
      id: 2,
      icon: '🌿',
      title: "Bộ sưu tập mới",
      subtitle: "Cây thủy sinh cao cấp vừa về",
      description: "Cây trồng cảnh thủy sinh tươi xanh, chất lượng hoàn hảo",
      image: "https://res.cloudinary.com/dxtrwinoc/image/upload/v1763658539/Screenshot_2025-11-21_000846_uuz6nt.png",
      buttonText: "Xem chi tiết",
      buttonLink: "#",
      accent: "from-teal-300 to-emerald-300",
      badge: "NEW"
    },
    {
      id: 3,
      icon: '⚙️',
      title: "Thiết bị chuyên dụng",
      subtitle: "Công nghệ mới nhất cho bể cá",
      description: "Hệ thống lọc, chiếu sáng, thổi khí đạt chuẩn quốc tế",
      image: "https://res.cloudinary.com/dxtrwinoc/image/upload/v1763699070/Screenshot_2025-11-21_112147_jmz5pe.png",
      buttonText: "Khám phá",
      buttonLink: "#",
      accent: "from-cyan-300 to-teal-300",
      badge: "PRO"
    },
    {
      id: 4,
      icon: '✨',
      title: "Cá cảnh nhập khẩu",
      subtitle: "Các loài cá quý hiếm, chất lượng đảm bảo",
      description: "Những giống cá đắt tiền từ các nước hàng đầu thế giới",
      image: "https://res.cloudinary.com/dxtrwinoc/image/upload/v1763658505/Screenshot_2025-11-21_000748_s3ueus.png",
      buttonText: "Xem ngay",
      buttonLink: "#",
      accent: "from-emerald-400 to-cyan-400",
      badge: "RARE"
    }
  ];

  useEffect(() => {
    if (!autoPlay) return;
    
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 7000);

    return () => clearInterval(timer);
  }, [autoPlay, banners.length]);

  const nextSlide = () => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % banners.length);
    setAutoPlay(false);
    setTimeout(() => setAutoPlay(true), 10000);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
    setAutoPlay(false);
    setTimeout(() => setAutoPlay(true), 10000);
  };

  const goToSlide = (index) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
    setAutoPlay(false);
    setTimeout(() => setAutoPlay(true), 10000);
  };

  return (
    <div className="w-full px-2 sm:px-4 py-8 mb-8">
      <div className="relative w-full h-80 sm:h-96 lg:h-[500px] overflow-hidden rounded-3xl shadow-[0_30px_100px_rgba(0,0,0,0.35)] bg-gradient-to-br from-[#051C1C] via-[#072525] to-[#0a3838] border border-cyan-300/20 group">
        
        {/* Animated Background Gradient Orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-0 -right-40 w-80 h-80 bg-gradient-to-br from-cyan-500/20 to-teal-500/10 rounded-full blur-3xl"
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-emerald-500/20 to-cyan-500/10 rounded-full blur-3xl"
            animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
            transition={{ duration: 10, repeat: Infinity }}
          />
        </div>

        {/* Slides Container */}
        <div className="relative w-full h-full">
          {banners.map((banner, index) => (
            <AnimatePresence mode="wait" key={banner.id}>
              {index === currentSlide && (
                <motion.div
                  key={`slide-${banner.id}`}
                  initial={{ opacity: 0, x: direction > 0 ? 1000 : -1000 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction > 0 ? -1000 : 1000 }}
                  transition={{ duration: 0.7, ease: 'easeInOut' }}
                  className="absolute inset-0 flex items-center justify-center px-4 sm:px-8 py-8 relative"
                >
                  {/* Text Content - Left Side (mobile: overlay) */}
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="absolute left-0 top-0 bottom-0 flex flex-col justify-center px-6 sm:px-10 py-8 max-w-sm lg:max-w-md relative z-20 md:relative md:flex-1"
                  >
                    {/* Icon & Badge */}
                    <motion.div className="flex items-center gap-3 mb-4">
                      <span className="text-4xl">{banner.icon}</span>
                      <div className="h-px w-12 bg-gradient-to-r from-cyan-300 to-transparent"></div>
                    </motion.div>

                    {/* Title */}
                    <motion.h2
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.6 }}
                      className="text-3xl sm:text-4xl font-headline font-bold text-white mb-3 leading-tight"
                    >
                      {banner.title}
                    </motion.h2>

                    {/* Subtitle */}
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.6 }}
                      className="text-lg sm:text-xl font-body text-cyan-200 mb-2"
                    >
                      {banner.subtitle}
                    </motion.p>

                    {/* Description */}
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.6 }}
                      className="text-sm text-white/70 mb-6 font-body"
                    >
                      {banner.description}
                    </motion.p>

                    {/* Button */}
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6, duration: 0.5 }}
                      whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(0, 255, 209, 0.3)' }}
                      whileTap={{ scale: 0.95 }}
                      className="w-fit px-8 py-3 bg-gradient-to-r from-emerald-400 to-cyan-300 text-abyss-300 font-body font-semibold rounded-lg hover:shadow-[0_0_25px_rgba(0,255,209,0.4)] transition-all duration-300"
                    >
                      {banner.buttonText} →
                    </motion.button>
                  </motion.div>

                  {/* Center Image - Main Focus */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, rotateY: -30 }}
                    animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="relative flex-1 flex items-center justify-center z-10 md:ml-auto"
                  >
                    {/* Outer rotating glow rings */}
                    <motion.div
                      className="absolute inset-0 rounded-3xl border-2 border-cyan-300/30"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, linear: true }}
                      style={{ width: '110%', height: '110%', left: '-5%', top: '-5%' }}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-3xl border border-emerald-300/20"
                      animate={{ rotate: -360 }}
                      transition={{ duration: 25, repeat: Infinity, linear: true }}
                      style={{ width: '125%', height: '125%', left: '-12.5%', top: '-12.5%' }}
                    />

                    {/* Decorative corner brackets */}
                    {[...Array(4)].map((_, i) => {
                      const positions = [
                        'top-0 left-0',
                        'top-0 right-0',
                        'bottom-0 left-0',
                        'bottom-0 right-0'
                      ];
                      return (
                        <motion.div
                          key={i}
                          className={`absolute ${positions[i]} w-6 h-6`}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.5 + i * 0.1 }}
                        >
                          <div className={`w-full h-full border-2 border-cyan-300/50 ${
                            i === 0 ? 'border-b-0 border-r-0' :
                            i === 1 ? 'border-b-0 border-l-0' :
                            i === 2 ? 'border-t-0 border-r-0' :
                            'border-t-0 border-l-0'
                          } rounded-full`} />
                        </motion.div>
                      );
                    })}

                    {/* Main Glass Frame with Image */}
                    <motion.div
                      className="relative w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 rounded-2xl backdrop-blur-lg bg-white/10 border border-cyan-300/40 p-3 shadow-[0_8px_32px_0_rgba(0,255,209,0.1)]"
                      animate={{
                        rotateY: [0, 8, 0],
                        rotateX: [0, -4, 0],
                        y: [0, -8, 0]
                      }}
                      transition={{ duration: 4.5, repeat: Infinity }}
                      style={{ perspective: '1000px' }}
                    >
                      {/* Image with flip effect */}
                      <motion.img
                        src={banner.image}
                        alt={banner.title}
                        className="w-full h-full object-cover rounded-lg"
                        animate={{
                          rotateZ: [0, 2, -2, 0],
                        }}
                        transition={{ duration: 5, repeat: Infinity }}
                      />

                      {/* Glass shine overlay */}
                      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/10 to-transparent opacity-60 pointer-events-none" />

                      {/* Badge on image */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.7, type: 'spring' }}
                        className="absolute -top-4 -right-4 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300 text-abyss-300 text-sm font-bold shadow-lg"
                      >
                        {banner.badge}
                      </motion.div>
                    </motion.div>

                    {/* Floating particles around image */}
                    <div className="absolute inset-0 pointer-events-none">
                      {[...Array(12)].map((_, i) => (
                        <motion.div
                          key={`particle-${i}`}
                          className="absolute w-1.5 h-1.5 bg-gradient-to-r from-cyan-300 to-emerald-300 rounded-full blur-sm"
                          animate={{
                            x: [0, Math.cos(i * Math.PI / 6) * 80],
                            y: [0, Math.sin(i * Math.PI / 6) * 80],
                            opacity: [0, 1, 0],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: i * 0.25,
                          }}
                          style={{
                            left: '50%',
                            top: '50%',
                            marginLeft: '-3px',
                            marginTop: '-3px',
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          ))}
        </div>

        {/* Navigation Controls */}
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-6 sm:px-10 py-6 bg-gradient-to-t from-black/30 to-transparent z-20">
          {/* Left Nav Button */}
          <motion.button
            onClick={prevSlide}
            whileHover={{ scale: 1.1, boxShadow: '0 0 25px rgba(0,255,209,0.3)' }}
            whileTap={{ scale: 0.95 }}
            className="p-2.5 rounded-full bg-cyan-300/20 border border-cyan-300/40 text-cyan-200 hover:bg-cyan-300/40 transition-all duration-300 backdrop-blur-sm"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </motion.button>

          {/* Indicator Dots */}
          <div className="flex items-center gap-2.5">
            {banners.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => goToSlide(index)}
                initial={false}
                animate={{
                  width: index === currentSlide ? 32 : 8,
                  backgroundColor: index === currentSlide ? 'rgb(0, 255, 209)' : 'rgba(0, 255, 209, 0.3)',
                }}
                transition={{ duration: 0.4 }}
                className="h-2 rounded-full transition-all"
              />
            ))}
          </div>

          {/* Right Nav Button */}
          <motion.button
            onClick={nextSlide}
            whileHover={{ scale: 1.1, boxShadow: '0 0 25px rgba(0,255,209,0.3)' }}
            whileTap={{ scale: 0.95 }}
            className="p-2.5 rounded-full bg-cyan-300/20 border border-cyan-300/40 text-cyan-200 hover:bg-cyan-300/40 transition-all duration-300 backdrop-blur-sm"
          >
            <ChevronRightIcon className="w-6 h-6" />
          </motion.button>
        </div>

        {/* Slide Counter */}
        <motion.div
          className="absolute top-6 right-6 z-20 px-4 py-2 rounded-full backdrop-blur-md bg-white/10 border border-cyan-300/30 text-cyan-200 text-sm font-body"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {String(currentSlide + 1).padStart(2, '0')} / {String(banners.length).padStart(2, '0')}
        </motion.div>
      </div>
    </div>
  );
};

export default ShopCarousel;
