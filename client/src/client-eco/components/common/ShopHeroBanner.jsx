import React, { useMemo } from 'react';
import { ArrowRightIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const ShopHeroBanner = ({ products = [], user }) => {
  const previews = useMemo(() => products.slice(0, 3), [products]);
  

  return (
    <section className="mx-auto w-full max-w-[1440px] px-4 pb-6 pt-6 sm:px-6 lg:pt-8">
      <div className="shop-hero-banner relative isolate overflow-hidden rounded-[28px] border border-water/30 bg-abyss shadow-[0_28px_80px_rgba(0,0,0,0.34)] dark:border-white/10">
        <img
          src="/images/shop-hero-aquaticcaps.jpg"
          alt=""
          fetchpriority="high"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,18,18,0.97)_0%,rgba(3,18,18,0.84)_42%,rgba(3,18,18,0.24)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#031313]/70 via-transparent to-transparent" />
        <div className="absolute -left-24 top-16 h-56 w-56 animate-glow-pulse rounded-full bg-neon-cyan/10 blur-3xl" />

        <div className="relative grid min-h-[470px] items-end gap-8 p-6 sm:p-9 lg:grid-cols-[1fr_360px] lg:items-center lg:p-12">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="max-w-[670px]"
          >
            <h1 className="font-headline text-4xl font-semibold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[3.7rem]">
              Khám phá hệ sinh thái của riêng bạn
            </h1>
            <p className="mt-5 max-w-xl font-body text-base leading-7 text-white/70 sm:text-lg">
              Cây thủy sinh, sinh vật cảnh và thiết bị được tuyển chọn kỹ lưỡng để giúp bạn xây dựng một không gian dưới nước cân bằng, sống động và mang dấu ấn riêng.
            </p>
            
          </motion.div>

          <div className="hidden space-y-3 lg:block">
            <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Các sản phẩm "hot trend" tuần này</p>
            {previews.map((product, index) => (
              <motion.a
                key={product._id}
                href={`/product/${product._id}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.18 + index * 0.08 }}
                className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-black/25 p-3 backdrop-blur-xl transition hover:border-neon-cyan/30 hover:bg-neon-cyan/10"
              >
                <img
                  src={product.images?.[0] || '/placeholder-product.jpg'}
                  alt=""
                  loading="lazy"
                  className="h-14 w-14 rounded-xl object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate font-body text-sm font-semibold text-white">{product.name}</p>
                  <p className="mt-1 font-body text-xs text-neon-cyan">Được quan tâm tuần này</p>
                </div>
                <ArrowRightIcon className="ml-auto h-4 w-4 shrink-0 text-white/40 transition group-hover:text-neon-cyan" />
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShopHeroBanner;
