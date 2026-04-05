import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  SunIcon
} from '@heroicons/react/24/outline';

const Home = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = React.useState('hero');

  // Smooth scroll function
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'collections', 'features', 'why-us'];
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
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Parallax effect on scroll
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

  // Intersection Observer for animations
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

  return (
    <div className="min-h-screen bg-white">
      {/* Floating Navigation Sidebar */}
      <nav className="hidden lg:block fixed left-8 top-1/2 -translate-y-1/2 z-30">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200 p-4">
          <div className="flex flex-col space-y-6">
            <button
              onClick={() => scrollToSection('hero')}
              className="group relative"
              title="Trang chủ"
            >
              <div className={`w-3 h-3 rounded-full transition-all duration-200 ${
                activeSection === 'hero' 
                  ? 'bg-teal-600 ring-4 ring-teal-200' 
                  : 'bg-gray-300 group-hover:bg-teal-400'
              }`}></div>
              <span className="absolute left-8 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Trang chủ
              </span>
            </button>
            <button
              onClick={() => scrollToSection('collections')}
              className="group relative"
              title="Bộ sưu tập"
            >
              <div className={`w-3 h-3 rounded-full transition-all duration-200 ${
                activeSection === 'collections' 
                  ? 'bg-teal-600 ring-4 ring-teal-200' 
                  : 'bg-gray-300 group-hover:bg-teal-400'
              }`}></div>
              <span className="absolute left-8 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Bộ sưu tập
              </span>
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="group relative"
              title="Tính năng"
            >
              <div className={`w-3 h-3 rounded-full transition-all duration-200 ${
                activeSection === 'features' 
                  ? 'bg-teal-600 ring-4 ring-teal-200' 
                  : 'bg-gray-300 group-hover:bg-teal-400'
              }`}></div>
              <span className="absolute left-8 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Tính năng
              </span>
            </button>
            <button
              onClick={() => scrollToSection('why-us')}
              className="group relative"
              title="Ưu điểm"
            >
              <div className={`w-3 h-3 rounded-full transition-all duration-200 ${
                activeSection === 'why-us' 
                  ? 'bg-teal-600 ring-4 ring-teal-200' 
                  : 'bg-gray-300 group-hover:bg-teal-400'
              }`}></div>
              <span className="absolute left-8 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Ưu điểm
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-200/60 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-cyan-200/60 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-teal-200/60 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="hero-content space-y-6 lg:space-y-8 text-center lg:text-left order-2 lg:order-1">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    Aquascaping
                  </span>
                  <br />
                  <span className="font-serif">Excellence</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-600 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                  Khám phá thế giới thủy sinh cao cấp với bộ sưu tập cây nước, cá cảnh và phụ kiện chất lượng. 
                  Tạo nên những layout bể thủy sinh đẹp hoàn hảo cho không gian của bạn.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/shop"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full hover:from-emerald-700 hover:to-teal-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Shopping time
                  <ArrowRightIcon className="ml-2 w-5 h-5" />
                </Link>
                <button
                  onClick={() => scrollToSection('collections')}
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-emerald-600 bg-white border-2 border-emerald-600 rounded-full hover:bg-emerald-50 transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  Tìm Hiểu Thêm
                </button>
              </div>
            </div>

            {/* Right Image */}
            <div className="hero-image relative order-1 lg:order-2">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="/images/FirstImage.jpg"
                  alt="Beautiful Aquascape Layout - Thiết kế thủy sinh đẹp"
                  loading="eager"
                  className="w-full h-[300px] sm:h-[400px] lg:h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <SparklesIcon className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <LightBulbIcon className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Collections Section */}
      <section id="collections" className="py-20 bg-gradient-to-b from-white to-blue-50/30 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-40 h-40 bg-cyan-300 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-blue-300 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Khám Phá Bộ Sưu Tập
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Chúng tôi cung cấp đầy đủ các sản phẩm chất lượng cao cho hobby thủy sinh của bạn
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Aquatic Plants */}
            <div className="group animate-on-scroll relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              <div className="relative h-48 overflow-hidden">
                <img 
                  src="https://www.ugaoo.com/cdn/shop/articles/0e338c1b09.jpg?v=1698991765"
                  alt="Cây thủy sinh"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                <div className="absolute bottom-4 left-4 flex items-center space-x-2">
                  <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                    <BeakerIcon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <span className="text-white font-semibold text-lg">Cây Thủy Sinh</span>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Bộ sưu tập cây thủy sinh đa dạng từ dễ chăm đến khó, phù hợp cho mọi layout từ Dutch đến Nature.
                </p>
                <Link 
                  to={`/shop?category=${encodeURIComponent('66c9b0a1f1e2d3c4a5b6e7f8')}`} 
                  className="inline-flex items-center text-emerald-600 font-semibold hover:text-emerald-700 group/link transition-colors duration-200 cursor-pointer z-10 relative"
                  onClick={(e) => {
                    console.log('Cây thủy sinh link clicked');
                    e.stopPropagation();
                  }}
                >
                  Xem thêm 
                  <ArrowRightIcon className="ml-1 w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Aquarium Fish */}
            <div className="group animate-on-scroll relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              <div className="relative h-48 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?q=80&w=1200&auto=format&fit=crop"
                  alt="Cá cảnh"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                <div className="absolute bottom-4 left-4 flex items-center space-x-2">
                  <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                    <SparklesIcon className="w-6 h-6 text-teal-600" />
                  </div>
                  <span className="text-white font-semibold text-lg">Cá Cảnh</span>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Các loài cá nhiệt đới đẹp và khỏe mạnh, được chọn lọc kỹ càng để phù hợp với hệ thống thủy sinh.
                </p>
                <Link 
                  to={`/shop?category=${encodeURIComponent('66c9b0a1f1e2d3c4a5b6e7f9')}`} 
                  className="inline-flex items-center text-teal-600 font-semibold hover:text-teal-700 group/link transition-colors duration-200 cursor-pointer z-10 relative"
                  onClick={(e) => {
                    console.log('Cá cảnh link clicked');
                    e.stopPropagation();
                  }}
                >
                  Xem thêm 
                  <ArrowRightIcon className="ml-1 w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Accessories */}
            <div className="group animate-on-scroll relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 md:col-span-2 lg:col-span-1">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-sky-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              <div className="relative h-48 overflow-hidden">
                <img 
                  src="https://becathuysinhmini.com/wp-content/uploads/2023/05/phu-kien-be-ca.jpg"
                  alt="Phụ kiện thủy sinh"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                <div className="absolute bottom-4 left-4 flex items-center space-x-2">
                  <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                    <SunIcon className="w-6 h-6 text-cyan-600" />
                  </div>
                  <span className="text-white font-semibold text-lg">Phụ Kiện</span>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Hệ thống lọc, đèn LED, CO2, phân bón và các thiết bị cần thiết cho bể thủy sinh hoàn hảo.
                </p>
                <Link 
                  to={`/shop?category=${encodeURIComponent('66c9b0a1f1e2d3c4a5b6e7fc')}`} 
                  className="inline-flex items-center text-cyan-600 font-semibold hover:text-cyan-700 group/link transition-colors duration-200 cursor-pointer z-10 relative"
                  onClick={(e) => {
                    console.log('Phụ kiện link clicked');
                    e.stopPropagation();
                  }}
                >
                  Xem thêm 
                  <ArrowRightIcon className="ml-1 w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Showcase Gallery Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-teal-500 to-emerald-400 relative overflow-hidden">
        {/* Ocean depth background layers */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-800/30 to-teal-800/50"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-emerald-600/20"></div>
        </div>

        {/* Dynamic underwater elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-16 left-16 w-80 h-80 bg-gradient-to-br from-cyan-300/60 to-blue-400/60 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-24 w-96 h-96 bg-gradient-to-br from-emerald-300/50 to-teal-400/50 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
          <div className="absolute bottom-24 left-1/3 w-72 h-72 bg-gradient-to-br from-blue-300/40 to-cyan-400/40 rounded-full blur-3xl animate-pulse" style={{animationDelay: '3s'}}></div>
          <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-gradient-to-br from-teal-300/35 to-emerald-400/35 rounded-full blur-2xl animate-pulse" style={{animationDelay: '4.5s'}}></div>
        </div>

        {/* Enhanced aquatic decorations */}
        <div className="absolute inset-0 pointer-events-none opacity-25">
          <div className="absolute top-1/4 left-20 animate-float">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="text-white">
              <path d="M40 10C45 20 35 30 40 45C45 30 35 20 40 10Z" fill="currentColor" opacity="0.7"/>
              <path d="M25 35C30 40 20 45 25 55C30 45 20 40 25 35Z" fill="currentColor" opacity="0.5"/>
              <circle cx="40" cy="60" r="12" fill="currentColor" opacity="0.4"/>
              <circle cx="25" cy="65" r="8" fill="currentColor" opacity="0.3"/>
            </svg>
          </div>
          <div className="absolute top-2/3 right-32 animate-float-delayed">
            <svg width="100" height="50" viewBox="0 0 100 50" fill="none" className="text-white">
              <ellipse cx="20" cy="25" rx="18" ry="10" fill="currentColor" opacity="0.6"/>
              <ellipse cx="45" cy="25" rx="15" ry="8" fill="currentColor" opacity="0.5"/>
              <ellipse cx="70" cy="25" rx="12" ry="6" fill="currentColor" opacity="0.4"/>
              <ellipse cx="85" cy="25" rx="8" ry="4" fill="currentColor" opacity="0.3"/>
            </svg>
          </div>
          <div className="absolute bottom-1/4 left-1/4 animate-float">
            <svg width="70" height="70" viewBox="0 0 70 70" fill="none" className="text-white">
              <circle cx="35" cy="35" r="25" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.6"/>
              <circle cx="35" cy="35" r="15" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.4"/>
              <circle cx="35" cy="35" r="8" fill="currentColor" opacity="0.3"/>
              <circle cx="35" cy="35" r="3" fill="currentColor" opacity="0.8"/>
            </svg>
          </div>
          <div className="absolute top-1/3 right-1/4 animate-float-delayed">
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none" className="text-white">
              <path d="M15 45Q30 35 45 45Q30 25 15 45Z" fill="currentColor" opacity="0.5"/>
              <path d="M20 40Q30 32 40 40Q30 28 20 40Z" fill="currentColor" opacity="0.3"/>
            </svg>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-lg">
              Gallery Layout Thủy Sinh
            </h2>
            <p className="text-lg text-blue-50 max-w-3xl mx-auto drop-shadow-md">
              Khám phá những bể thủy sinh đẹp mắt được setup bởi cộng đồng
            </p>
          </div>

          {/* Gallery Grid - Symmetric Layout */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Image 1 */}
            <div className="animate-on-scroll group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500">
              <div className="aspect-[4/3] overflow-hidden">
                <img 
                  src="/images/nature-style.jpg"
                  alt="Nature Aquascape"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <h3 className="text-gray-900 text-lg font-bold mb-1">Nature Style</h3>
                    <p className="text-gray-600 text-sm">Phong cách tự nhiên</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Image 2 */}
            <div className="animate-on-scroll group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500">
              <div className="aspect-[4/3] overflow-hidden">
                <img 
                  src="/images/dutch-style.jpg"
                  alt="Dutch Style"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <h3 className="text-gray-900 text-lg font-bold mb-1">Dutch Style</h3>
                    <p className="text-gray-600 text-sm">Phong cách Hà Lan</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Image 3 */}
            <div className="animate-on-scroll group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500">
              <div className="aspect-[4/3] overflow-hidden">
                <img 
                  src="/images/planted-tank.jpg"
                  alt="Planted Tank"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <h3 className="text-gray-900 text-lg font-bold mb-1">Planted Tank</h3>
                    <p className="text-gray-600 text-sm">Bể thủy sinh trồng cây</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Image 4 */}
            <div className="animate-on-scroll group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500">
              <div className="aspect-[4/3] overflow-hidden">
                <img 
                  src="/images/iwagumi.jpg"
                  alt="Iwagumi Layout"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <h3 className="text-gray-900 text-lg font-bold mb-1">Iwagumi</h3>
                    <p className="text-gray-600 text-sm">Phong cách đá</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Image 5 */}
            <div className="animate-on-scroll group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500">
              <div className="aspect-[4/3] overflow-hidden">
                <img 
                  src="/images/community-tank.jpg"
                  alt="Community Tank"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <h3 className="text-gray-900 text-lg font-bold mb-1">Community Tank</h3>
                    <p className="text-gray-600 text-sm">Bể cộng đồng</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Image 6 */}
            <div className="animate-on-scroll group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500">
              <div className="aspect-[4/3] overflow-hidden">
                <img 
                  src="/images/biotope.jpg"
                  alt="Biotope Aquascape"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <h3 className="text-gray-900 text-lg font-bold mb-1">Biotope</h3>
                    <p className="text-gray-600 text-sm">Sinh cảnh tự nhiên</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-b from-blue-50/30 to-white relative overflow-hidden">
        {/* Animated fish background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="fish-container">
            <div className="fish fish-1">🐠</div>
            <div className="fish fish-2">🐟</div>
            <div className="fish fish-3">🐡</div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tính Năng Nổi Bật
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Hệ thống mua sắm thủy sinh hiện đại với đầy đủ tính năng
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-emerald-200 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                  <SunIcon className="w-8 h-8 text-emerald-600" />
                </div>
                <h4 className="font-bold text-lg text-gray-900 mb-3">Tìm Kiếm Thông Minh</h4>
                <p className="text-sm text-gray-600 leading-relaxed">Lọc theo loại sản phẩm, giá cả và độ khó chăm sóc</p>
              </div>
            </div>

            <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-teal-200 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-teal-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                  <LightBulbIcon className="w-8 h-8 text-teal-600" />
                </div>
                <h4 className="font-bold text-lg text-gray-900 mb-3">Thông Tin Chi Tiết</h4>
                <p className="text-sm text-gray-600 leading-relaxed">Hướng dẫn chăm sóc và độ tương thích đầy đủ</p>
              </div>
            </div>

            <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-cyan-200 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-100 to-cyan-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                  <StarIcon className="w-8 h-8 text-cyan-600" />
                </div>
                <h4 className="font-bold text-lg text-gray-900 mb-3">Đánh Giá Sản Phẩm</h4>
                <p className="text-sm text-gray-600 leading-relaxed">Nhận xét từ cộng đồng aquascaper</p>
              </div>
            </div>

            <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-purple-200 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                  <BeakerIcon className="w-8 h-8 text-purple-600" />
                </div>
                <h4 className="font-bold text-lg text-gray-900 mb-3">Trợ Giá Shipping</h4>
                <p className="text-sm text-gray-600 leading-relaxed">Mua càng cao shipping càng hời</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Aquarium Experience Section */}
      <section className="py-24 bg-gradient-to-b from-teal-900 via-cyan-900 to-blue-900 relative overflow-hidden">
        {/* Animated bubbles */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="bubble"></div>
          <div className="bubble"></div>
          <div className="bubble"></div>
          <div className="bubble"></div>
          <div className="bubble"></div>
          <div className="bubble"></div>
        </div>

        {/* Underwater effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div className="animate-on-scroll space-y-6">
              <div className="inline-block">
                <span className="bg-teal-400/20 text-teal-200 px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm border border-teal-400/30">
                  ✨ Trải Nghiệm Thủy Sinh
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                Đắm Chìm Trong Thế Giới
                <br />
                <span className="bg-gradient-to-r from-teal-300 to-cyan-300 bg-clip-text text-transparent">
                  Aquascape Tuyệt Đẹp
                </span>
              </h2>
              <p className="text-lg text-teal-100 leading-relaxed">
                Mỗi bể thủy sinh là một tác phẩm nghệ thuật sống động. Chúng tôi giúp bạn tạo ra những không gian dưới nước đầy mê hoặc với cây xanh tươi tốt, cá bơi lượn nhẹ nhàng và ánh sáng lung linh.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                  <div className="text-3xl font-bold text-white mb-1">500+</div>
                  <div className="text-teal-200 text-sm">Loài Cây & Cá</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                  <div className="text-3xl font-bold text-white mb-1">1000+</div>
                  <div className="text-teal-200 text-sm">Khách Hàng Hài Lòng</div>
                </div>
              </div>
            </div>

            {/* Right - Aquarium showcase */}
            <div className="animate-on-scroll relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10">
                <img 
                  src="/images/OverviewTank.jpg"
                  alt="Beautiful Aquascape"
                  className="w-full h-[400px] object-cover"
                />
                {/* Overlay effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-teal-900/40 to-transparent"></div>
                
                {/* Floating info cards */}
                <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md rounded-xl p-4 shadow-xl animate-float">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <BeakerIcon className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">Nature Style</div>
                      <div className="text-xs text-gray-600">Amano Inspired</div>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-md rounded-xl p-4 shadow-xl animate-float-delayed">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                      <SparklesIcon className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">Hồ siêu xịn</div>
                      <div className="text-xs text-gray-600">Setup triệu đô</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-4 -left-4 w-20 h-20 bg-cyan-400/30 rounded-full blur-2xl animate-pulse"></div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-teal-400/30 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id="why-us" className="py-20 bg-gradient-to-b from-white to-blue-50/30 relative overflow-hidden">
        {/* Water ripple effect background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-teal-400 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-400 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tại Sao Chọn AquaticPose?
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Chúng tôi cam kết mang đến trải nghiệm mua sắm tốt nhất cho cộng đồng yêu thủy sinh
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center animate-on-scroll group">
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                  <ShieldCheckIcon className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <CheckIcon className="w-5 h-5 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Chất Lượng Đảm Bảo</h3>
              <p className="text-gray-600 leading-relaxed">
                Cây và cá khỏe mạnh, được tuyển chọn kỹ càng từ những nhà cung cấp uy tín
              </p>
            </div>

            <div className="text-center animate-on-scroll group">
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-teal-400 to-teal-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                  <TruckIcon className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center shadow-lg animate-bounce" style={{animationDelay: '0.2s'}}>
                  <CheckIcon className="w-5 h-5 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Vận Chuyển An Toàn</h3>
              <p className="text-gray-600 leading-relaxed">
                Hệ thống đóng gói chuyên dụng cho thủy sinh, đảm bảo sản phẩm đến tay khách hàng an toàn
              </p>
            </div>

            <div className="text-center animate-on-scroll group">
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                  <ChatBubbleLeftRightIcon className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-400 rounded-full flex items-center justify-center shadow-lg animate-bounce" style={{animationDelay: '0.4s'}}>
                  <SparklesIcon className="w-4 h-4 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Tư Vấn Chuyên Nghiệp</h3>
              <p className="text-gray-600 leading-relaxed">
                Đội ngũ chuyên gia hỗ trợ setup layout và giải đáp mọi thắc mắc về thủy sinh
              </p>
             
            </div>

            <div className="text-center animate-on-scroll group">
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-purple-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                  <SparklesIcon className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-pink-400 rounded-full flex items-center justify-center shadow-lg animate-bounce" style={{animationDelay: '0.6s'}}>
                  <LightBulbIcon className="w-4 h-4 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Hỗ Trợ Setup</h3>
              <p className="text-gray-600 leading-relaxed">
                Hướng dẫn chi tiết setup bể từ A-Z, đặc biệt hỗ trợ người mới bắt đầu
              </p>
             
            </div>
          </div>
        </div>
      </section>

      {/* Customer Showcase Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Bể Thủy Sinh Từ Cộng Đồng
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Những layout tuyệt đẹp được tạo ra bởi khách hàng của chúng tôi
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Customer Tank 1 */}
            <div className="group animate-on-scroll">
              <div className="relative overflow-hidden rounded-2xl shadow-xl">
                <img 
                  src="/images/AIimage.jpg"
                  alt="Customer aquascape 1"
                  className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                        A
                      </div>
                      <div>
                        <div className="text-white font-semibold">Anh Tuấn</div>
                        <div className="flex text-yellow-400 text-sm">
                          {'★'.repeat(5)}
                        </div>
                      </div>
                    </div>
                    <p className="text-white text-sm italic">
                      "Cây khỏe, đóng gói cẩn thận. Bể của mình giờ đẹp quá!"
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Tank 2 */}
            <div className="group animate-on-scroll">
              <div className="relative overflow-hidden rounded-2xl shadow-xl">
                <img 
                  src="/images/kingfish.jpg"
                  alt="Customer aquascape 2"
                  className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold">
                        M
                      </div>
                      <div>
                        <div className="text-white font-semibold">Chú Hưng</div>
                        <div className="flex text-yellow-400 text-sm">
                          {'★'.repeat(5)}
                        </div>
                      </div>
                    </div>
                    <p className="text-white text-sm italic">
                      "Cá nhìn nhỏ mà có võ. Sẽ quay lại ủng hộ!"
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Tank 3 */}
            <div className="group animate-on-scroll">
              <div className="relative overflow-hidden rounded-2xl shadow-xl">
                <img 
                  src="/images/beeshrimp.jpg"
                  alt="Customer aquascape 3"
                  className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                        H
                      </div>
                      <div>
                        <div className="text-white font-semibold">Anh Vinh</div>
                        <div className="flex text-yellow-400 text-sm">
                          {'★'.repeat(5)}
                        </div>
                      </div>
                    </div>
                    <p className="text-white text-sm italic">
                      "Tép màu đẹp, trông nghệ cả củ!"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-16 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-3xl p-8 animate-on-scroll">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-emerald-600 mb-2">98%</div>
                <div className="text-gray-600 text-sm">Khách Hàng Hài Lòng</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-teal-600 mb-2">500+</div>
                <div className="text-gray-600 text-sm">Sản Phẩm</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-cyan-600 mb-2">24/7</div>
                <div className="text-gray-600 text-sm">Hỗ Trợ</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">1000+</div>
                <div className="text-gray-600 text-sm">Đơn Hàng</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-32 bg-gradient-to-br from-cyan-600 via-teal-600 to-blue-600 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        {/* Decorative fish */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-1/4 left-10 text-4xl animate-float">🐠</div>
          <div className="absolute top-2/3 right-20 text-3xl animate-float-delayed">🐟</div>
          <div className="absolute bottom-1/4 left-1/3 text-3xl animate-float">🐡</div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="animate-on-scroll space-y-8">
            {/* Decorative badge */}
            <div className="inline-block">
              <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-6 py-2 text-white font-semibold text-sm flex items-center space-x-2 animate-bounce">
                <SparklesIcon className="w-5 h-5" />
                <span>Ưu đãi đặc biệt cho khách hàng mới!</span>
              </div>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Sẵn Sàng Tạo Ra
              <br />
              <span className="bg-gradient-to-r from-yellow-200 to-orange-200 bg-clip-text text-transparent">
                Aquascape Mơ Ước?
              </span>
            </h2>

            <p className="text-xl md:text-2xl text-emerald-50 max-w-3xl mx-auto leading-relaxed">
              Khám phá ngay bộ sưu tập đa dạng của chúng tôi và bắt đầu hành trình tạo ra những layout thủy sinh tuyệt đẹp.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link
                to="/shop"
                className="group inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-emerald-600 bg-white rounded-full hover:bg-gray-50 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-3xl relative overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-yellow-200 to-orange-200 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                <span className="relative">Mua Ngay</span>
                <ArrowRightIcon className="ml-2 w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
              </Link>

              <button
                onClick={() => scrollToSection('collections')}
                className="inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-white bg-white/10 backdrop-blur-md border-2 border-white/30 rounded-full hover:bg-white/20 transition-all duration-300 shadow-xl hover:shadow-2xl"
              >
                Xem Bộ Sưu Tập
              </button>
            </div>

            {/* Trust indicators */}
            <div className="pt-12 flex flex-wrap justify-center gap-8 text-white/90">
              <div className="flex items-center space-x-2">
                <ShieldCheckIcon className="w-6 h-6" />
                <span className="text-sm font-medium">Sản phẩm chất lượng</span>
              </div>
              <div className="flex items-center space-x-2">
                <TruckIcon className="w-6 h-6" />
                <span className="text-sm font-medium">Giao hàng nhanh chóng</span>
              </div>
              <div className="flex items-center space-x-2">
                <ChatBubbleLeftRightIcon className="w-6 h-6" />
                <span className="text-sm font-medium">Hỗ trợ 24/7</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white" fillOpacity="0.1"/>
          </svg>
        </div>
      </section>
    </div>
  );
};

export default Home;