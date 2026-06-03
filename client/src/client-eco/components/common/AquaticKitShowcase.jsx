import React from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

gsap.registerPlugin(ScrollTrigger);

const storyScenes = [
  {
    headline: ['Bắt đầu', 'từ', 'không gian.'],
    body: 'Mỗi hồ thủy sinh đều bắt đầu từ một khoảng trống. Chỉ cần chọn kích thước phù hợp với nơi bạn muốn đặt nó.',
  },
  {
    headline: ['Tạo nên', 'sự cân bằng.'],
    body: 'Ánh sáng, nền và bố cục được lựa chọn để tạo nên nền tảng cho một hệ sinh thái ổn định.',
  },
  {
    headline: ['Mang thiên nhiên', 'vào bên trong.'],
    body: 'Những loại cây được gợi ý theo điều kiện thực tế của hồ để phát triển khỏe mạnh và bền vững.',
  },
  {
    headline: ['Để sự sống', 'tự tìm đến.'],
    body: 'Các loài cá được lựa chọn để sống hài hòa cùng môi trường và với nhau.',
  },
  {
    headline: ['Một hệ sinh thái', 'hoàn chỉnh.'],
    body: 'Tất cả được chuẩn bị, phối hợp và đóng gói thành một bộ kit sẵn sàng cho hành trình thủy sinh của bạn.',
    ctaHeadline: 'Sẵn sàng cho hồ đầu tiên của bạn?',
    ctaBody: 'AquaticCaps sẽ giúp bạn chọn cây, cá và thiết bị phù hợp ngay từ đầu.',
  },
];

const plantStyles = [
  { left: '13%', bottom: '9%', height: '23%', delay: '0s' },
  { left: '25%', bottom: '11%', height: '34%', delay: '.3s' },
  { left: '43%', bottom: '10%', height: '19%', delay: '.1s' },
  { left: '63%', bottom: '10%', height: '30%', delay: '.45s' },
  { left: '78%', bottom: '11%', height: '39%', delay: '.2s' },
  { left: '87%', bottom: '10%', height: '24%', delay: '.55s' },
];

const fishStyles = [
  { top: '37%', left: '20%', width: '48px', direction: 'right', delay: '0s' },
  { top: '48%', left: '54%', width: '58px', direction: 'left', delay: '.4s' },
  { top: '60%', left: '36%', width: '43px', direction: 'right', delay: '.8s' },
  { top: '31%', left: '73%', width: '45px', direction: 'left', delay: '1.1s' },
  { top: '69%', left: '81%', width: '36px', direction: 'left', delay: '.2s' },
  { top: '53%', left: '12%', width: '32px', direction: 'right', delay: '1.35s' },
];

const bubbleStyles = Array.from({ length: 30 }).map((_, index) => ({
  left: `${18 + ((index * 17) % 62)}%`,
  bottom: `${9 + ((index * 11) % 18)}%`,
  size: `${3 + (index % 5)}px`,
  delay: `${(index % 10) * 0.22}s`,
  duration: `${4.8 + (index % 6) * 0.45}s`,
}));

const AquaticKitShowcase = () => {
  const sectionRef = React.useRef(null);
  const stickyRef = React.useRef(null);
  const timelineRef = React.useRef(null);
  const tankRef = React.useRef(null);
  const waterRef = React.useRef(null);
  const surfaceRef = React.useRef(null);
  const photoRef = React.useRef(null);
  const hardscapeRef = React.useRef(null);
  const substrateRef = React.useRef(null);
  const ledRef = React.useRef(null);
  const ctaRef = React.useRef(null);
  const progressFillRef = React.useRef(null);
  const plantRefs = React.useRef([]);
  const fishRefs = React.useRef([]);
  const bubbleRefs = React.useRef([]);
  const [activeStep, setActiveStep] = React.useState(0);
  const activeScene = storyScenes[activeStep];

  React.useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const plants = plantRefs.current.filter(Boolean);
    const fish = fishRefs.current.filter(Boolean);
    const bubbles = bubbleRefs.current.filter(Boolean);

    const ctx = gsap.context(() => {
      if (reduceMotion) {
        gsap.set([tankRef.current, waterRef.current, surfaceRef.current, photoRef.current, hardscapeRef.current, substrateRef.current, ledRef.current, ctaRef.current, progressFillRef.current, plants, fish, bubbles], {
          clearProps: 'all',
        });
        gsap.set(progressFillRef.current, { scaleY: 1 });
        gsap.set(waterRef.current, { scaleY: 1, autoAlpha: 1 });
        gsap.set([surfaceRef.current, photoRef.current, hardscapeRef.current, substrateRef.current, ledRef.current, plants, fish, bubbles], { autoAlpha: 1 });
        setActiveStep(4);
        return;
      }

      gsap.set(tankRef.current, { autoAlpha: 1, y: 0, filter: 'blur(0px)' });
      gsap.set(waterRef.current, { autoAlpha: 0, scaleY: 0, transformOrigin: '50% 100%' });
      gsap.set(surfaceRef.current, { autoAlpha: 0, y: 150 });
      gsap.set(photoRef.current, { autoAlpha: 0, scale: 1.06, filter: 'saturate(0.5) blur(7px)' });
      gsap.set([hardscapeRef.current, substrateRef.current], { autoAlpha: 0, y: 38, scale: 0.96 });
      gsap.set(plants, { autoAlpha: 0, scaleY: 0.16, y: 36, transformOrigin: '50% 100%' });
      gsap.set(fish, { autoAlpha: 0, x: (index) => (index % 2 === 0 ? -210 : 210), scale: 0.86 });
      gsap.set(bubbles, { autoAlpha: 0, scale: 0.2 });
      gsap.set(ledRef.current, { autoAlpha: 0.48 });
      gsap.set(progressFillRef.current, { scaleY: 0, transformOrigin: '50% 0%' });

      timelineRef.current = gsap.timeline({
        defaults: { ease: 'power2.out' },
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          pin: stickyRef.current,
          pinSpacing: false,
          pinReparent: true,
          anticipatePin: 1,
          scrub: 0.75,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const nextStep = Math.min(4, Math.floor(self.progress * storyScenes.length));
            setActiveStep((current) => (current === nextStep ? current : nextStep));
          },
        },
      });

      timelineRef.current
        .to(tankRef.current, { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.15 }, 0)
        .to(ledRef.current, { autoAlpha: 0.52, duration: 0.12 }, 0.04)
        .to(progressFillRef.current, { scaleY: 1, duration: 1 }, 0)
        .to(waterRef.current, { autoAlpha: 1, scaleY: 1, duration: 0.22 }, 0.15)
        .to(surfaceRef.current, { autoAlpha: 1, y: 0, duration: 0.22 }, 0.15)
        .to(hardscapeRef.current, { autoAlpha: 0.58, y: 0, scale: 1, duration: 0.18 }, 0.35)
        .to(substrateRef.current, { autoAlpha: 0.78, y: 0, scale: 1, duration: 0.18 }, 0.39)
        .to(photoRef.current, { autoAlpha: 0.72, scale: 1, filter: 'saturate(1.08) blur(0px)', duration: 0.2 }, 0.43)
        .to(plants, { autoAlpha: 0.48, scaleY: 1, y: 0, duration: 0.2, stagger: 0.035 }, 0.55)
        .to(photoRef.current, { autoAlpha: 0.86, duration: 0.12 }, 0.62)
        .to(fish, { autoAlpha: 1, x: 0, scale: 1, duration: 0.17, stagger: 0.035 }, 0.75)
        .to(bubbles, { autoAlpha: 1, scale: 1, duration: 0.16, stagger: 0.01 }, 0.76)
        .to(ledRef.current, { autoAlpha: 1, duration: 0.1 }, 0.9)
        .to(ctaRef.current, { scale: 1.035, boxShadow: '0 22px 70px rgba(0, 229, 204, 0.32)', duration: 0.1 }, 0.92);
    }, section);

    return () => ctx.revert();
  }, []);

  const handleTimelineClick = (index) => {
    const section = sectionRef.current;
    if (!section) return;

    const start = section.offsetTop;
    const scrollable = section.offsetHeight - window.innerHeight;
    window.scrollTo({
      top: start + scrollable * (index / (storyScenes.length - 1)),
      behavior: 'smooth',
    });
  };

  return (
    <section ref={sectionRef} id="workflow" className="aquatic-kit-story relative isolate text-white">
      <div className="aquatic-kit-bg" />
      <div className="aquatic-light-ray aquatic-light-ray-left" />
      <div className="aquatic-light-ray aquatic-light-ray-right" />
      <div className="aquatic-foreground aquatic-foreground-left" />
      <div className="aquatic-foreground aquatic-foreground-right" />

      <div ref={stickyRef} className="aquatic-kit-sticky">
        <div className="aquatic-kit-grid">
          <div className="aquatic-visual-column">
            <div className="aquatic-scroll-note">
              <span />
              <p>Scroll để xem hồ cá bạn hình thành</p>
            </div>

            <div className="aquatic-progress-rail" aria-hidden="true">
              <div className="aquatic-progress-line">
                <span ref={progressFillRef} />
              </div>
              {storyScenes.map((scene, index) => (
                <button
                  key={scene.headline.join(' ')}
                  type="button"
                  onClick={() => handleTimelineClick(index)}
                  className={`aquatic-progress-dot ${activeStep >= index ? 'is-active' : ''}`}
                  aria-label={`Đi tới scene ${index + 1}: ${scene.headline.join(' ')}`}
                >
                  {String(index + 1).padStart(2, '0')}
                </button>
              ))}
            </div>

            <div ref={tankRef} className="aquatic-stage" aria-label="Hồ thủy sinh AquaticCaps chuyển trạng thái khi cuộn trang">
              <div ref={ledRef} className="aquatic-led-glow" />
              <div className="aquatic-tank-lamp">
                <span />
              </div>
              <div className="aquatic-tank">
                <div className="aquatic-glass-edge aquatic-glass-edge-left" />
                <div className="aquatic-glass-edge aquatic-glass-edge-right" />
                <div className="aquatic-backdrop-photo" ref={photoRef} />
                <div className="aquatic-water" ref={waterRef}>
                  <div className="aquatic-water-depth" />
                </div>
                <div className="aquatic-water-surface" ref={surfaceRef} />
                <div className="aquatic-hardscape" ref={hardscapeRef}>
                  <span className="aquatic-rock aquatic-rock-one" />
                  <span className="aquatic-rock aquatic-rock-two" />
                  <span className="aquatic-rock aquatic-rock-three" />
                  <span className="aquatic-driftwood" />
                </div>
                <div className="aquatic-plants" aria-hidden="true">
                  {plantStyles.map((style, index) => (
                    <span
                      key={index}
                      ref={(node) => {
                        plantRefs.current[index] = node;
                      }}
                      className={`aquatic-plant aquatic-plant-${index + 1}`}
                      style={{
                        left: style.left,
                        bottom: style.bottom,
                        height: style.height,
                        '--plant-delay': style.delay,
                      }}
                    >
                      <i />
                      <i />
                      <i />
                    </span>
                  ))}
                </div>
                <div className="aquatic-fish-layer" aria-hidden="true">
                  {fishStyles.map((style, index) => (
                    <span
                      key={index}
                      ref={(node) => {
                        fishRefs.current[index] = node;
                      }}
                      className={`aquatic-fish ${style.direction === 'left' ? 'is-left' : ''}`}
                      style={{
                        top: style.top,
                        left: style.left,
                        width: style.width,
                        animationDelay: style.delay,
                      }}
                    >
                      <i />
                    </span>
                  ))}
                </div>
                <div className="aquatic-bubbles" aria-hidden="true">
                  {bubbleStyles.map((style, index) => (
                    <span
                      key={index}
                      ref={(node) => {
                        bubbleRefs.current[index] = node;
                      }}
                      style={{
                        left: style.left,
                        bottom: style.bottom,
                        width: style.size,
                        height: style.size,
                        animationDelay: style.delay,
                        animationDuration: style.duration,
                      }}
                    />
                  ))}
                </div>
                <div ref={substrateRef} className="aquatic-substrate">
                  {Array.from({ length: 36 }).map((_, index) => (
                    <span key={index} />
                  ))}
                </div>
                <div className="aquatic-glass-highlight" />
              </div>
              <div className="aquatic-tank-base" />
              <div className="aquatic-reflection" />
            </div>

            <div className="aquatic-story-timeline" aria-label="Các scene dựng hồ thủy sinh">
              {storyScenes.map((scene, index) => (
                <button
                  type="button"
                  key={scene.headline.join(' ')}
                  onClick={() => handleTimelineClick(index)}
                  className={`aquatic-story-thumb ${activeStep >= index ? 'is-active' : ''}`}
                >
                  <span className="aquatic-thumb-art" aria-hidden="true">
                    <i />
                  </span>
                  <span>
                    <strong>{String(index + 1).padStart(2, '0')}</strong>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="aquatic-copy-column">
            <p className="aquatic-eyebrow">Thiết kế kit cá nhân hóa</p>
            <div key={activeStep} className="aquatic-scene-copy">
              <h2>
                {activeScene.headline.map((line, index) => (
                  <span key={line} className={index === activeScene.headline.length - 1 ? 'is-accent' : ''}>
                    {line}
                  </span>
                ))}
              </h2>
              <p className="aquatic-subtext">{activeScene.body}</p>
            </div>

            <div className={`aquatic-final-cta ${activeStep === storyScenes.length - 1 ? 'is-visible' : ''}`}>
              <h3>{activeScene.ctaHeadline}</h3>
              <p>{activeScene.ctaBody}</p>
              <div className="aquatic-actions">
                <Link ref={ctaRef} to="/shop" className="aquatic-primary-cta">
                  Bắt đầu dựng kit
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
                <Link to="/blogs" className="aquatic-secondary-cta">
                  Xem cách hoạt động
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AquaticKitShowcase;
