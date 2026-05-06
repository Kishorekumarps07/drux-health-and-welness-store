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
      className="relative w-full overflow-hidden aspect-[4/5] md:aspect-[21/8] lg:aspect-[21/7] rounded-[2rem] md:rounded-[3rem] shadow-2xl"
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
          <div className="relative w-full h-full bg-[#0A0A0A] overflow-hidden">
            
            {/* Immersive Background: Cover on Mobile, Blur + Contain on Desktop */}
            <div className="absolute inset-0 z-0">
              {typeof s.image === 'string' && s.image.length > 0 ? (
                <>
                  {/* Mobile Background (Sharp Cover) */}
                  <div className="block md:hidden absolute inset-0">
                    <Image
                      src={s.image}
                      alt=""
                      fill
                      className="object-cover"
                      priority={i === 0}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  </div>

                  {/* Desktop Background (Immersive Blur) */}
                  <div className="hidden md:block absolute inset-0">
                    <Image
                      src={s.image}
                      alt=""
                      fill
                      className="object-cover blur-[100px] opacity-30 scale-125"
                    />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(255,255,255,0.05),transparent_50%)]" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/60 to-transparent" />
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 bg-[#0A0A0A]" />
              )}
            </div>

            {/* Content Layout */}
            <div className="relative z-10 w-full h-full max-w-[1400px] mx-auto flex flex-col md:flex-row justify-end md:justify-start items-start md:items-center px-8 md:px-16 pb-32 md:pb-0">
              
              {/* Text Area */}
              <div className="w-full md:w-1/2 flex flex-col justify-center text-left z-20">
                <div className="animate-fade-slide">
                  <span className="hidden md:inline-block px-3 py-1 rounded-full bg-white/10 text-white/50 text-[10px] font-bold tracking-[0.2em] mb-6 uppercase border border-white/10">
                    Druxx Exclusive
                  </span>
                  <h1 className="font-heading font-black text-white text-5xl md:text-6xl lg:text-8xl leading-[0.95] mb-4 md:mb-6 tracking-tighter uppercase italic drop-shadow-2xl">
                    {s.title}
                  </h1>
                  <p className="text-white/80 text-base md:text-xl mb-8 md:mb-10 leading-relaxed max-w-[280px] md:max-w-md font-medium tracking-wide drop-shadow-lg">
                    {s.subtitle}
                  </p>
                  <div className="flex">
                    <button className="group relative px-10 py-4 md:px-12 md:py-5 bg-[#A6D608] text-[#1E1E1E] font-black rounded-full transition-all hover:scale-105 active:scale-95 shadow-[0_20px_40px_rgba(166,214,8,0.4)]">
                      <span className="relative z-10 flex items-center gap-3 tracking-widest text-[11px] md:text-xs">
                        EXPLORE NOW
                        <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Desktop Product Visual */}
              <div className="hidden md:flex w-1/2 h-[80%] relative items-center justify-center">
                <div className="relative w-full h-full">
                  {typeof s.image === 'string' && s.image.length > 0 && (
                    <Image
                      src={s.image}
                      alt={s.title}
                      fill
                      className="object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,0.7)] animate-float"
                      priority={i === 0}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 z-30 hidden md:flex justify-between pointer-events-none">
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
