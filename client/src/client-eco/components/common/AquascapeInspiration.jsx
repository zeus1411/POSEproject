import React from 'react';

const setups = [
  { title: 'Nature style', image: '/images/nature-style.jpg', tag: 'Balanced plants' },
  { title: 'Iwagumi', image: '/images/iwagumi.jpg', tag: 'Minimal rockscape' },
  { title: 'Dutch planted', image: '/images/dutch-style.jpg', tag: 'Color layering' },
  { title: 'Nano biotope', image: '/images/biotope.jpg', tag: 'Low tech friendly' },
];

const AquascapeInspiration = () => (
  <section className="mb-12">
    <div className="mb-5">
      <p className="mb-2 font-body text-[11px] font-semibold uppercase tracking-[0.22em] text-ocean dark:text-neon-cyan">Aquascape inspiration</p>
      <h2 className="font-headline text-2xl font-semibold text-foreground">Khởi tạo bố cục của bạn</h2>
    </div>
    <div className="flex snap-x gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {setups.map((setup) => (
        <article key={setup.title} className="group relative h-44 min-w-[245px] snap-start overflow-hidden rounded-2xl border border-water/30 dark:border-white/10 sm:min-w-[280px]">
          <img src={setup.image} alt={setup.title} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-abyss via-abyss/20 to-transparent" />
          <div className="absolute bottom-0 p-4">
            <p className="font-headline text-xl text-white">{setup.title}</p>
            <p className="mt-1 font-body text-xs uppercase tracking-[0.15em] text-neon-cyan">{setup.tag}</p>
          </div>
        </article>
      ))}
    </div>
  </section>
);

export default AquascapeInspiration;
