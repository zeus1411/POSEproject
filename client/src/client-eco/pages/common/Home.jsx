import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { 
  ArrowRightIcon, 
  StarIcon, 
  ShieldCheckIcon, 
  TruckIcon, 
  ChatBubbleLeftRightIcon,
  CheckIcon,
  SparklesIcon,
  BeakerIcon,
  LightBulbIcon,
  SunIcon,
  NewspaperIcon
} from '@heroicons/react/24/outline';

const Home = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = React.useState('hero');
  const prefersReducedMotion = useReducedMotion();

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'collections', 'features', 'why-us', 'blogs'];
      const scrollPosition = window.scrollY + 200;
      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const heroContent = document.querySelector('.hero-content');
      const heroImage = document.querySelector('.hero-image');
      if (heroContent && heroImage) {
        heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
        heroImage.style.transform = `translateY(${scrolled * 0.1}px)`;
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in-up');
        }
      });
    };
    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });
    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const navDots = [
    { id: 'hero', label: 'Trang chủ' },
    { id: 'collections', label: 'Bộ sưu tập' },
    { id: 'features', label: 'Tính năng' },
    { id: 'why-us', label: 'Ưu điểm' },
    { id: 'blogs', label: 'Blogs' },
  ];

  return (
    <div className="home-page min-h-screen bg-background text-foreground">
      {/* Floating Navigation Sidebar */}
      <nav className="hidden lg:block fixed left-8 top-1/2 -translate-y-1/2 z-30">
        <div className="glass-panel rounded-2xl p-4">
          <div className="flex flex-col space-y-6">
            {navDots.map((dot) => (
              <button key={dot.id} onClick={() => scrollToSection(dot.id)} className="group relative" title={dot.label}>
                <div className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  activeSection === dot.id
                    ? 'bg-neon-cyan ring-4 ring-neon-cyan/30 shadow-glow-cyan'
                    : 'bg-gray-600 group-hover:bg-neon-cyan/60'
                }`}></div>
                <span className="absolute left-8 top-1/2 -translate-y-1/2 bg-abyss/90 backdrop-blur-md text-neon-cyan text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-neon-cyan/20">
                  {dot.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section 
        id="hero" 
        className="relative min-h-screen flex items-center overflow-hidden"
      >
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <video
            src="https://res.cloudinary.com/dxtrwinoc/video/upload/v1778405384/12095774-hd_1920_1080_30fps_swlzx1.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          {/* Lớp phủ tối để nổi bật text và các nút bấm */}
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="flex flex-col items-start space-y-8">
            {/* Title & Caption */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Thực Hiện Ước Mơ <br />
                <span className="text-emerald-400">Thủy Sinh</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-200 max-w-2xl leading-relaxed">
                Khám phá thế giới thủy sinh cao cấp với bộ sưu tập cây nước, cá cảnh và phụ kiện chất lượng. 
                Tạo nên những layout bể thủy sinh đẹp hoàn hảo cho không gian của bạn.
              </p>
            </div>

            {/* Buttons Row - Đã chỉnh sửa nằm ngang hàng */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Nút 1: Shopping time */}
              <Link
                to="/shop"
                className="inline-flex items-center justify-center
                          px-8 py-4
                          text-lg font-semibold
                          text-white
                          bg-gradient-to-r from-emerald-600 to-teal-600
                          rounded-full
                          hover:from-emerald-700 hover:to-teal-700
                          hover:scale-105
                          transition-all duration-300
                          shadow-lg hover:shadow-xl"
              >
                Shopping time
                <ArrowRightIcon className="ml-2 w-5 h-5" />
              </Link>

              {/* Nút 2: Tìm Hiểu Thêm */}
              <button
                onClick={() => scrollToSection('collections')}
                className="inline-flex items-center justify-center
                          px-8 py-4
                          text-lg font-semibold
                          text-white
                          bg-white/10
                          backdrop-blur-md
                          border-2 border-white/30
                          rounded-full
                          hover:bg-white/20
                          hover:scale-105
                          transition-all duration-300"
              >
                Tìm Hiểu Thêm
              </button>

              {/* Nút 3: Xem Blog */}
              <Link
                to="/blogs"
                className="inline-flex items-center justify-center
                          px-8 py-4
                          text-lg font-semibold
                          text-white
                          bg-white/10
                          backdrop-blur-md
                          border-2 border-white/30
                          rounded-full
                          hover:bg-white/20
                          hover:scale-105
                          transition-all duration-300"
              >
                <span className="mr-2">📖</span>
                Xem Blog setup
                <ArrowRightIcon className="ml-2 w-4 h-4"/>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Collections Section */}
      <section id="collections" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#051C1C] via-[#0a2828] to-[#051C1C]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-white mb-4">
              Khám Phá Bộ Sưu Tập
            </h2>
            <p className="text-lg text-gray-400 font-body max-w-3xl mx-auto">
              Chúng tôi cung cấp đầy đủ các sản phẩm chất lượng cao cho hobby thủy sinh của bạn
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Cây Thủy Sinh */}
            <div className="group animate-on-scroll glass-card rounded-2xl overflow-hidden transition-all duration-500">
              <div className="relative h-48 overflow-hidden">
                <img src="https://www.ugaoo.com/cdn/shop/articles/0e338c1b09.jpg?v=1698991765" alt="Cây thủy sinh" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-abyss/80 via-abyss/30 to-transparent"></div>
                <div className="absolute bottom-4 left-4 flex items-center space-x-2">
                  <div className="w-10 h-10 glass-panel rounded-xl flex items-center justify-center"><BeakerIcon className="w-5 h-5 text-neon-cyan" /></div>
                  <span className="text-white font-headline font-semibold text-lg">Cây Thủy Sinh</span>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-400 font-body mb-6 leading-relaxed">Bộ sưu tập cây thủy sinh đa dạng từ dễ chăm đến khó, phù hợp cho mọi layout từ Dutch đến Nature.</p>
                <Link to={`/shop?category=${encodeURIComponent('66c9b0a1f1e2d3c4a5b6e7f8')}`} className="inline-flex items-center text-neon-cyan font-body font-semibold hover:text-neon-green group/link transition-colors duration-200 cursor-pointer z-10 relative" onClick={(e) => { console.log('Cây thủy sinh link clicked'); e.stopPropagation(); }}>
                  Xem thêm <ArrowRightIcon className="ml-1 w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Cá Cảnh */}
            <div className="group animate-on-scroll glass-card rounded-2xl overflow-hidden transition-all duration-500">
              <div className="relative h-48 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?q=80&w=1200&auto=format&fit=crop" alt="Cá cảnh" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-abyss/80 via-abyss/30 to-transparent"></div>
                <div className="absolute bottom-4 left-4 flex items-center space-x-2">
                  <div className="w-10 h-10 glass-panel rounded-xl flex items-center justify-center"><SparklesIcon className="w-5 h-5 text-neon-cyan" /></div>
                  <span className="text-white font-headline font-semibold text-lg">Cá Cảnh</span>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-400 font-body mb-6 leading-relaxed">Các loài cá nhiệt đới đẹp và khỏe mạnh, được chọn lọc kỹ càng để phù hợp với hệ thống thủy sinh.</p>
                <Link to={`/shop?category=${encodeURIComponent('66c9b0a1f1e2d3c4a5b6e7f9')}`} className="inline-flex items-center text-neon-cyan font-body font-semibold hover:text-neon-green group/link transition-colors duration-200 cursor-pointer z-10 relative" onClick={(e) => { console.log('Cá cảnh link clicked'); e.stopPropagation(); }}>
                  Xem thêm <ArrowRightIcon className="ml-1 w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Phụ Kiện */}
            <div className="group animate-on-scroll glass-card rounded-2xl overflow-hidden transition-all duration-500 md:col-span-2 lg:col-span-1">
              <div className="relative h-48 overflow-hidden">
                <img src="https://becathuysinhmini.com/wp-content/uploads/2023/05/phu-kien-be-ca.jpg" alt="Phụ kiện thủy sinh" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-abyss/80 via-abyss/30 to-transparent"></div>
                <div className="absolute bottom-4 left-4 flex items-center space-x-2">
                  <div className="w-10 h-10 glass-panel rounded-xl flex items-center justify-center"><SunIcon className="w-5 h-5 text-neon-cyan" /></div>
                  <span className="text-white font-headline font-semibold text-lg">Phụ Kiện</span>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-400 font-body mb-6 leading-relaxed">Hệ thống lọc, đèn LED, CO2, phân bón và các thiết bị cần thiết cho bể thủy sinh hoàn hảo.</p>
                <Link to={`/shop?category=${encodeURIComponent('66c9b0a1f1e2d3c4a5b6e7fc')}`} className="inline-flex items-center text-neon-cyan font-body font-semibold hover:text-neon-green group/link transition-colors duration-200 cursor-pointer z-10 relative" onClick={(e) => { console.log('Phụ kiện link clicked'); e.stopPropagation(); }}>
                  Xem thêm <ArrowRightIcon className="ml-1 w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

          {/* Showcase Slider Section */}
          <section className="py-20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#061e2e] via-[#0a2a2a] to-[#051C1C]"></div>
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute left-1/2 top-20 h-80 w-[42rem] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl"></div>
              <div className="absolute right-[-8rem] top-32 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl"></div>
              <div className="absolute left-[-8rem] bottom-[-6rem] h-72 w-72 rounded-full bg-teal-500/10 blur-3xl"></div>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="text-center mb-10 sm:mb-14 animate-on-scroll">
                <p className="text-xs uppercase tracking-[0.4em] text-neon-cyan/70 mb-3">Gallery Layout Thủy Sinh</p>
                <h2 className="text-3xl md:text-4xl font-headline font-bold text-white mb-4">Dòng chảy hình ảnh aquascape</h2>
                <p className="text-lg text-gray-400 font-body max-w-3xl mx-auto">Một dải ảnh chuyển động theo kiểu editorial, khớp với tông tối và sang của trang chủ.</p>
              </div>

              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/20 backdrop-blur-xl shadow-[0_30px_120px_rgba(0,0,0,0.35)] px-4 sm:px-6 py-6 sm:py-8">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.12),transparent_35%),radial-gradient(circle_at_50%_100%,rgba(16,185,129,0.10),transparent_32%)] pointer-events-none"></div>
                <motion.div
                  className="flex w-max gap-4 sm:gap-5 will-change-transform"
                  animate={prefersReducedMotion ? { x: 0 } : { x: ['0%', '-50%'] }}
                  transition={{ duration: prefersReducedMotion ? 0 : 34, ease: 'linear', repeat: Infinity }}
                >
                  {[
                    { src: '/images/nature-style.jpg', title: 'Nature Style', sub: 'Phong cách tự nhiên' },
                    { src: '/images/dutch-style.jpg', title: 'Dutch Style', sub: 'Phong cách Hà Lan' },
                    { src: '/images/planted-tank.jpg', title: 'Planted Tank', sub: 'Bể thủy sinh trồng cây' },
                    { src: '/images/iwagumi.jpg', title: 'Iwagumi', sub: 'Phong cách đá' },
                    { src: '/images/community-tank.jpg', title: 'Community Tank', sub: 'Bể cộng đồng' },
                    { src: '/images/biotope.jpg', title: 'Biotope', sub: 'Sinh cảnh tự nhiên' },
                  ].concat([
                    { src: '/images/nature-style.jpg', title: 'Nature Style', sub: 'Phong cách tự nhiên' },
                    { src: '/images/dutch-style.jpg', title: 'Dutch Style', sub: 'Phong cách Hà Lan' },
                    { src: '/images/planted-tank.jpg', title: 'Planted Tank', sub: 'Bể thủy sinh trồng cây' },
                    { src: '/images/iwagumi.jpg', title: 'Iwagumi', sub: 'Phong cách đá' },
                    { src: '/images/community-tank.jpg', title: 'Community Tank', sub: 'Bể cộng đồng' },
                    { src: '/images/biotope.jpg', title: 'Biotope', sub: 'Sinh cảnh tự nhiên' },
                  ]).map((item, i) => (
                    <motion.div
                      key={`${item.title}-${i}`}
                      whileHover={prefersReducedMotion ? undefined : { y: -10, scale: 1.02, rotateY: 6 }}
                      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                      className="group relative shrink-0 w-[16rem] sm:w-[18rem] lg:w-[19rem] overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#071616] shadow-[0_20px_50px_rgba(0,0,0,0.35)]"
                      style={{ transformStyle: 'preserve-3d', perspective: 1200 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-cyan-400/10 via-transparent to-transparent opacity-70"></div>
                      <img src={item.src} alt={item.title} className="h-[23rem] w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/20 to-transparent"></div>
                      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[10px] uppercase tracking-[0.35em] text-cyan-100/75 backdrop-blur-md">
                          Aquascape
                        </div>
                        <h3 className="mt-3 text-2xl sm:text-3xl font-headline font-semibold text-white leading-tight drop-shadow-[0_2px_18px_rgba(0,0,0,0.45)]">
                          {item.title}
                        </h3>
                        <p className="mt-2 text-sm text-white/65 font-body">{item.sub}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          </section>

      {/* Features Section */}
      <section id="features" className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#051C1C] to-[#0a2828]"></div>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="fish-container"><div className="fish fish-1">🐠</div><div className="fish fish-2">🐟</div><div className="fish fish-3">🐡</div></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-white mb-4">Tính Năng Nổi Bật</h2>
            <p className="text-lg text-gray-400 font-body max-w-3xl mx-auto">Hệ thống mua sắm thủy sinh hiện đại với đầy đủ tính năng</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: SunIcon, title: 'Tìm Kiếm Thông Minh', desc: 'Lọc theo loại sản phẩm, giá cả và độ khó chăm sóc', color: 'neon-cyan' },
              { icon: LightBulbIcon, title: 'Thông Tin Chi Tiết', desc: 'Hướng dẫn chăm sóc và độ tương thích đầy đủ', color: 'emerald-400' },
              { icon: StarIcon, title: 'Đánh Giá Sản Phẩm', desc: 'Nhận xét từ cộng đồng aquascaper', color: 'cyan-400' },
              { icon: BeakerIcon, title: 'Trợ Giá Shipping', desc: 'Mua càng cao shipping càng hời', color: 'teal-400' },
            ].map((f, i) => (
              <div key={i} className="group glass-card rounded-2xl p-8 transition-all duration-500 hover:border-neon-cyan/20 animate-on-scroll">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 bg-${f.color}/10 border border-${f.color}/20`}>
                  <f.icon className={`w-8 h-8 text-${f.color}`} />
                </div>
                <h4 className="font-headline font-bold text-lg text-white mb-3">{f.title}</h4>
                <p className="text-sm text-gray-400 font-body leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Aquarium Experience Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a2828] via-[#061e2e] to-[#051C1C]"></div>
        <div className="absolute inset-0 pointer-events-none"><div className="bubble"></div><div className="bubble"></div><div className="bubble"></div><div className="bubble"></div><div className="bubble"></div><div className="bubble"></div></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-on-scroll space-y-6">
              <div className="inline-block"><span className="glass-panel text-neon-cyan px-4 py-2 rounded-full text-sm font-body font-semibold">✨ Trải Nghiệm Thủy Sinh</span></div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-headline font-bold text-white leading-tight">
                Đắm Chìm Trong Thế Giới<br /><span className="neon-glow text-neon-cyan">Aquascape Tuyệt Đẹp</span>
              </h2>
              <p className="text-lg text-gray-400 font-body leading-relaxed">Mỗi bể thủy sinh là một tác phẩm nghệ thuật sống động. Chúng tôi giúp bạn tạo ra những không gian dưới nước đầy mê hoặc.</p>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="glass-panel rounded-xl p-4"><div className="text-3xl font-headline font-bold text-white mb-1">500+</div><div className="text-neon-cyan/70 font-body text-sm">Loài Cây & Cá</div></div>
                <div className="glass-panel rounded-xl p-4"><div className="text-3xl font-headline font-bold text-white mb-1">1000+</div><div className="text-neon-cyan/70 font-body text-sm">Khách Hàng Hài Lòng</div></div>
              </div>
            </div>
            <div className="animate-on-scroll relative">
              <div className="relative rounded-3xl overflow-hidden shadow-glass-lg border border-white/10">
                <img src="/images/OverviewTank.jpg" alt="Beautiful Aquascape" className="w-full h-[400px] object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-abyss/40 to-transparent"></div>
                <div className="absolute top-6 right-6 glass-panel rounded-xl p-4 shadow-xl animate-float-gentle">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-neon-cyan/10 rounded-lg flex items-center justify-center"><BeakerIcon className="w-6 h-6 text-neon-cyan" /></div>
                    <div><div className="text-sm font-body font-semibold text-white">Nature Style</div><div className="text-xs text-gray-400 font-body">Amano Inspired</div></div>
                  </div>
                </div>
                <div className="absolute bottom-6 left-6 glass-panel rounded-xl p-4 shadow-xl animate-float-gentle-delayed">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-neon-cyan/10 rounded-lg flex items-center justify-center"><SparklesIcon className="w-6 h-6 text-neon-cyan" /></div>
                    <div><div className="text-sm font-body font-semibold text-white">Hồ siêu xịn</div><div className="text-xs text-gray-400 font-body">Setup triệu đô</div></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="why-us" className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#051C1C] to-[#0a2828]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-white mb-4">Tại Sao Chọn AquaticPose?</h2>
            <p className="text-lg text-gray-400 font-body max-w-3xl mx-auto">Chúng tôi cam kết mang đến trải nghiệm mua sắm tốt nhất cho cộng đồng yêu thủy sinh</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: ShieldCheckIcon, title: 'Chất Lượng Đảm Bảo', desc: 'Cây và cá khỏe mạnh, được tuyển chọn kỹ càng từ những nhà cung cấp uy tín' },
              { icon: TruckIcon, title: 'Vận Chuyển An Toàn', desc: 'Hệ thống đóng gói chuyên dụng cho thủy sinh, đảm bảo sản phẩm đến tay khách hàng an toàn' },
              { icon: ChatBubbleLeftRightIcon, title: 'Tư Vấn Chuyên Nghiệp', desc: 'Đội ngũ chuyên gia hỗ trợ setup layout và giải đáp mọi thắc mắc về thủy sinh' },
              { icon: SparklesIcon, title: 'Hỗ Trợ Setup', desc: 'Hướng dẫn chi tiết setup bể từ A-Z, đặc biệt hỗ trợ người mới bắt đầu' },
            ].map((item, i) => (
              <div key={i} className="text-center animate-on-scroll group">
                <div className="relative mb-6">
                  <div className="w-24 h-24 bg-neon-cyan/10 border border-neon-cyan/20 rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-glow-cyan">
                    <item.icon className="w-12 h-12 text-neon-cyan" />
                  </div>
                </div>
                <h3 className="text-xl font-headline font-bold text-white mb-3">{item.title}</h3>
                <p className="text-gray-400 font-body leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Showcase */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a2828] via-[#061e2e] to-[#051C1C]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-white mb-4">Bể Thủy Sinh Từ Cộng Đồng</h2>
            <p className="text-lg text-gray-400 font-body max-w-3xl mx-auto">Những layout tuyệt đẹp được tạo ra bởi khách hàng của chúng tôi</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { src: '/images/AIimage.jpg', name: 'Anh Tuấn', initial: 'A', review: '"Cây khỏe, đóng gói cẩn thận. Bể của mình giờ đẹp quá!"' },
              { src: '/images/kingfish.jpg', name: 'Chú Hưng', initial: 'M', review: '"Cá nhìn nhỏ mà có võ. Sẽ quay lại ủng hộ!"' },
              { src: '/images/beeshrimp.jpg', name: 'Anh Vinh', initial: 'H', review: '"Tép màu đẹp, trông nghệ cả củ!"' },
            ].map((c, i) => (
              <div key={i} className="group animate-on-scroll">
                <div className="relative overflow-hidden rounded-2xl glass-card">
                  <img src={c.src} alt={`Customer aquascape ${i+1}`} className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-abyss/90 via-abyss/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute bottom-6 left-6 right-6">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-neon-cyan/20 rounded-full flex items-center justify-center text-neon-cyan font-bold">{c.initial}</div>
                        <div><div className="text-white font-body font-semibold">{c.name}</div><div className="flex text-yellow-400 text-sm">{'★'.repeat(5)}</div></div>
                      </div>
                      <p className="text-gray-300 font-body text-sm italic">{c.review}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-16 glass-panel rounded-3xl p-8 animate-on-scroll">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { val: '98%', label: 'Khách Hàng Hài Lòng' },
                { val: '500+', label: 'Sản Phẩm' },
                { val: '24/7', label: 'Hỗ Trợ' },
                { val: '1000+', label: 'Đơn Hàng' },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl md:text-4xl font-headline font-bold text-neon-cyan mb-2">{s.val}</div>
                  <div className="text-gray-400 font-body text-sm">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section id="blogs" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#051C1C] to-[#0a2828]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-4xl md:text-5xl font-headline font-bold text-white mb-4">Blog Mới Nhất</h2>
            <p className="text-lg text-gray-400 font-body max-w-3xl mx-auto">Chia sẻ kinh nghiệm setup, chăm cây, nuôi cá và các bí quyết giúp bể thủy sinh của bạn đẹp hơn mỗi ngày.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { to: '/blogs/setup-be-thuy-sinh-cho-nguoi-moi', img: '/images/nature-style.jpg', tag: 'Beginner Guide', tagColor: 'neon-cyan', title: 'Cách Setup Bể Thủy Sinh Cho Người Mới', desc: 'Hướng dẫn từng bước từ nền, lọc, đèn cho đến chọn cây và cá.' },
              { to: '/blogs/co2-va-anh-sang', img: '/images/iwagumi.jpg', tag: 'Advanced Tips', tagColor: 'emerald-400', title: 'CO2 Và Ánh Sáng: Bộ Đôi Quyết Định Thành Công', desc: 'Hiểu đúng về ánh sáng và CO2 để cây phát triển khỏe mạnh.' },
              { to: '/blogs/top-10-cay-de-song', img: '/images/planted-tank.jpg', tag: 'Plant Care', tagColor: 'teal-400', title: 'Top 10 Cây Thủy Sinh Dễ Sống Nhất', desc: 'Danh sách cây cực dễ chơi cho người mới bắt đầu.' },
            ].map((blog, i) => (
              <Link key={i} to={blog.to} className="group glass-card rounded-3xl overflow-hidden transition-all duration-500 animate-on-scroll">
                <div className="overflow-hidden h-60">
                  <img src={blog.img} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="p-8">
                  <span className={`text-sm font-body font-semibold text-${blog.tagColor}`}>{blog.tag}</span>
                  <h3 className="text-xl font-headline font-bold text-white mt-3 mb-4 group-hover:text-neon-cyan transition-colors">{blog.title}</h3>
                  <p className="text-gray-400 font-body mb-6">{blog.desc}</p>
                  <div className="flex items-center text-neon-cyan font-body font-semibold">
                    Đọc bài viết <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-16">
            <Link to="/blogs" className="inline-flex items-center px-8 py-4 rounded-full bg-neon-cyan text-abyss font-body font-bold hover:scale-105 transition-all shadow-glow-cyan">
              Xem Tất Cả Blogs <ArrowRightIcon className="w-5 h-5 ml-2"/>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a2828] via-[#061e2e] to-[#051C1C]"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-neon-cyan/5 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        </div>
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-1/4 left-10 text-4xl animate-float-gentle">🐠</div>
          <div className="absolute top-2/3 right-20 text-3xl animate-float-gentle-delayed">🐟</div>
          <div className="absolute bottom-1/4 left-1/3 text-3xl animate-float-gentle">🐡</div>
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="animate-on-scroll space-y-8">
            <div className="inline-block">
              <div className="glass-panel rounded-full px-6 py-2 text-neon-cyan font-body font-semibold text-sm flex items-center space-x-2 animate-bounce-slow">
                <SparklesIcon className="w-5 h-5" /><span>Ưu đãi đặc biệt cho khách hàng mới!</span>
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-headline font-bold text-white leading-tight">
              Sẵn Sàng Tạo Ra<br /><span className="text-coral">Aquascape Mơ Ước?</span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-400 font-body max-w-3xl mx-auto leading-relaxed">
              Khám phá ngay bộ sưu tập đa dạng của chúng tôi và bắt đầu hành trình tạo ra những layout thủy sinh tuyệt đẹp.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link to="/shop" className="group inline-flex items-center justify-center px-10 py-5 text-lg font-body font-bold text-abyss bg-neon-cyan rounded-full hover:bg-neon-teal transform hover:scale-105 transition-all duration-300 shadow-glow-cyan">
                <span className="relative">Mua Ngay</span>
                <ArrowRightIcon className="ml-2 w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
              </Link>
              <button onClick={() => scrollToSection('collections')} className="inline-flex items-center justify-center px-10 py-5 text-lg font-body font-bold text-white glass-panel rounded-full hover:bg-white/10 transition-all duration-300">
                Xem Bộ Sưu Tập
              </button>
            </div>
            <div className="pt-12 flex flex-wrap justify-center gap-8 text-gray-400">
              <div className="flex items-center space-x-2"><ShieldCheckIcon className="w-6 h-6 text-neon-cyan/60" /><span className="text-sm font-body font-medium">Sản phẩm chất lượng</span></div>
              <div className="flex items-center space-x-2"><TruckIcon className="w-6 h-6 text-neon-cyan/60" /><span className="text-sm font-body font-medium">Giao hàng nhanh chóng</span></div>
              <div className="flex items-center space-x-2"><ChatBubbleLeftRightIcon className="w-6 h-6 text-neon-cyan/60" /><span className="text-sm font-body font-medium">Hỗ trợ 24/7</span></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
