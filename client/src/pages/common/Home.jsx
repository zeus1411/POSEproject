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
      <nav className="hidden lg:block fixed left-8 top-1/2 -translate-y-1/2 z-40">
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
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
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
                  Mua Thôi
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
                  src="https://images.unsplash.com/photo-1579967327980-2a4117da0e4a?q=80&w=1149&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
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
      <section id="collections" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <div className="group animate-on-scroll bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-200 transition-colors">
                <BeakerIcon className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Cây Thủy Sinh</h3>
              <p className="text-gray-600 mb-6">
                Bộ sưu tập cây thủy sinh đa dạng từ dễ chăm đến khó, phù hợp cho mọi layout từ Dutch đến Nature.
              </p>
              <Link 
                to={`/shop?category=${encodeURIComponent('66c9b0a1f1e2d3c4a5b6e7f8')}`} 
                className="text-emerald-600 font-medium hover:text-emerald-700 inline-flex items-center"
              >
                Xem thêm <ArrowRightIcon className="ml-1 w-4 h-4" />
              </Link>
            </div>

            {/* Aquarium Fish */}
            <div className="group animate-on-scroll bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-teal-200 transition-colors">
                <LightBulbIcon className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Cá Cảnh</h3>
              <p className="text-gray-600 mb-6">
                Các loài cá nhiệt đới đẹp và khỏe mạnh, được chọn lọc kỹ càng để phù hợp với hệ thống thủy sinh.
              </p>
              <Link 
                to={`/shop?category=${encodeURIComponent('66c9b0a1f1e2d3c4a5b6e7fb')}`} 
                className="text-teal-600 font-medium hover:text-teal-700 inline-flex items-center"
              >
                Xem thêm <ArrowRightIcon className="ml-1 w-4 h-4" />
              </Link>
            </div>

            {/* Accessories */}
            <div className="group animate-on-scroll bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 md:col-span-2 lg:col-span-1">
              <div className="w-16 h-16 bg-cyan-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-cyan-200 transition-colors">
                <SunIcon className="w-8 h-8 text-cyan-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Phụ Kiện</h3>
              <p className="text-gray-600 mb-6">
                Hệ thống lọc, đèn LED, CO2, phân bón và các thiết bị cần thiết cho bể thủy sinh hoàn hảo.
              </p>
              <Link 
               to={`/shop?category=${encodeURIComponent('66c9b0a1f1e2d3c4a5b6e7fc')}`} 
                className="text-cyan-600 font-medium hover:text-cyan-700 inline-flex items-center"
              >
                Xem thêm <ArrowRightIcon className="ml-1 w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tính Năng Nổi Bật
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Hệ thống mua sắm thủy sinh hiện đại với đầy đủ tính năng
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <SunIcon className="w-6 h-6 text-emerald-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Tìm Kiếm Thông Minh</h4>
              <p className="text-sm text-gray-600">Lọc theo loại sản phẩm, giá cả và độ khó chăm sóc</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <LightBulbIcon className="w-6 h-6 text-teal-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Thông Tin Chi Tiết</h4>
              <p className="text-sm text-gray-600">Hướng dẫn chăm sóc và độ tương thích đầy đủ</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
                <StarIcon className="w-6 h-6 text-cyan-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Đánh Giá Sản Phẩm</h4>
              <p className="text-sm text-gray-600">Nhận xét từ cộng đồng aquascaper</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <BeakerIcon className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Trợ Giá Shipping</h4>
              <p className="text-sm text-gray-600">Mua càng cao shiping càng hời</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id="why-us" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-emerald-200 transition-colors">
                <ShieldCheckIcon className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Chất Lượng Đảm Bảo</h3>
              <p className="text-gray-600">
                Cây và cá khỏe mạnh, được tuyển chọn kỹ càng từ những nhà cung cấp uy tín
              </p>
            </div>

            <div className="text-center animate-on-scroll group">
              <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-teal-200 transition-colors">
                <TruckIcon className="w-10 h-10 text-teal-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Vận Chuyển An Toàn</h3>
              <p className="text-gray-600">
                Hệ thống đóng gói chuyên dụng cho thủy sinh, đảm bảo sản phẩm đến tay khách hàng an toàn
              </p>
            </div>

            <div className="text-center animate-on-scroll group">
              <div className="w-20 h-20 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-cyan-200 transition-colors">
                <ChatBubbleLeftRightIcon className="w-10 h-10 text-cyan-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Tư Vấn Chuyên Nghiệp(coming soon)</h3>
              <p className="text-gray-600">
                Đội ngũ chuyên gia hỗ trợ setup layout và giải đáp mọi thắc mắc về thủy sinh
              </p>
            </div>

            <div className="text-center animate-on-scroll group">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-200 transition-colors">
                <SparklesIcon className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Hỗ Trợ Setup(coming soon)</h3>
              <p className="text-gray-600">
                Hướng dẫn chi tiết setup bể từ A-Z, đặc biệt hỗ trợ người mới bắt đầu
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-on-scroll">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Sẵn Sàng Tạo Ra Aquascape Mơ Ước?
            </h2>
            <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
              Khám phá ngay bộ sưu tập đa dạng của chúng tôi và bắt đầu hành trình tạo ra những layout thủy sinh tuyệt đẹp.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center justify-center px-10 py-4 text-lg font-semibold text-emerald-600 bg-white rounded-full hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 shadow-xl hover:shadow-2xl"
            >
              Mua Thôi
              <ArrowRightIcon className="ml-2 w-6 h-6" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;