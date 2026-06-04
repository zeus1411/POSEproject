import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRightIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  SparklesIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import AquaticKitShowcase from '../../components/common/AquaticKitShowcase';

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

const heroBenefits = [
  {
    title: 'Hệ thực vật',
    body: 'chất lượng cao',
    icon: BookOpenIcon,
  },
  {
    title: 'Vận chuyển',
    body: 'an toàn toàn quốc',
    icon: ShieldCheckIcon,
  },
  {
    title: 'Hỗ trợ',
    body: 'tận tình',
    icon: ChatBubbleLeftRightIcon,
  },
  {
    title: 'Sản phẩm chọn lọc',
    body: 'cho trải nghiệm tốt nhất',
    icon: SparklesIcon,
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
    <div className="home-redesign overflow-x-clip bg-[#fffbde] font-body text-[#1f2937] dark:bg-[#031b22] dark:text-white">
      <section id="hero" className="relative isolate min-h-[calc(100dvh-4rem)] overflow-hidden bg-[#031b22] text-white">
        <div className="absolute inset-0">
          <video
            src="https://res.cloudinary.com/dxtrwinoc/video/upload/v1779354346/311063_gt5toe.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full scale-x-[-1] object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,12,24,0.96)_0%,rgba(2,15,28,0.86)_22%,rgba(2,16,30,0.44)_48%,rgba(2,16,30,0.12)_72%,rgba(2,16,30,0.30)_100%),linear-gradient(180deg,rgba(2,12,24,0.34)_0%,rgba(2,12,24,0.06)_42%,rgba(2,12,24,0.90)_100%)]" />
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#031b22] to-transparent" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-4rem)] max-w-[92rem] flex-col px-5 py-10 sm:px-8 lg:px-16">
          <FadeIn className="flex flex-1 max-w-3xl flex-col justify-center pb-8 pt-12 text-left sm:pb-12 lg:pb-36">
            <p className="mb-5 inline-flex w-fit items-center rounded-full border border-white/56 bg-[#061426]/32 px-4 py-2 font-body text-[0.68rem] font-black uppercase tracking-[0.22em] text-cyan-50 shadow-[0_10px_34px_rgba(0,0,0,0.24)] backdrop-blur-xl">
              AquaticCaps ecosystem store
            </p>
            <h1 className="font-headline text-[clamp(4rem,7.8vw,7.5rem)] font-semibold leading-[0.86] tracking-normal text-white drop-shadow-[0_18px_54px_rgba(0,0,0,0.52)]">
              <span className="block">Kiến tạo</span>
              <span className="block">hệ sinh thái</span>
              <span className="block text-[#ff6b35]">của chính bạn</span>
            </h1>
            <div className="mt-5 flex items-center gap-2">
              <span className="h-[3px] w-10 rounded-full bg-[#16d9c1]" />
              <span className="h-[3px] w-1 rounded-full bg-[#16d9c1]" />
            </div>
            <p className="mt-5 max-w-xl font-body text-base font-medium leading-8 text-cyan-50/88 sm:text-lg">
              Từ những bước đầu tiên đến một bể thủy sinh hoàn chỉnh, chúng tôi đồng hành cùng bạn trên hành trình kiến tạo một không gian xanh sống động và đầy cảm hứng.
            </p>
            <div className="mt-8 flex w-full flex-col gap-4 sm:flex-row">
              <ButtonLink to="/shop" variant="dark" className="w-full bg-[#91d9e8] px-8 text-[#041722] shadow-[0_18px_42px_rgba(145,217,232,0.24)] hover:bg-[#b9edf5] sm:w-auto">
                Tham quan cửa hàng
                <ArrowRightIcon className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink to="/blogs" variant="ghost" className="w-full border-[#5db9df]/42 px-8 text-white hover:bg-[#5db9df]/14 sm:w-auto">
                Chia sẻ kinh nghiệm và cảm hứng
                <ArrowRightIcon className="h-4 w-4" />
              </ButtonLink>
            </div>
          </FadeIn>

          <FadeIn delay={0.1} className="grid gap-4 pb-6 sm:grid-cols-2 lg:absolute lg:inset-x-16 lg:bottom-6 lg:grid-cols-4 lg:pb-0">
            {heroBenefits.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="flex items-center gap-4 border-white/10 text-white/86 lg:border-r lg:pr-8 lg:last:border-r-0"
                >
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-[#91d9e8]/80 bg-[#061426]/34 text-[#a9ecf8] backdrop-blur-xl">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="font-body text-sm font-semibold leading-6">
                    <span className="block">{item.title}</span>
                    <span className="block text-white/74">{item.body}</span>
                  </span>
                </div>
              );
            })}
          </FadeIn>
        </div>
      </section>

      <section id="collections" className="relative isolate min-h-[52rem] overflow-hidden bg-[#001616] py-20 text-white lg:min-h-[56rem] lg:py-24">
        <div className="absolute inset-0 bg-[linear-gradient(115deg,#021f1f_0%,#062f2b_42%,#001616_78%,#000909_100%)]" />
        <img
          src="/images/collections-aquascape-bg.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-y-0 left-0 h-full w-[34rem] max-w-none object-cover object-left-center opacity-95 saturate-[1.05] [mask-image:linear-gradient(90deg,#000_0%,#000_54%,transparent_100%)] sm:w-[42rem] lg:w-[48rem]"
        />
        <img
          src="/images/planted-tank.jpg"
          alt=""
          aria-hidden="true"
          className="absolute left-[28%] top-[12%] h-[58%] w-[58rem] max-w-none scale-125 object-cover object-center opacity-[0.08] blur-xl saturate-[0.8] [mask-image:radial-gradient(ellipse_at_center,#000_0%,transparent_70%)]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,8,8,0.06)_0%,rgba(0,15,15,0.30)_24%,rgba(0,19,19,0.78)_48%,rgba(0,10,10,0.92)_100%),linear-gradient(180deg,rgba(0,20,18,0.12)_0%,rgba(0,12,12,0.50)_62%,rgba(0,4,4,0.96)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_72%_58%,rgba(21,226,205,0.32),transparent_30%),radial-gradient(ellipse_at_34%_78%,rgba(70,163,110,0.20),transparent_28%),radial-gradient(ellipse_at_52%_8%,rgba(150,231,221,0.12),transparent_38%)]" />
        <div className="absolute -left-20 -top-40 h-[42rem] w-[44rem] rotate-[-22deg] bg-[linear-gradient(105deg,rgba(225,255,232,0.36),rgba(140,236,219,0.12)_36%,transparent_68%)] blur-2xl" />
        <div className="absolute left-[58%] top-[22%] h-[18rem] w-24 bg-[radial-gradient(circle,rgba(166,255,244,0.42)_0_2px,transparent_3px),radial-gradient(circle,rgba(117,226,213,0.22)_0_1.5px,transparent_2.5px)] bg-[length:34px_52px,22px_36px] opacity-40 blur-[0.3px]" />
        <div className="absolute right-[12%] top-[35%] h-[25rem] w-[42rem] rounded-full bg-[#16ddc8]/28 opacity-70 blur-3xl" />
        <div className="absolute bottom-0 right-[10%] h-36 w-[46rem] bg-[radial-gradient(ellipse_at_center,rgba(35,230,211,0.16),transparent_68%)] blur-xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_38%,rgba(0,8,8,0.36)_72%,rgba(0,0,0,0.88)_100%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-[#7af4e6]/30" />

        <div className="relative z-10 mx-auto max-w-[92rem] px-5 sm:px-8 lg:px-16">
          <FadeIn className="grid gap-8 lg:grid-cols-[0.42fr_0.58fr] lg:items-start">
            <div>
              <SectionLabel className="text-[#80f6e9]">Khám phá sản phẩm</SectionLabel>
              <h2 className="mt-4 max-w-xl font-headline text-5xl font-semibold leading-[0.98] tracking-tight text-white drop-shadow-[0_18px_46px_rgba(0,0,0,0.66)] md:text-6xl">
                Mang thiên nhiên
                <span className="block text-[#66f3e8]">vào không gian sống</span>
              </h2>
              <div className="mt-6 h-[3px] w-20 rounded-full bg-[#23e6d3] shadow-[0_0_28px_rgba(35,230,211,0.72)]" />
              <p className="mt-6 max-w-[28rem] font-body text-base font-medium leading-8 text-cyan-50/78">
                Từ cây thủy sinh, cá cảnh đến phụ kiện chuyên dụng, tất cả được tuyển chọn để giúp bạn dễ dàng xây dựng một bể thủy sinh đẹp, cân bằng và mang đậm dấu ấn cá nhân.
              </p>
            </div>
            <div className="hidden justify-end lg:flex">
              <div className="mr-5 mt-5 border-r border-[#23e6d3]/72 pr-5 text-right font-body text-xs font-semibold uppercase tracking-[0.2em] text-[#74f3e4] [writing-mode:vertical-rl] drop-shadow-[0_0_18px_rgba(35,230,211,0.55)]">
                plants / movement / balance
              </div>
            </div>
          </FadeIn>

          <div className="relative mt-14 grid gap-6 md:grid-cols-3 lg:ml-[19rem] lg:mt-10 lg:items-end">
            <div className="pointer-events-none absolute -inset-x-10 bottom-8 top-8 -z-10 bg-[radial-gradient(ellipse_at_62%_44%,rgba(35,230,211,0.28),transparent_46%)] blur-2xl" />
            {collections.map((item, index) => (
              <FadeIn key={item.title} delay={index * 0.08} className={index === 1 ? 'lg:mb-8' : index === 2 ? 'lg:mb-14' : ''}>
                <Link
                  to={item.href}
                  className="group block overflow-hidden rounded-[24px] border border-[#d7fff8]/52 bg-[#032a28]/72 shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-[#6ff6e9]/80 hover:shadow-[0_30px_90px_rgba(15,205,190,0.20)]"
                >
                  <div className="relative aspect-[1.12] overflow-hidden">
                    <img src={item.image} alt={item.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#021716]/80 via-[#021716]/8 to-transparent" />
                    {item.icon && (
                      <div className="absolute left-5 top-5 grid h-14 w-14 place-items-center rounded-full bg-[#031f1f]/82 text-[#74f3e4] shadow-lg ring-1 ring-[#74f3e4]/24 backdrop-blur-xl">
                        <item.icon className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div className="p-7">
                    <p className="font-body text-xs font-bold uppercase tracking-[0.16em] text-[#8cefe3]">{item.label}</p>
                    <h3 className="mt-3 font-headline text-3xl font-semibold text-white">{item.title}</h3>
                    <p className="mt-3 min-h-[4.5rem] font-body text-sm leading-6 text-cyan-50/72">{item.description}</p>
                    <span className="mt-6 inline-flex items-center gap-2 border-b border-[#74f3e4] pb-1 font-body text-sm font-bold text-[#9af8ec]">
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
      <AquaticKitShowcase />
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
    </div>
  );
};

export default Home;
