import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  NewspaperIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CurrencyDollarIcon,
  ClipboardDocumentCheckIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';

const CATEGORY_IDS = {
  plants: '66c9b0a1f1e2d3c4a5b6e7f8',
  fish: '66c9b0a1f1e2d3c4a5b6e7f9',
  accessories: '66c9b0a1f1e2d3c4a5b6e7fc',
};

const navDots = [
  { id: 'hero', label: 'Trang chủ' },
  { id: 'collections', label: 'Bộ sưu tập' },
  { id: 'experience', label: 'Trải nghiệm' },
  { id: 'why-us', label: 'Ưu điểm' },
  { id: 'community', label: 'Cộng đồng' },
  { id: 'blogs', label: 'Blogs' },
];

const collections = [
  {
    title: 'Cây thủy sinh',
    subtitle: 'Layout xanh sống động',
    description: 'Từ cây tiền cảnh dễ chăm đến cây hậu cảnh rực màu, phù hợp cả bể mới setup lẫn layout chuyên sâu.',
    image: 'https://www.ugaoo.com/cdn/shop/articles/0e338c1b09.jpg?v=1698991765',
    icon: BeakerIcon,
    href: `/shop?category=${encodeURIComponent(CATEGORY_IDS.plants)}`,
  },
  {
    title: 'Cá cảnh',
    subtitle: 'Khỏe, đẹp, dễ phối đàn',
    description: 'Các dòng cá nhiệt đới được chọn lọc theo màu sắc, tập tính và khả năng hòa hợp với bể thủy sinh.',
    image: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?q=80&w=1200&auto=format&fit=crop',
    icon: SparklesIcon,
    href: `/shop?category=${encodeURIComponent(CATEGORY_IDS.fish)}`,
  },
  {
    title: 'Phụ kiện',
    subtitle: 'Thiết bị cho bể ổn định',
    description: 'Lọc, đèn LED, CO2, phân nền, phân nước và dụng cụ bảo dưỡng giúp hệ sinh thái vận hành bền vững.',
    image: 'https://becathuysinhmini.com/wp-content/uploads/2023/05/phu-kien-be-ca.jpg',
    icon: SunIcon,
    href: `/shop?category=${encodeURIComponent(CATEGORY_IDS.accessories)}`,
  },
];

const galleryItems = [
  { src: '/images/nature-style.jpg', title: 'Nature Style', sub: 'Phong cách tự nhiên' },
  { src: '/images/dutch-style.jpg', title: 'Dutch Style', sub: 'Bố cục cây rực màu' },
  { src: '/images/planted-tank.jpg', title: 'Planted Tank', sub: 'Bể trồng cây cân bằng' },
  { src: '/images/iwagumi.jpg', title: 'Iwagumi', sub: 'Đá, khoảng trống, nhịp thở' },
  { src: '/images/community-tank.jpg', title: 'Community Tank', sub: 'Bể cộng đồng hài hòa' },
  { src: '/images/biotope.jpg', title: 'Biotope', sub: 'Sinh cảnh gần tự nhiên' },
];

const whyUs = [
  {
    icon: ShieldCheckIcon,
    title: 'Chọn lọc kỹ',
    desc: 'Sản phẩm kiểm duyệt chất lượng trước khi lên kệ.',
    image: 'https://images.unsplash.com/photo-1571752726703-5e7d1f6a986d?w=600&auto=format&fit=crop&q=80',
  },
  {
    icon: TruckIcon,
    title: 'Giao an toàn',
    desc: 'Đóng gói chuyên biệt cho cây và cá sống.',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&auto=format&fit=crop&q=80',
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: 'Hỗ trợ nhanh',
    desc: 'Tư vấn setup và chăm sóc bể mọi lúc.',
    image: 'https://images.unsplash.com/photo-1559827291-bae6b24a1ce2?w=600&auto=format&fit=crop&q=80',
  },
  {
    icon: SparklesIcon,
    title: 'Ý tưởng mới',
    desc: 'Blog & bộ sưu tập giúp bạn bắt đầu dễ hơn.',
    image: 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=600&auto=format&fit=crop&q=80',
  },
  {
    icon: HeartIcon,
    title: 'Nghệ thuật sống',
    desc: 'Biến không gian sống thành một tác phẩm nghệ thuật tự nhiên.',
    image: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=600&auto=format&fit=crop&q=80',
  },
];

const honeycombPositions = [
  {
    left: '0px',
    top: '0px',
    className: 'float-slow-1',
  },
  {
    left: 'calc(var(--hex-w) + var(--hex-gap-x))',
    top: '0px',
    className: 'float-slow-2',
  },
  {
    left: 'calc(2 * (var(--hex-w) + var(--hex-gap-x)))',
    top: '0px',
    className: 'float-slow-3',
  },
  {
    left: 'calc((var(--hex-w) + var(--hex-gap-x)) / 2)',
    top: 'calc(var(--hex-h) * 0.75 + var(--hex-gap-y))',
    className: 'float-slow-3',
  },
  {
    left: 'calc((var(--hex-w) + var(--hex-gap-x)) * 1.5)',
    top: 'calc(var(--hex-h) * 0.75 + var(--hex-gap-y))',
    className: 'float-slow-1',
  },
];

const communityLayouts = [
  { src: '/images/AIimage.jpg', name: 'Anh Tuấn', initial: 'T', review: 'Cây khỏe, đóng gói kỹ. Bể sau vài tuần lên form rất ổn.' },
  { src: '/images/kingfish.jpg', name: 'Chú Hưng', initial: 'H', review: 'Cá đẹp, bơi khỏe và màu lên tốt hơn mong đợi.' },
  { src: '/images/beeshrimp.jpg', name: 'Anh Vinh', initial: 'V', review: 'Tép màu đẹp, phụ kiện dễ dùng, tư vấn cũng nhanh.' },
];

const blogs = [
  {
    to: '/blogs/setup-be-thuy-sinh-cho-nguoi-moi',
    img: '/images/nature-style.jpg',
    tag: 'Beginner Guide',
    title: 'Cách setup bể thủy sinh cho người mới',
    desc: 'Các bước chọn nền, lọc, đèn, cây và cá để bể mới ổn định hơn.',
  },
  {
    to: '/blogs/co2-va-anh-sang',
    img: '/images/iwagumi.jpg',
    tag: 'Advanced Tips',
    title: 'CO2 và ánh sáng: bộ đôi quyết định',
    desc: 'Hiểu đúng vai trò của ánh sáng và CO2 để cây phát triển khỏe.',
  },
  {
    to: '/blogs/top-10-cay-de-song',
    img: '/images/planted-tank.jpg',
    tag: 'Plant Care',
    title: 'Top cây thủy sinh dễ sống cho người mới',
    desc: 'Những lựa chọn bền, đẹp và ít đòi hỏi kỹ thuật chăm sóc phức tạp.',
  },
];

/* ── tiny fade-up wrapper ── */
const Reveal = ({ children, className = '', delay = 0 }) => (
  <div
    className={`animate-on-scroll ${className}`}
    style={{ transitionDelay: `${delay}ms` }}
  >
    {children}
  </div>
);

const Home = () => {
  const [activeSection, setActiveSection] = React.useState('hero');
  const prefersReducedMotion = useReducedMotion();

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  /* ── scroll-spy ── */
  useEffect(() => {
    const handleScroll = () => {
      const sections = navDots.map((d) => d.id);
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

  /* ── parallax hero text ── */
  useEffect(() => {
    if (prefersReducedMotion) return undefined;

    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const heroContent = document.querySelector('.hero-content');
      if (heroContent) {
        heroContent.style.transform = `translateY(${scrolled * 0.08}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prefersReducedMotion]);

  /* ── intersection observer ── */
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
      rootMargin: '0px 0px -50px 0px',
    });

    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const marqueeItems = galleryItems.concat(galleryItems);

  return (
    <div className="home-page min-h-screen bg-background text-foreground">

      {/* ═══════════════ NAV DOTS ═══════════════ */}
      <nav className="fixed left-5 top-1/2 z-30 hidden -translate-y-1/2 lg:block">
        <div className="glass-panel rounded-2xl p-3">
          <div className="flex flex-col gap-5">
            {navDots.map((dot) => (
              <button key={dot.id} onClick={() => scrollToSection(dot.id)} className="group relative" title={dot.label}>
                <span
                  className={`block h-3 w-3 rounded-full transition-all duration-300 ${
                    activeSection === dot.id
                      ? 'bg-neon-cyan ring-4 ring-neon-cyan/30 shadow-glow-cyan'
                      : 'bg-gray-600 group-hover:bg-neon-cyan/70'
                  }`}
                />
                <span className="absolute left-8 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg border border-neon-cyan/20 bg-abyss/90 px-3 py-1.5 font-body text-xs text-neon-cyan opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100">
                  {dot.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* ═══════════════ HERO ═══════════════ */}
      <section id="hero" className="relative flex min-h-screen items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video
            src="https://res.cloudinary.com/dxtrwinoc/video/upload/v1779354346/311063_gt5toe.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(0,255,209,0.20),transparent_32%),linear-gradient(90deg,rgba(5,28,28,0.86),rgba(5,28,28,0.58),rgba(5,28,28,0.82))]" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
        </div>

        <div className="hero-content relative z-10 mx-auto flex w-full max-w-6xl justify-center px-4 py-24 text-center sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/20 px-4 py-2 font-body text-xs font-bold uppercase tracking-[0.22em] text-cyan-50 shadow-glass backdrop-blur-md">
              <SparklesIcon className="h-4 w-4 text-neon-cyan" />
              AquaticPose
            </div>
            <h1 className="font-headline text-5xl font-bold leading-[0.95] text-white drop-shadow-[0_8px_30px_rgba(0,0,0,0.55)] md:text-7xl lg:text-8xl">
              Thực hiện ước mơ
              <span className="block bg-gradient-to-r from-neon-cyan via-emerald-300 to-cyan-200 bg-clip-text text-transparent">
                thủy sinh
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-3xl font-body text-base font-medium leading-8 text-cyan-50/90 drop-shadow-[0_3px_18px_rgba(0,0,0,0.55)] md:text-xl">
              Khám phá cây nước, cá cảnh và phụ kiện chất lượng để tạo nên một layout bể thủy sinh hài hòa,
              ổn định và đúng gu của bạn.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/shop"
                className="group inline-flex w-full items-center justify-center rounded-full bg-primary px-8 py-4 font-body text-base font-bold text-primary-foreground shadow-glow-cyan transition-all duration-300 hover:-translate-y-1 hover:bg-primary-hover sm:w-auto"
              >
                Mua sắm ngay
                <ArrowRightIcon className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <button
                onClick={() => scrollToSection('collections')}
                className="inline-flex w-full items-center justify-center rounded-full border border-white/30 bg-white/10 px-8 py-4 font-body text-base font-bold text-white shadow-glass backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-white/18 sm:w-auto"
              >
                Khám phá bộ sưu tập
              </button>
              <Link
                to="/blogs"
                className="group inline-flex w-full items-center justify-center rounded-full border border-white/20 bg-black/20 px-8 py-4 font-body text-base font-bold text-white shadow-glass backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-white/14 sm:w-auto"
              >
                <NewspaperIcon className="mr-2 h-5 w-5 text-neon-cyan" />
                Xem blog setup
                <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ COLLECTIONS ═══════════════ */}
      <section id="collections" className="relative overflow-hidden py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-[#051C1C] via-[#0a2828] to-[#051C1C]" />
        <div className="absolute inset-0 opacity-50 [background:radial-gradient(circle_at_50%_0%,rgba(0,255,209,0.16),transparent_34%)]" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section header — editorial style */}
          <Reveal>
            <div className="mb-16 max-w-3xl">
              <p className="mb-4 font-body text-xs font-bold uppercase tracking-[0.3em] text-neon-cyan">
                Bộ sưu tập
              </p>
              <h2 className="font-headline text-4xl font-bold leading-tight text-white md:text-6xl">
                Khám phá
                <span className="block text-white/60">bộ sưu tập</span>
              </h2>
              <div className="mt-6 h-px w-20 bg-neon-cyan/40" />
              <p className="mt-6 max-w-xl font-body text-base leading-relaxed text-gray-400 md:text-lg">
                Ba mảnh ghép chính cho một bể thủy sinh đẹp — cây, cá và phụ kiện.
              </p>
            </div>
          </Reveal>

          {/* 3-col editorial grid */}
          <div className="grid gap-6 md:grid-cols-3">
            {collections.map((item, i) => (
              <Reveal key={item.title} delay={i * 120}>
                <Link
                  to={item.href}
                  className="group relative block overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-all duration-500 hover:border-neon-cyan/30 hover:bg-white/[0.06]"
                >
                  {/* image */}
                  <div className="relative h-72 overflow-hidden sm:h-80">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#051C1C] via-[#051C1C]/40 to-transparent" />
                    {/* icon badge */}
                    <div className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-black/30 text-neon-cyan backdrop-blur-md transition-transform duration-500 group-hover:scale-110">
                      <item.icon className="h-5 w-5" />
                    </div>
                  </div>

                  {/* text */}
                  <div className="p-6">
                    <p className="mb-2 font-body text-[11px] font-bold uppercase tracking-[0.25em] text-neon-cyan/70">
                      {item.subtitle}
                    </p>
                    <h3 className="font-headline text-2xl font-bold text-white transition-colors group-hover:text-neon-cyan">
                      {item.title}
                    </h3>
                    <p className="mt-3 font-body text-sm leading-relaxed text-gray-400">
                      {item.description}
                    </p>
                    <div className="mt-5 inline-flex items-center font-body text-sm font-semibold text-neon-cyan/80 transition-colors group-hover:text-neon-cyan">
                      Khám phá
                      <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-2" />
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ MARQUEE GALLERY ═══════════════ */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-[#061e2e] via-[#0a2a2a] to-[#051C1C]" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mb-12 max-w-2xl">
              <p className="mb-4 font-body text-xs font-bold uppercase tracking-[0.3em] text-neon-cyan">
                Cảm hứng layout
              </p>
              <h2 className="font-headline text-3xl font-bold leading-tight text-white md:text-5xl">
                Dòng chảy aquascape
              </h2>
              <p className="mt-4 font-body text-base leading-relaxed text-gray-400">
                Lướt qua các phong cách bể phổ biến để tìm cảm hứng cho layout của bạn.
              </p>
            </div>
          </Reveal>

          <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-black/15 px-4 py-6 backdrop-blur-sm sm:px-6">
            <motion.div
              className="flex w-max gap-4 will-change-transform sm:gap-5"
              animate={prefersReducedMotion ? { x: 0 } : { x: ['0%', '-50%'] }}
              transition={{ duration: prefersReducedMotion ? 0 : 34, ease: 'linear', repeat: Infinity }}
            >
              {marqueeItems.map((item, i) => (
                <motion.div
                  key={`${item.title}-${i}`}
                  whileHover={prefersReducedMotion ? undefined : { y: -8, scale: 1.02 }}
                  transition={{ duration: 0.35 }}
                  className="group relative h-[22rem] w-[15rem] shrink-0 overflow-hidden rounded-2xl border border-white/8 sm:w-[18rem]"
                >
                  <img src={item.src} alt={item.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <p className="font-body text-[10px] font-bold uppercase tracking-[0.3em] text-neon-cyan/60">Aquascape</p>
                    <h3 className="mt-2 font-headline text-2xl font-semibold text-white">{item.title}</h3>
                    <p className="mt-1 font-body text-sm text-white/55">{item.sub}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════ AQUATIC EXPERIENCE ═══════════════ */}
      <section id="experience" className="relative overflow-hidden py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a2828] via-[#061e2e] to-[#051C1C]" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="bubble" />
          <div className="bubble" />
          <div className="bubble" />
          <div className="bubble" />
          <div className="bubble" />
          <div className="bubble" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Top: big heading + image — asymmetric */}
          <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.1fr]">
            <Reveal>
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-neon-cyan/20 bg-neon-cyan/[0.06] px-4 py-2 font-body text-sm font-bold text-neon-cyan backdrop-blur-sm">
                  <BeakerIcon className="h-5 w-5" />
                  Trải nghiệm thủy sinh
                </span>

                <h2 className="mt-8 font-headline text-4xl font-bold leading-[1.1] text-white md:text-5xl lg:text-6xl">
                  Từ ý tưởng nhỏ
                  <span className="block text-white/50">đến một bể cá</span>
                  <span className="block text-white">có chiều sâu</span>
                </h2>

                <div className="mt-8 h-px w-16 bg-gradient-to-r from-neon-cyan/60 to-transparent" />

                <p className="mt-6 max-w-md font-body text-base leading-8 text-gray-400 md:text-lg">
                  Trang chủ được gom lại theo hành trình: chọn cảm hứng, tìm sản phẩm, đọc hướng dẫn và mua hàng với hỗ trợ rõ ràng.
                </p>

                {/* Stats inline */}
                <div className="mt-10 flex gap-8">
                  {[
                    { val: '500+', label: 'Sản phẩm' },
                    { val: '24/7', label: 'Hỗ trợ online' },
                  ].map((s) => (
                    <div key={s.label}>
                      <div className="font-headline text-4xl font-bold text-white">{s.val}</div>
                      <div className="mt-1 font-body text-sm font-semibold text-neon-cyan/70">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div className="relative">
                <div className="overflow-hidden rounded-2xl border border-white/10">
                  <img
                    src="/images/OverviewTank.jpg"
                    alt="Bể thủy sinh layout nature style"
                    className="h-[26rem] w-full object-cover transition-transform duration-700 hover:scale-[1.03] sm:h-[30rem]"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-[#051C1C]/60 via-transparent to-transparent" />
                </div>

                {/* Floating card */}
                <div className="glass-panel absolute -bottom-6 -left-4 rounded-2xl p-4 sm:left-auto sm:-bottom-6 sm:right-6 sm:w-64">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neon-cyan/10 text-neon-cyan">
                      <HeartIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-body font-bold text-white">Nature Style</div>
                      <div className="font-body text-xs text-gray-400">Gợi ý bố cục tự nhiên</div>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Bottom quote — italic accent */}
          <Reveal delay={300}>
            <div className="mt-20 flex justify-end">
              <blockquote className="max-w-lg border-l-2 border-neon-cyan/30 pl-6">
                <p className="font-body text-base italic leading-relaxed text-gray-300 md:text-lg">
                  Mỗi bể cá là một hệ sinh thái thu nhỏ. Từ ánh sáng, dòng nước cho đến từng cành cây — tất cả cùng kể một câu chuyện riêng.
                </p>
              </blockquote>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════ WHY US — split layout ═══════════════ */}
      <section id="why-us" className="relative overflow-hidden py-24 lg:py-32">
        {/* Deep, glowing ambient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#051C1C] to-[#0a2828]" />
        
        {/* Artistic glowing radial lights in the background for a modern neon depth */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-neon-cyan/5 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-8 items-center">
            
            {/* Left side: Artistic text layout */}
            <div className="lg:col-span-5 space-y-8 text-left max-w-xl mx-auto lg:mx-0">
              <Reveal>
                <div className="inline-flex items-center gap-3">
                  <span className="h-[1px] w-8 bg-neon-cyan/60" />
                  <p className="font-body text-[11px] font-bold uppercase tracking-[0.3em] text-neon-cyan">
                    Vì sao chọn chúng tôi
                  </p>
                </div>
              </Reveal>

              <Reveal delay={100}>
                <h2 className="font-headline text-4xl sm:text-5xl font-extrabold leading-[1.15] text-white tracking-tight">
                  Nơi Đam Mê
                  <span className="block mt-1 font-headline font-light italic text-gray-300">Gặp Gỡ</span>
                  <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan via-emerald-400 to-teal-400 drop-shadow-[0_2px_10px_rgba(0,255,209,0.15)]">
                    Thiên Nhiên
                  </span>
                </h2>
              </Reveal>

              <Reveal delay={200}>
                <div className="space-y-4 font-body text-sm sm:text-base leading-relaxed text-gray-300">
                  <p>
                    Tại <strong className="text-white font-semibold">AquaticPose</strong>, chúng tôi không chỉ đơn thuần cung cấp phụ kiện. Mỗi sản phẩm được tuyển chọn là một viên gạch xây dựng nên một hệ sinh thái thu nhỏ bền vững.
                  </p>
                  <p className="text-gray-400">
                    Chúng tôi mang đến giải pháp toàn diện từ cảm hứng thiết kế, đóng gói an toàn đến sự tư vấn tận tình, giúp hành trình chinh phục nghệ thuật thủy sinh của bạn trở nên đơn giản và đầy cảm xúc.
                  </p>
                </div>
              </Reveal>

              <Reveal delay={300}>
                <div className="pt-4 flex flex-wrap gap-x-6 gap-y-4 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-neon-cyan animate-pulse" />
                    <span className="font-body text-xs font-semibold uppercase tracking-wider text-gray-300">5+ Giá trị cốt lõi</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <span className="font-body text-xs">Di chuột vào các mảnh ghép để khám phá</span>
                  </div>
                </div>
              </Reveal>
            </div>

            {/* Right side: 5-hexagon honeycomb cluster */}
            <div className="lg:col-span-7 flex justify-center lg:justify-end">
              <Reveal delay={200}>
                <div className="hex-honeycomb">
                  {whyUs.map((item, i) => {
                    const pos = honeycombPositions[i];
                    return (
                      <div
                        key={item.title}
                        className={`absolute hex-flip-card group ${pos.className}`}
                        style={{
                          left: pos.left,
                          top: pos.top,
                          transition: 'all 0.5s ease',
                        }}
                      >
                        <div className="hex-flip-inner">
                          {/* FRONT */}
                          <div className="hex-flip-front">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#051C1C]/90 via-[#051C1C]/35 to-transparent" />
                            <div className="absolute inset-x-0 bottom-6 text-center">
                              <div className="mx-auto mb-2 flex h-9.5 w-9.5 items-center justify-center rounded-lg border border-white/15 bg-black/25 text-neon-cyan backdrop-blur-sm">
                                <item.icon className="h-[18px] w-[18px]" />
                              </div>
                              <h3 className="px-3 font-body text-xs sm:text-[13px] font-bold uppercase tracking-[0.12em] text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                                {item.title}
                              </h3>
                            </div>
                          </div>

                          {/* BACK */}
                          <div className="hex-flip-back">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(0,255,209,0.15),transparent_55%)]" />
                            <div className="relative flex flex-col items-center justify-center p-4 text-center">
                              <div className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-lg border border-neon-cyan/20 bg-neon-cyan/10 text-neon-cyan">
                                <item.icon className="h-5 w-5" />
                              </div>
                              <h3 className="font-body text-xs sm:text-[13px] font-bold uppercase tracking-wider text-white">
                                {item.title}
                              </h3>
                              <p className="mt-1.5 font-body text-[10px] sm:text-[11px] leading-relaxed text-cyan-50/70 max-w-[125px] sm:max-w-[155px]">
                                {item.desc}
                              </p>
                            </div>
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>
              </Reveal>
            </div>

          </div>
        </div>
      </section>


      {/* ═══════════════ COMMUNITY ═══════════════ */}
      <section id="community" className="relative overflow-hidden py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a2828] via-[#061e2e] to-[#051C1C]" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <p className="mb-4 font-body text-xs font-bold uppercase tracking-[0.3em] text-neon-cyan">
                Cộng đồng
              </p>
              <h2 className="font-headline text-4xl font-bold leading-tight text-white md:text-5xl">
                Một vài layout
                <span className="block text-white/55">từ khách hàng</span>
              </h2>
              <p className="mt-4 font-body text-base leading-relaxed text-gray-400">
                Ảnh thật và phản hồi ngắn gọn từ cộng đồng AquaticPose.
              </p>
            </div>
          </Reveal>

          {/* 3 review cards */}
          <div className="grid gap-6 md:grid-cols-3">
            {communityLayouts.map((item, i) => (
              <Reveal key={item.name} delay={i * 120}>
                <div className="group overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] transition-all duration-500 hover:border-white/15 hover:bg-white/[0.06]">
                  {/* Image */}
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={item.src}
                      alt={`Layout thủy sinh của ${item.name}`}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#051C1C] via-[#051C1C]/30 to-transparent" />
                  </div>

                  {/* Review */}
                  <div className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neon-cyan/10 font-body text-sm font-bold text-neon-cyan">
                        {item.initial}
                      </div>
                      <div>
                        <div className="font-body text-sm font-bold text-white">{item.name}</div>
                        <div className="flex gap-0.5 text-yellow-400">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <StarIcon key={idx} className="h-3.5 w-3.5 fill-current" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="mt-4 font-body text-sm leading-relaxed text-gray-400">
                      "{item.review}"
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Stats bar */}
          <Reveal delay={400}>
            <div className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/8 bg-white/[0.04] sm:grid-cols-4">
              {[
                { val: '98%', label: 'Khách hài lòng' },
                { val: '500+', label: 'Sản phẩm' },
                { val: '24/7', label: 'Hỗ trợ' },
                { val: '1000+', label: 'Đơn đã xử lý' },
              ].map((stat, i) => (
                <div key={stat.label} className="p-6 text-center transition-colors duration-300 hover:bg-white/[0.03]">
                  <div className="font-headline text-3xl font-bold text-neon-cyan md:text-4xl">{stat.val}</div>
                  <div className="mt-2 font-body text-xs font-semibold uppercase tracking-[0.15em] text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════ BLOGS ═══════════════ */}
      <section id="blogs" className="relative overflow-hidden py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-[#051C1C] to-[#0a2828]" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mb-14 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
              <div className="max-w-xl">
                <p className="mb-4 font-body text-xs font-bold uppercase tracking-[0.3em] text-neon-cyan">
                  Blog setup
                </p>
                <h2 className="font-headline text-4xl font-bold leading-tight text-white md:text-5xl">
                  Hướng dẫn ngắn gọn
                  <span className="block text-white/55">để bể ổn định hơn</span>
                </h2>
              </div>
              <Link
                to="/blogs"
                className="group inline-flex shrink-0 items-center font-body text-sm font-bold text-neon-cyan transition-colors hover:text-white"
              >
                Xem tất cả
                <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-2" />
              </Link>
            </div>
          </Reveal>

          {/* 1 featured + 2 side — editorial blog layout */}
          <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            {/* Featured */}
            <Reveal>
              <Link
                to={blogs[0].to}
                className="group relative block h-full overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] transition-all duration-500 hover:border-neon-cyan/25"
              >
                <div className="relative h-72 overflow-hidden sm:h-80 lg:h-full lg:min-h-[26rem]">
                  <img src={blogs[0].img} alt={blogs[0].title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#051C1C] via-[#051C1C]/50 to-transparent" />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                  <span className="inline-block rounded-full border border-neon-cyan/25 bg-neon-cyan/[0.08] px-3 py-1 font-body text-xs font-bold uppercase tracking-wider text-neon-cyan">
                    {blogs[0].tag}
                  </span>
                  <h3 className="mt-4 font-headline text-2xl font-bold text-white transition-colors group-hover:text-neon-cyan md:text-3xl">
                    {blogs[0].title}
                  </h3>
                  <p className="mt-3 max-w-md font-body text-sm leading-relaxed text-gray-400">
                    {blogs[0].desc}
                  </p>
                  <div className="mt-5 inline-flex items-center font-body text-sm font-bold text-neon-cyan/80 transition-colors group-hover:text-neon-cyan">
                    Đọc bài viết
                    <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-2" />
                  </div>
                </div>
              </Link>
            </Reveal>

            {/* 2 stacked */}
            <div className="grid gap-6">
              {blogs.slice(1).map((blog, i) => (
                <Reveal key={blog.to} delay={(i + 1) * 150}>
                  <Link
                    to={blog.to}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] transition-all duration-500 hover:border-neon-cyan/25 sm:flex-row"
                  >
                    <div className="h-48 w-full shrink-0 overflow-hidden sm:h-auto sm:w-44">
                      <img src={blog.img} alt={blog.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    </div>
                    <div className="flex flex-col justify-center p-5">
                      <span className="mb-2 w-fit font-body text-[11px] font-bold uppercase tracking-[0.2em] text-neon-cyan/70">
                        {blog.tag}
                      </span>
                      <h3 className="font-headline text-lg font-bold text-white transition-colors group-hover:text-neon-cyan">
                        {blog.title}
                      </h3>
                      <p className="mt-2 font-body text-sm leading-relaxed text-gray-400">
                        {blog.desc}
                      </p>
                      <div className="mt-4 inline-flex items-center font-body text-sm font-bold text-neon-cyan/70 transition-colors group-hover:text-neon-cyan">
                        Đọc thêm
                        <ArrowRightIcon className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ CTA ═══════════════ */}
      <section className="relative overflow-hidden py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a2828] via-[#061e2e] to-[#051C1C]" />
        <div className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_50%_50%,rgba(0,255,209,0.18),transparent_40%)]" />

        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="font-headline text-4xl font-bold leading-tight text-white md:text-6xl">
              Sẵn sàng tạo
              <span className="block bg-gradient-to-r from-neon-cyan via-emerald-300 to-cyan-200 bg-clip-text text-transparent">
                aquascape mơ ước?
              </span>
            </h2>
            <p className="mx-auto mt-6 max-w-2xl font-body text-base leading-relaxed text-gray-400 md:text-lg">
              Bắt đầu từ bộ sưu tập chính, chọn đúng sản phẩm và để hệ thống hỗ trợ bạn trong từng bước mua hàng.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/shop"
                className="group inline-flex w-full items-center justify-center rounded-full bg-primary px-9 py-4 font-body text-lg font-bold text-primary-foreground shadow-glow-cyan transition-all duration-300 hover:-translate-y-1 hover:bg-primary-hover sm:w-auto"
              >
                Mua ngay
                <ArrowRightIcon className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-2" />
              </Link>
              <button
                onClick={() => scrollToSection('collections')}
                className="glass-panel inline-flex w-full items-center justify-center rounded-full px-9 py-4 font-body text-lg font-bold text-white transition-all duration-300 hover:-translate-y-1 sm:w-auto"
              >
                Xem bộ sưu tập
              </button>
            </div>

            <div className="mt-10 flex flex-wrap justify-center gap-4">
              {[
                { icon: CheckIcon, label: 'Sản phẩm rõ thông tin' },
                { icon: TruckIcon, label: 'Theo dõi vận chuyển' },
                { icon: ChatBubbleLeftRightIcon, label: 'Hỗ trợ khi mua' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 font-body text-sm text-gray-400">
                  <item.icon className="h-4 w-4 text-neon-cyan" />
                  {item.label}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
};

export default Home;
