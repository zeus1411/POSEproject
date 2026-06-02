import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRightIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  CubeIcon,
  HeartIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  StarIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';

const CATEGORY_IDS = {
  plants: '66c9b0a1f1e2d3c4a5b6e7f8',
  fish: '66c9b0a1f1e2d3c4a5b6e7f9',
  accessories: '66c9b0a1f1e2d3c4a5b6e7fc',
};

const collections = [
  {
    title: 'Cây thuỷ sinh',
    label: 'Nhấn thêm sắc đỏ cho bể',
    description: 'Tu cay tien canh den cay hau canh, duoc chon theo do khoe, toc do phat trien va kha nang len form.',
    image: '/images/HoangNamtank.jpg',
    href: `/shop?category=${encodeURIComponent(CATEGORY_IDS.plants)}`,
    cta: 'Khám phá cây',
  },
  {
    title: 'Sinh vật cảnh',
    label: 'Thổi hồn vào hệ sinh thái',
    description: 'Những loài cá và tép cảnh nổi bật với màu sắc cuốn hút, góp phần tạo nên một không gian sống động và cân bằng cho bể thủy sinh.',
    image: '/images/Fish-hompage.png',
    href: `/shop?category=${encodeURIComponent(CATEGORY_IDS.fish)}`,
    cta: 'Xem sinh vật',
  },
  {
    title: 'Phụ kiện',
    label: 'Nền tảng cho một bể cá ổn định',
    description: 'Từ hệ thống lọc, đèn chiếu sáng đến CO₂ và dụng cụ chăm sóc, mọi thiết bị cần thiết để duy trì một bể thủy sinh khỏe mạnh đều có tại đây.',
    image: '/images/bo-dung-cu-ve-sinh-homepage.webp',
    href: `/shop?category=${encodeURIComponent(CATEGORY_IDS.accessories)}`,
    cta: 'Xem thiết bị',
  },
];

const inspirationLayouts = [
  {
    title: 'Nature Style',
    tag: 'Tu nhien, sau, mem',
    image: '/images/nature-style.jpg',
    featured: true,
  },
  {
    title: 'Iwagumi',
    tag: 'Da, khoang trong, tiet che',
    image: '/images/iwagumi.jpg',
  },
  {
    title: 'Dutch',
    tag: 'Mau cay, lop cay, can bang',
    image: '/images/dutch-style.jpg',
  },
  {
    title: 'Community',
    tag: 'Cay va ca cung len form',
    image: '/images/community-tank.jpg',
    icon: ChatBubbleLeftRightIcon,
  },
];

const careSteps = [
  {
    title: 'Do kich thuoc',
    body: 'Chon theo dung dung tich va vi tri dat be.',
    icon: CubeIcon,
  },
  {
    title: 'Ghep he sinh thai',
    body: 'Goi y cay, ca va phu kien co the song cung nhau.',
  },
  {
    title: 'Dong goi rieng',
    body: 'Cay, ca va thiet bi duoc dong goi theo tinh trang.',
    icon: TruckIcon,
  },
  {
    title: 'Cham soc tiep',
    body: 'Nhan huong dan don gian de be on dinh lau hon.',
    icon: HeartIcon,
  },
];

const productSelections = [
  { title: 'Nano', sub: '10-20L', active: false },
  { title: 'Small', sub: '20-60L', active: true },
  { title: 'Medium', sub: '60-120L', active: false },
  { title: 'Large', sub: '120L+', active: false },
];

const plants = ['Anubias', 'Java Fern', 'Cryptocoryne'];

const proofItems = [
  {
    title: 'Live arrival care',
    body: 'Cay va sinh vat duoc dong goi can than.',
  },
  {
    title: 'Setup support',
    body: 'Huong dan trong cay, cat tia va can bang be.',
    icon: ChatBubbleLeftRightIcon,
  },
  {
    title: 'Curated compatibility',
    body: 'San pham duoc goi y theo kha nang song chung.',
    icon: ShieldCheckIcon,
  },
];

const blogs = [
  {
    to: '/blogs/setup-be-thuy-sinh-cho-nguoi-moi',
    img: '/images/nature-style.jpg',
    tag: 'Getting started',
    title: 'Checklist setup be dau tien',
    desc: 'Nhung mon can co de bat dau mot be khoe, it doan mo.',
  },
  {
    to: '/blogs/co2-va-anh-sang',
    img: '/images/iwagumi.jpg',
    tag: 'Plant care',
    title: 'Can bang anh sang va CO2',
    desc: 'Tim diem vua du de cay tang truong nhanh hon va it reu hon.',
  },
  {
    to: '/blogs/top-10-cay-de-song',
    img: '/images/planted-tank.jpg',
    tag: 'Plant picks',
    title: 'Cay de song cho nguoi moi',
    desc: 'Nhung loai cay ben, dep va tha thu loi cham soc ban dau.',
  },
];

const FadeIn = ({ children, className = '', delay = 0 }) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 28 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const ButtonLink = ({ to, children, variant = 'primary', className = '' }) => {
  const base =
    'inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full px-6 py-3 font-body text-sm font-bold transition duration-200 active:scale-[0.97]';
  const variants = {
    primary:
      'bg-[#4682a9] text-white shadow-[0_16px_34px_rgba(70,130,169,0.24)] hover:bg-[#35627f] dark:bg-[#91c8e4] dark:text-[#031b22] dark:hover:bg-[#b9e4f5]',
    ghost:
      'border border-[#4682a9]/35 bg-transparent text-[#1f4d3a] hover:bg-[#91c8e4]/18 dark:border-white/24 dark:bg-white/8 dark:text-white dark:hover:bg-white/14',
    dark:
      'bg-[#91c8e4] text-[#031b22] shadow-[0_18px_38px_rgba(145,200,228,0.22)] hover:bg-[#b9e4f5]',
  };

  return (
    <Link to={to} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </Link>
  );
};

const SectionLabel = ({ children, className = '' }) => (
  <p className={`font-body text-xs font-bold uppercase tracking-[0.18em] text-[#1f4d3a] dark:text-[#91c8e4] ${className}`}>
    {children}
  </p>
);

const Home = () => {
  const prefersReducedMotion = useReducedMotion();
  const inspirationSlideIntervalMs = Number(import.meta.env.VITE_INSPIRATION_SLIDE_INTERVAL_MS || 4000);
  const inspirationSlideMotionMs = Number(import.meta.env.VITE_INSPIRATION_SLIDE_MOTION_MS || 900);
  const [activeInspirationIndex, setActiveInspirationIndex] = React.useState(0);
  const [isInspirationSliding, setIsInspirationSliding] = React.useState(false);

  const startInspirationSlide = React.useCallback((direction = 1) => {
    if (isInspirationSliding) return;

    if (prefersReducedMotion || direction < 0) {
      setActiveInspirationIndex((currentIndex) => (
        currentIndex + direction + inspirationLayouts.length
      ) % inspirationLayouts.length);
      return;
    }

    setIsInspirationSliding(direction);
    window.setTimeout(() => {
      setActiveInspirationIndex((currentIndex) => (
        currentIndex + direction + inspirationLayouts.length
      ) % inspirationLayouts.length);
      setIsInspirationSliding(false);
    }, inspirationSlideMotionMs);
  }, [isInspirationSliding, prefersReducedMotion]);

  React.useEffect(() => {
    if (prefersReducedMotion) return undefined;

    const intervalId = window.setInterval(() => {
      startInspirationSlide(1);
    }, inspirationSlideIntervalMs);

    return () => window.clearInterval(intervalId);
  }, [inspirationSlideIntervalMs, prefersReducedMotion, startInspirationSlide]);

  const nextInspiration = () => {
    startInspirationSlide(1);
  };

  const previousInspiration = () => {
    startInspirationSlide(-1);
  };

  const inspirationStack = inspirationLayouts.map((_, index) => {
    const itemIndex = (activeInspirationIndex + index) % inspirationLayouts.length;
    return inspirationLayouts[itemIndex];
  });

  return (
    <div className="home-redesign overflow-hidden bg-[#fffbde] font-body text-[#1f2937] dark:bg-[#031b22] dark:text-white">
      <section id="hero" className="relative isolate min-h-[calc(100dvh-4rem)] overflow-hidden bg-[#031b22] text-white">
        <div className="absolute inset-0">
          <video
            src="https://res.cloudinary.com/dxtrwinoc/video/upload/v1779354346/311063_gt5toe.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,27,34,0.78)_0%,rgba(3,27,34,0.38)_42%,rgba(3,27,34,0.90)_100%),radial-gradient(circle_at_50%_58%,rgba(145,200,228,0.20),transparent_34%)]" />
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#031b22] to-transparent" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-4rem)] max-w-7xl flex-col px-5 py-8 sm:px-6 lg:px-8">
          <FadeIn className="mx-auto flex flex-1 max-w-4xl flex-col items-center justify-center py-20 text-center">
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/16 bg-white/10 px-4 py-2 font-body text-xs font-bold uppercase tracking-[0.18em] text-cyan-50 backdrop-blur-xl">
              AquaticCaps ecosystem store
            </p>
            <h1 className="inline-block text-left font-headline text-[clamp(3.6rem,8vw,7.25rem)] font-semibold leading-[0.95] tracking-tight text-white drop-shadow-[0_16px_50px_rgba(0,0,0,0.42)]">
              <span className="block">Kiến tạo hệ sinh thái</span>
              <span className="block pl-[7.4ch] text-[#ff6b35] sm:pl-[7.8ch]">của chính bạn</span>
            </h1>
            <p className="mt-7 max-w-2xl font-body text-base leading-8 text-cyan-50/82 sm:text-xl">
              Từ những bước đầu tiên đến một bể thủy sinh hoàn chỉnh, chúng tôi đồng hành cùng bạn trên hành trình kiến tạo một không gian xanh sống động và đầy cảm hứng.
            </p>
            <div className="mt-9 flex w-full flex-col items-center justify-center gap-4 sm:flex-row">
              <ButtonLink to="/shop" variant="dark" className="w-full sm:w-auto">
                Tham quan cửa hàng
                <ArrowRightIcon className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink to="/blogs" variant="ghost" className="w-full text-white sm:w-auto">
                Chia sẻ kinh nghiệm và cảm hứng
                <ArrowRightIcon className="h-4 w-4" />
              </ButtonLink>
            </div>
            <div className="mx-auto mt-9 grid w-full max-w-4xl grid-cols-1 gap-y-3 text-sm text-white/78 sm:grid-cols-3 sm:gap-0">
              {['Hệ thực vật chất lượng cao', 'Vận chuyển an toàn toàn quốc', 'Hỗ trợ tận tình'].map((item) => (
                <div key={item} className="grid grid-cols-[1rem_minmax(0,1fr)] items-center gap-2 px-3 text-center">
                  <CheckCircleIcon className="h-4 w-4 text-[#91c8e4]" />
                  <span className="block whitespace-nowrap">{item}</span>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      <section id="collections" className="relative bg-[#fffbde] py-20 dark:bg-[#062424] lg:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_20%,rgba(145,200,228,0.24),transparent_31%),radial-gradient(circle_at_8%_84%,rgba(31,77,58,0.10),transparent_28%)] dark:bg-[radial-gradient(circle_at_80%_18%,rgba(145,200,228,0.16),transparent_30%)]" />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <FadeIn className="grid gap-8 lg:grid-cols-[0.76fr_1.24fr] lg:items-end">
            <div>
              <SectionLabel>Khám phá sản phẩm</SectionLabel>
              <h2 className="mt-4 max-w-xl font-headline text-5xl font-semibold leading-[0.98] tracking-tight text-[#1f4d3a] dark:text-white md:text-6xl">
                Mang thiên nhiên vào không gian sống
              </h2>
              <div className="mt-6 h-1 w-20 rounded-full bg-[#91c8e4]" />
              <p className="mt-6 max-w-md font-body text-base leading-8 text-[#35627f] dark:text-cyan-50/70">
                Từ cây thủy sinh, cá cảnh đến phụ kiện chuyên dụng, tất cả được tuyển chọn để giúp bạn dễ dàng xây dựng một bể thủy sinh đẹp, cân bằng và mang đậm dấu ấn cá nhân.
              </p>
            </div>
            <div className="hidden justify-end lg:flex">
              <div className="border-r border-[#4682a9] pr-5 text-right font-body text-xs font-semibold uppercase tracking-[0.18em] text-[#4682a9] [writing-mode:vertical-rl] dark:border-[#91c8e4]/60 dark:text-[#91c8e4]">
                plants / movement / balance
              </div>
            </div>
          </FadeIn>

          <div className="mt-12 grid gap-6 lg:grid-cols-3 lg:items-end">
            {collections.map((item, index) => (
              <FadeIn key={item.title} delay={index * 0.08} className={index === 1 ? 'lg:mb-16' : index === 2 ? 'lg:mb-28' : ''}>
                <Link
                  to={item.href}
                  className="group block overflow-hidden rounded-[28px] border border-[#91c8e4]/55 bg-[#fffdf0]/86 shadow-[0_18px_50px_rgba(70,130,169,0.12)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(70,130,169,0.18)] dark:border-white/10 dark:bg-white/[0.06] dark:shadow-[0_24px_60px_rgba(0,0,0,0.28)]"
                >
                  <div className="relative aspect-[1.12] overflow-hidden">
                    <img src={item.image} alt={item.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#041f20]/62 via-transparent to-transparent" />
                    {item.icon && (
                      <div className="absolute left-5 top-5 grid h-14 w-14 place-items-center rounded-full bg-[#fffbde] text-[#4682a9] shadow-lg dark:bg-[#062424] dark:text-[#91c8e4]">
                        <item.icon className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div className="p-7">
                    <p className="font-body text-xs font-bold uppercase tracking-[0.16em] text-[#4682a9] dark:text-[#91c8e4]">{item.label}</p>
                    <h3 className="mt-3 font-headline text-3xl font-semibold text-[#1f4d3a] dark:text-white">{item.title}</h3>
                    <p className="mt-3 min-h-[4.5rem] font-body text-sm leading-6 text-[#35627f] dark:text-cyan-50/66">{item.description}</p>
                    <span className="mt-6 inline-flex items-center gap-2 border-b border-[#4682a9] pb-1 font-body text-sm font-bold text-[#4682a9] dark:border-[#91c8e4] dark:text-[#91c8e4]">
                      {item.cta}
                      <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section id="inspiration" className="relative overflow-hidden bg-[#061e2e] py-20 text-white lg:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_80%,rgba(145,200,228,0.12),transparent_28%),linear-gradient(90deg,#061e2e,#031b22_52%,#063a35)]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 sm:px-6 lg:grid-cols-[0.28fr_0.72fr] lg:px-8">
          <FadeIn className="flex flex-col justify-center">
            <div className="flex items-center gap-4">
              <SectionLabel className="text-[#91c8e4]">Cảm hứng layout</SectionLabel>
              <span className="h-px flex-1 bg-[#91c8e4]/40" />
            </div>
            <h2 className="mt-8 font-headline text-5xl font-semibold leading-[1.04] tracking-tight md:text-6xl">
              Tìm bố cục hợp với phong cách của bạn
            </h2>
            <p className="mt-6 max-w-sm font-body text-base leading-8 text-cyan-50/68">
              Từ rừng cây tự nhiên đến bố cục đá tối giản, mỗi phong cách có một nhịp sống riêng.
            </p>
            <Link to="/blogs" className="mt-9 inline-flex w-fit items-center gap-3 border-b border-[#91c8e4] pb-1 font-body text-lg font-bold text-[#91c8e4]">
              Xem cảm hứng
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
          </FadeIn>

          <FadeIn className="h-full">
            <article className="relative min-h-[34rem] overflow-hidden rounded-[30px] lg:min-h-[39rem]">
              <img
                src={inspirationStack[0].image}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full scale-110 object-cover opacity-30 blur-2xl"
              />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,27,34,0.92),rgba(3,27,34,0.42)_48%,rgba(3,27,34,0.90))]" />

              <div className="relative h-full min-h-[34rem] lg:min-h-[39rem]">
                {inspirationStack.slice(0, 3).map((item, index) => {
                  const isActive = index === 0;
                  const cardFrames = [
                    { height: '76%', left: '4%', opacity: 1, top: '6%', width: '72%', zIndex: 30 },
                    { height: '52%', left: '70%', opacity: 0.78, top: '21%', width: '26%', zIndex: 20 },
                    { height: '40%', left: '84%', opacity: 0.45, top: '27%', width: '22%', zIndex: 10 },
                  ];
                  const outgoingFrame = { height: '68%', left: '-38%', opacity: 0, top: '10%', width: '64%', zIndex: 35 };
                  const incomingBackFrame = { height: '40%', left: '96%', opacity: 0, top: '27%', width: '22%', zIndex: 5 };
                  const targetFrame = isInspirationSliding
                    ? index === 0
                      ? outgoingFrame
                      : cardFrames[index - 1] || cardFrames[2]
                    : cardFrames[index];

                  return (
                    <motion.div
                      key={item.title}
                      className="absolute overflow-hidden rounded-[28px] shadow-[0_26px_70px_rgba(0,0,0,0.36)]"
                      initial={index === 2 ? incomingBackFrame : false}
                      animate={targetFrame}
                      transition={{ duration: prefersReducedMotion ? 0 : inspirationSlideMotionMs / 1000, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <img src={item.image} alt={item.title} className="h-full w-full object-cover object-center" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#031b22]/68 via-transparent to-white/8" />
                      {isActive && (
                        <div className="absolute inset-x-0 bottom-0 p-6">
                          <div className="font-body text-3xl font-black text-white/92">
                            {String(activeInspirationIndex + 1).padStart(2, '0')}
                            <span className="ml-3 text-sm font-bold uppercase tracking-[0.14em] text-white">{item.title}</span>
                          </div>
                          <p className="mt-2 max-w-sm text-sm text-cyan-50/72">{item.tag}</p>
                        </div>
                      )}
                    </motion.div>
                  );
                })}

                <div className="absolute bottom-8 left-[4%] right-[8%] z-40 flex items-center justify-end gap-5">
                  <div className="font-body text-sm font-bold text-[#91c8e4]">
                    {String(activeInspirationIndex + 1).padStart(2, '0')}
                    <span className="mx-2 text-white/35">/</span>
                    {String(inspirationLayouts.length).padStart(2, '0')}
                  </div>
                  <div className="h-px w-44 bg-white/16">
                    <motion.div
                      key={activeInspirationIndex}
                      className="h-px bg-[#91c8e4]"
                      initial={{ width: '0%' }}
                      animate={{ width: prefersReducedMotion ? '100%' : '100%' }}
                      transition={{ duration: prefersReducedMotion ? 0 : inspirationSlideIntervalMs / 1000, ease: 'linear' }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={previousInspiration}
                    className="grid h-12 w-12 place-items-center rounded-full border border-white/20 text-[#91c8e4] transition hover:border-[#91c8e4] hover:bg-[#91c8e4]/10"
                    aria-label="Previous inspiration layout"
                  >
                    <ArrowRightIcon className="h-5 w-5 rotate-180" />
                  </button>
                  <button
                    type="button"
                    onClick={nextInspiration}
                    className="grid h-12 w-12 place-items-center rounded-full border border-[#91c8e4]/70 text-[#91c8e4] transition hover:bg-[#91c8e4]/10"
                    aria-label="Next inspiration layout"
                  >
                    <ArrowRightIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </article>
          </FadeIn>
        </div>
      </section>

      <section id="workflow" className="relative bg-[#fffbde] py-20 dark:bg-[#062424] lg:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(145,200,228,0.18),transparent_32%),linear-gradient(180deg,#fffbde,#fffdf0)] dark:bg-[radial-gradient(circle_at_70%_20%,rgba(145,200,228,0.12),transparent_32%),linear-gradient(180deg,#062424,#031b22)]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
          <FadeIn className="space-y-5">
            <div className="rounded-[28px] border border-[#dfd2a8] bg-[#fffdf0]/82 p-6 shadow-[0_20px_60px_rgba(70,130,169,0.12)] dark:border-white/10 dark:bg-white/[0.06]">
              <h3 className="font-body text-xl font-black text-[#1f2937] dark:text-white">1. Be cua ban kich thuoc nao?</h3>
              <div className="mt-6 grid gap-4 sm:grid-cols-4">
                {productSelections.map((item) => (
                  <div
                    key={item.title}
                    className={`relative rounded-2xl border p-4 text-center transition ${
                      item.active
                        ? 'border-[#4682a9] bg-[#ecf9f7] dark:border-[#91c8e4] dark:bg-[#91c8e4]/12'
                        : 'border-[#dfd2a8] bg-[#fffbde]/60 dark:border-white/10 dark:bg-white/[0.04]'
                    }`}
                  >
                    {item.active && (
                      <CheckCircleIcon className="absolute right-3 top-3 h-6 w-6 text-[#4682a9] dark:text-[#91c8e4]" />
                    )}
                    <div className="mx-auto mb-3 h-14 w-20 rounded-md border border-[#91c8e4]/50 bg-gradient-to-t from-[#d4eadf] to-[#ecf9f7] dark:from-[#063a35] dark:to-[#0a3838]" />
                    <p className="font-body text-sm font-black text-[#1f2937] dark:text-white">{item.title}</p>
                    <p className="mt-1 text-sm text-[#4b5563] dark:text-cyan-50/66">{item.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-[#91c8e4]/55 bg-[#ecf9f7]/72 p-6 shadow-[0_20px_60px_rgba(70,130,169,0.10)] dark:border-white/10 dark:bg-white/[0.06]">
              <h3 className="font-body text-xl font-black text-[#1f2937] dark:text-white">2. Ban muon giu dieu gi trong be?</h3>
              <p className="mt-2 text-[#4b5563] dark:text-cyan-50/66">He thong se goi y cay va ca co the song cung nhau.</p>
              <div className="mt-5 flex gap-6 border-b border-[#91c8e4]/55 pb-3 text-sm font-bold text-[#4682a9] dark:border-white/10 dark:text-[#91c8e4]">
                <span className="border-b-2 border-[#4682a9] pb-3 dark:border-[#91c8e4]">Cay</span>
                <span className="text-[#4b5563] dark:text-cyan-50/50">Ca</span>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {plants.map((plant) => (
                  <div key={plant} className="flex items-center justify-between rounded-2xl border border-[#dfd2a8] bg-[#fffbde]/72 px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]">
                    <span className="font-semibold text-[#1f2937] dark:text-white">{plant}</span>
                    <CheckCircleIcon className="h-5 w-5 text-[#4682a9] dark:text-[#91c8e4]" />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-[#91c8e4]/55 bg-[#ecf9f7]/72 p-5 dark:border-white/10 dark:bg-white/[0.06]">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <ShieldCheckIcon className="h-10 w-10 text-[#1f4d3a] dark:text-[#91c8e4]" />
                  <div>
                    <h3 className="font-body text-lg font-black text-[#1f2937] dark:text-white">Chua chac ban can gi?</h3>
                    <p className="text-sm text-[#4b5563] dark:text-cyan-50/66">Gui kich thuoc be, chung toi goi y bo san pham hop ly.</p>
                  </div>
                </div>
                <ArrowRightIcon className="hidden h-6 w-6 text-[#1f4d3a] dark:text-[#91c8e4] sm:block" />
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.12} className="flex flex-col justify-center">
            <span className="w-fit rounded-full border border-[#4682a9] px-4 py-2 font-body text-xs font-black uppercase tracking-[0.12em] text-[#4682a9] dark:border-[#91c8e4] dark:text-[#91c8e4]">
              Step 4 of 6
            </span>
            <h2 className="mt-7 font-headline text-5xl font-semibold leading-[1.04] tracking-tight text-[#1f2937] dark:text-white md:text-6xl">
              Mot cach binh tinh hon de chon be.
            </h2>
            <div className="mt-8 space-y-7">
              {careSteps.map((step, index) => (
                <div key={step.title} className="relative flex gap-5">
                  {index !== careSteps.length - 1 && <span className="absolute left-[1.35rem] top-11 h-12 w-px bg-[#91c8e4]/70 dark:bg-[#91c8e4]/40" />}
                  <div className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#4682a9] text-white dark:bg-[#91c8e4] dark:text-[#031b22]">
                    <CheckCircleIcon className="h-5 w-5" />
                  </div>
                  <div className="flex gap-4">
                    {step.icon && (
                      <div className="hidden h-14 w-14 shrink-0 place-items-center rounded-full border border-[#dfd2a8] bg-[#fffdf0] text-[#4682a9] dark:border-white/10 dark:bg-white/[0.06] dark:text-[#91c8e4] sm:grid">
                        <step.icon className="h-6 w-6" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-body text-xl font-black text-[#1f2937] dark:text-white">{step.title}</h3>
                      <p className="mt-1 max-w-xs text-[#4b5563] dark:text-cyan-50/66">{step.body}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <ButtonLink to="/shop" className="sm:w-auto">
                Bat dau voi bo kit
                <ArrowRightIcon className="h-4 w-4" />
              </ButtonLink>
              <Link to="/blogs" className="inline-flex items-center font-body text-sm font-bold text-[#4682a9] underline underline-offset-8 dark:text-[#91c8e4]">
                Can tu van them
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      <section id="community" className="relative overflow-hidden bg-[#061e2e] py-20 text-white lg:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_8%_20%,rgba(31,77,58,0.34),transparent_28%),linear-gradient(120deg,#061e2e,#031b22_58%,#063a35)]" />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <FadeIn>
              <div className="font-headline text-8xl leading-none text-[#ff6b35]">"</div>
              <h2 className="mt-4 max-w-lg font-headline text-5xl font-semibold leading-[1.08] tracking-tight md:text-6xl">
                Cay den tay khoe, va bo cuc cuoi cung cung co ly.
              </h2>
              <div className="mt-7 h-1 w-20 rounded-full bg-[#00e5cc]" />
              <p className="mt-8 font-body text-2xl font-bold">Anh Tuan</p>
              <div className="mt-3 flex gap-1 text-amber-400">
                {Array.from({ length: 5 }).map((_, index) => (
                  <StarIcon key={index} className="h-6 w-6 fill-current" />
                ))}
              </div>
            </FadeIn>

            <FadeIn delay={0.12} className="relative min-h-[30rem]">
              {[
                { src: '/images/nature-style.jpg', label: 'Week 1', cls: 'left-2 top-0 rotate-[-4deg] lg:left-10' },
                { src: '/images/planted-tank.jpg', label: 'Week 3', cls: 'left-20 top-28 z-10 rotate-[4deg] lg:left-64' },
                { src: '/images/community-tank.jpg', label: 'After trim', cls: 'right-2 top-8 rotate-[3deg]' },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`absolute w-[18rem] overflow-hidden rounded-[18px] border border-[#91c8e4]/26 bg-[#063a35]/80 p-3 shadow-[0_30px_80px_rgba(0,0,0,0.34)] backdrop-blur-md sm:w-[22rem] ${item.cls}`}
                >
                  <img src={item.src} alt={item.label} className="h-48 w-full rounded-xl object-cover sm:h-56" />
                  <p className="px-2 py-3 font-script text-2xl italic text-[#91c8e4]">{item.label}</p>
                </div>
              ))}
            </FadeIn>
          </div>

          <FadeIn delay={0.18} className="mt-12 grid overflow-hidden rounded-[28px] border border-[#91c8e4]/20 bg-[#063a35]/62 backdrop-blur-xl md:grid-cols-3">
            {proofItems.map((item, index) => (
              <div key={item.title} className="flex gap-5 border-b border-[#91c8e4]/16 p-7 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
                {item.icon && (
                  <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full border border-[#91c8e4]/60 text-[#91c8e4]">
                    <item.icon className="h-7 w-7" />
                  </div>
                )}
                <div>
                  <h3 className="font-body text-lg font-black text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-cyan-50/66">{item.body}</p>
                </div>
              </div>
            ))}
          </FadeIn>
        </div>
      </section>

      <section id="blogs" className="relative bg-[#fffbde] pt-20 dark:bg-[#062424] lg:pt-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_8%_66%,rgba(145,200,228,0.24),transparent_25%),radial-gradient(circle_at_94%_54%,rgba(31,77,58,0.10),transparent_24%)] dark:bg-[radial-gradient(circle_at_92%_20%,rgba(145,200,228,0.10),transparent_28%)]" />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <FadeIn className="grid gap-10 lg:grid-cols-[0.38fr_0.62fr] lg:items-start">
            <div>
              <SectionLabel>Tu nhat ky cham be</SectionLabel>
              <h2 className="mt-5 font-body text-5xl font-black leading-[1.02] tracking-tight text-[#1f4d3a] dark:text-white md:text-6xl">
                Hoc nhip cham be truoc khi mua.
              </h2>
              <div className="mt-7 h-1 w-20 rounded-full bg-[#1f4d3a] dark:bg-[#91c8e4]" />
              <p className="mt-7 max-w-sm font-body text-lg leading-8 text-[#35627f] dark:text-cyan-50/66">
                Huong dan thuc te, layout that va giai thich don gian de ban bat dau tu tin hon.
              </p>
              <Link to="/blogs" className="mt-8 inline-flex items-center gap-3 border-b border-[#1f4d3a] pb-1 font-body text-lg font-bold text-[#1f4d3a] dark:border-[#91c8e4] dark:text-[#91c8e4]">
                Xem tat ca bai viet
                <ArrowRightIcon className="h-5 w-5" />
              </Link>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {blogs.map((blog, index) => (
                <Link
                  key={blog.to}
                  to={blog.to}
                  className={`group overflow-hidden rounded-[24px] border border-[#91c8e4]/45 bg-[#ecf9f7]/78 shadow-[0_18px_50px_rgba(70,130,169,0.12)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_26px_70px_rgba(70,130,169,0.16)] dark:border-white/10 dark:bg-white/[0.06] ${
                    index === 1 ? 'md:mt-8' : index === 2 ? 'md:mt-2' : ''
                  }`}
                >
                  <img src={blog.img} alt={blog.title} className="h-52 w-full object-cover transition duration-700 group-hover:scale-105" />
                  <div className="p-6">
                    <p className="font-body text-xs font-bold uppercase tracking-[0.16em] text-[#1f4d3a] dark:text-[#91c8e4]">{blog.tag}</p>
                    <h3 className="mt-4 font-body text-xl font-black leading-snug text-[#1f2937] dark:text-white">{blog.title}</h3>
                    <p className="mt-3 min-h-[4rem] text-sm leading-6 text-[#4b5563] dark:text-cyan-50/66">{blog.desc}</p>
                    <span className="mt-6 inline-flex items-center gap-2 border-b border-[#1f4d3a] pb-1 font-body text-sm font-bold text-[#1f4d3a] dark:border-[#91c8e4] dark:text-[#91c8e4]">
                      Doc bai viet
                      <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </FadeIn>
        </div>

        <div className="relative mx-auto mt-16 max-w-7xl px-5 pb-8 sm:px-6 lg:px-8">
          <FadeIn className="overflow-hidden rounded-[30px] bg-[#1f4d3a] text-white shadow-[0_24px_70px_rgba(31,77,58,0.22)] dark:bg-[linear-gradient(135deg,#063a35,#031b22)]">
            <div className="grid gap-8 px-7 py-10 md:grid-cols-[0.5fr_0.5fr] md:items-center lg:px-14">
              <div className="flex items-center gap-6">
                <div>
                  <h2 className="font-body text-4xl font-black leading-tight tracking-tight md:text-5xl">
                    San sang bat dau khu vuon duoi nuoc?
                  </h2>
                  <p className="mt-3 text-cyan-50/78">Bo kit duoc chon loc. Huong dan ro. Be len form tot hon.</p>
                </div>
              </div>
              <div className="flex flex-col justify-start gap-4 sm:flex-row md:justify-end">
                <ButtonLink to="/shop" variant="primary" className="bg-[#4682a9] text-white dark:bg-[#91c8e4] dark:text-[#031b22]">
                  <ShoppingBagIcon className="h-5 w-5" />
                  Mua bo kit
                </ButtonLink>
                <ButtonLink to="/blogs" variant="ghost" className="border-white/40 text-white">
                  <BookOpenIcon className="h-5 w-5" />
                  Doc huong dan
                </ButtonLink>
              </div>
            </div>
            <div className="border-t border-white/12 px-7 py-7 lg:px-14">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <Link to="/" className="font-headline text-2xl font-semibold">
                  Aquatic<span className="text-[#91c8e4]">Caps</span>
                </Link>
                <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-cyan-50/76">
                  {['Shop', 'Kits', 'Plants', 'Hardscape', 'Accessories', 'Guides', 'About'].map((item) => (
                    <Link key={item} to={item === 'Guides' ? '/blogs' : '/shop'} className="transition hover:text-white">
                      {item}
                    </Link>
                  ))}
                </div>
                <div className="flex flex-wrap gap-5 text-sm text-cyan-50/76">
                  {['Chon loc ky', 'Dang tin cay', 'Luon ho tro'].map((item) => (
                    <span key={item} className="inline-flex items-center gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-[#91c8e4]" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
};

export default Home;
