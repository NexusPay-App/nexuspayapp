"use client";

import { useEffect, useState } from 'react';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel';
import { onboardingSource } from '@/helpers/onboardingSource';

export default function OnboardingCarousel() {
  const [api, setApi] = useState<CarouselApi>();
  const [activeSlide, setActiveSlide] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(preference.matches);
    update();
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!api) return;
    const update = () => setActiveSlide(api.selectedScrollSnap());
    update();
    api.on('select', update);
    api.on('reInit', update);
    return () => { api.off('select', update); api.off('reInit', update); };
  }, [api]);

  useEffect(() => {
    if (!api || hovered || focused || reducedMotion) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) api.scrollNext();
    }, 5000);
    return () => window.clearInterval(timer);
  }, [api, activeSlide, hovered, focused, reducedMotion]);

  return (
    <Carousel
      opts={{ loop: true, duration: reducedMotion ? 0 : 25 }}
      setApi={setApi}
      className="w-full"
      aria-label="Discover NexusPay"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
    >
      <CarouselContent aria-live="off">
        {onboardingSource.map((slide, index) => (
          <CarouselItem key={slide.title} aria-label={`${index + 1} of ${onboardingSource.length}`} aria-hidden={index !== activeSlide}>
            <div className="flex min-h-[220px] flex-col justify-center gap-5 sm:min-h-[250px]">
              <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
                {slide.title}
              </h1>
              <p className="text-lg leading-relaxed text-white/75 sm:text-xl">{slide.subtitle}</p>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="mt-3 flex items-center justify-center gap-3 lg:justify-start">
        <div className="flex items-center" aria-label="Choose a slide">
          {onboardingSource.map((slide, index) => (
            <button
              key={slide.title}
              type="button"
              aria-label={`Show slide ${index + 1}: ${slide.title}`}
              aria-current={index === activeSlide ? 'true' : undefined}
              onClick={() => api?.scrollTo(index)}
              className="flex h-11 min-w-11 items-center justify-center rounded-full px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0795B0]"
            >
              <span className={`h-1.5 rounded-full transition-all motion-reduce:transition-none ${index === activeSlide ? 'w-10 bg-[#0795B0]' : 'w-5 bg-white/30'}`} />
            </button>
          ))}
        </div>
        <span className="text-xs tabular-nums text-white/60" aria-hidden="true">{activeSlide + 1} / {onboardingSource.length}</span>
      </div>
    </Carousel>
  );
}
