"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCMSStore } from "@/store/cmsStore";

export function HeroCarousel() {
  const heroSlides = useCMSStore((state) => state.heroSlides);
  const fetchCMSData = useCMSStore((state) => state.fetchCMSData);
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (heroSlides.length === 0) {
      fetchCMSData();
    }
  }, [fetchCMSData, heroSlides.length]);

  const next = useCallback(() => {
    if (heroSlides.length === 0) return;
    setCurrent((c) => (c + 1) % heroSlides.length);
  }, [heroSlides.length]);

  const prev = useCallback(() => {
    if (heroSlides.length === 0) return;
    setCurrent((c) => (c - 1 + heroSlides.length) % heroSlides.length);
  }, [heroSlides.length]);

  useEffect(() => {
    if (!mounted || isPaused || heroSlides.length === 0) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [isPaused, next, heroSlides.length, mounted]);

  if (!mounted || heroSlides.length === 0) return <div className="w-full aspect-[4/3] md:aspect-[21/7] lg:aspect-[21/6] bg-[#1E1E1E] animate-pulse rounded-xl" />;

  return (
    <div
      className="relative w-full overflow-hidden aspect-[16/10] md:aspect-[21/8] lg:aspect-[21/7] rounded-[2rem] md:rounded-[3rem] shadow-2xl"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      id="hero-carousel"
    >
      {/* Slides */}
      {heroSlides.map((s, i) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            i === current ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          <div className="relative w-full h-full bg-[#121212] flex items-center overflow-hidden">
            
            {/* Premium Immersive Background */}
            <div className="absolute inset-0 z-0 scale-110 pointer-events-none">
              {typeof s.image === 'string' && s.image.length > 0 ? (
                <Image
                  src={s.image}
                  alt=""
                  fill
                  className="object-cover blur-[80px] opacity-30"
                  aria-hidden="true"
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-black/40" />
            </div>

            {/* Split Content Wrapper */}
            <div className="relative z-20 w-full h-full max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between px-6 md:px-12">
              
              {/* Left Column: Typography & CTA */}
              <div className="w-full md:w-[45%] flex flex-col justify-center order-2 md:order-1 text-center md:text-left py-12 md:py-0">
                <div className="glass-panel p-8 md:p-12 pb-16 md:pb-16 rounded-[2.5rem] border border-white/5 animate-fade-slide">
                  <span className="inline-block px-4 py-1.5 rounded-full bg-[#A6D608]/10 text-[#A6D608] text-xs font-bold tracking-[0.2em] mb-6 uppercase border border-[#A6D608]/20">
                    Premium Selection
                  </span>
                  <h1 className="font-heading font-black text-white text-4xl md:text-6xl lg:text-7xl leading-[1.05] mb-6 tracking-tighter uppercase">
                    {s.title}
                  </h1>
                  <p className="text-white/70 text-base md:text-xl mb-10 leading-relaxed font-medium max-w-sm mx-auto md:mx-0">
                    {s.subtitle}
                  </p>
                  <div className="flex justify-center md:justify-start">
                    <button className="group relative px-12 py-5 bg-[#A6D608] text-[#1E1E1E] font-black rounded-full transition-all hover:scale-105 active:scale-95 shadow-[0_15px_30px_rgba(166,214,8,0.3)]">
                      <span className="relative z-10 flex items-center gap-3">
                        SHOP NOW
                        <ChevronRight className="group-hover:translate-x-1 transition-transform" size={22} />
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Hero Visual */}
              <div className="w-full md:w-[50%] h-[40%] md:h-[85%] relative order-1 md:order-2 flex items-center justify-center pt-8 md:pt-0">
                <div className="relative w-full h-full animate-float">
                  {typeof s.image === 'string' && s.image.length > 0 ? (
                    <Image
                      src={s.image}
                      alt={s.title}
                      fill
                      className="object-contain drop-shadow-[0_35px_60px_rgba(0,0,0,0.6)]"
                      priority={i === 0}
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white/5 rounded-3xl border border-white/10 text-white/20">
                      No Visual
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 z-30 flex justify-between pointer-events-none">
        <button
          onClick={prev}
          className="pointer-events-auto w-12 h-12 rounded-full glass-panel flex items-center justify-center text-white hover:bg-[#A6D608] hover:text-black transition-all group shadow-xl"
        >
          <ChevronLeft className="group-hover:-translate-x-0.5 transition-transform" size={24} />
        </button>
        <button
          onClick={next}
          className="pointer-events-auto w-12 h-12 rounded-full glass-panel flex items-center justify-center text-white hover:bg-[#A6D608] hover:text-black transition-all group shadow-xl"
        >
          <ChevronRight className="group-hover:translate-x-0.5 transition-transform" size={24} />
        </button>
      </div>

      {/* Progress Indicators */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3">
        {heroSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all duration-500 ${
              i === current ? "w-10 bg-[#A6D608]" : "w-2 bg-white/20 hover:bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
