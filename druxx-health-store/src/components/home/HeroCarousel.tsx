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
          <div className="relative w-full h-full bg-[#0A0A0A] flex items-center overflow-hidden">
            
            {/* Dynamic Immersive Background (Radial Glow) */}
            <div className="absolute inset-0 z-0 overflow-hidden">
              {typeof s.image === 'string' && s.image.length > 0 ? (
                <Image
                  src={s.image}
                  alt=""
                  fill
                  className="object-cover blur-[120px] opacity-40 scale-150"
                  aria-hidden="true"
                />
              ) : null}
              {/* Radial gradient to create a "spotlight" on the product */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/80 to-transparent z-[1]" />
            </div>

            {/* Main Content Layout */}
            <div className="relative z-10 w-full h-full max-w-[1400px] mx-auto flex flex-col md:flex-row items-center px-8 md:px-16 gap-12">
              
              {/* Text Area: Minimalist & Bold */}
              <div className="w-full md:w-1/2 flex flex-col justify-center order-2 md:order-1 text-center md:text-left z-20">
                <div className="animate-fade-slide">
                  <span className="inline-block px-4 py-1 rounded-full bg-white/5 text-white/50 text-[10px] font-bold tracking-[0.3em] mb-8 uppercase border border-white/10">
                    Druxx Exclusive
                  </span>
                  <h1 className="font-heading font-black text-white text-5xl md:text-7xl lg:text-8xl leading-[0.95] mb-6 tracking-tighter uppercase italic">
                    {s.title}
                  </h1>
                  <p className="text-white/40 text-lg md:text-2xl mb-12 leading-relaxed max-w-md font-light tracking-wide">
                    {s.subtitle}
                  </p>
                  <div className="flex justify-center md:justify-start">
                    <button className="group relative px-12 py-5 bg-white text-black font-black rounded-full transition-all hover:bg-[#A6D608] hover:scale-105 active:scale-95 shadow-2xl">
                      <span className="relative z-10 flex items-center gap-3 tracking-widest text-xs">
                        EXPLORE NOW
                        <ChevronRight className="group-hover:translate-x-1 transition-transform" size={18} />
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Image Area: Floating & Clean */}
              <div className="w-full md:w-1/2 h-1/2 md:h-[80%] relative order-1 md:order-2 flex items-center justify-center pt-8 md:pt-0">
                <div className="relative w-full h-full group">
                  {/* Subtle Glow behind product */}
                  <div className="absolute inset-0 bg-[#A6D608]/10 blur-[100px] rounded-full scale-75 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                  
                  {typeof s.image === 'string' && s.image.length > 0 ? (
                    <Image
                      src={s.image}
                      alt={s.title}
                      fill
                      className="object-contain drop-shadow-[0_50px_100px_rgba(0,0,0,0.8)] animate-float scale-90 md:scale-100"
                      priority={i === 0}
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/5 text-9xl font-black italic">
                      DRUX
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
