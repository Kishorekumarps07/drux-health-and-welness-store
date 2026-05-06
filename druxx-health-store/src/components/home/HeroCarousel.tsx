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
      className="relative w-full overflow-hidden aspect-[4/5] md:aspect-[21/8] lg:aspect-[21/7] rounded-[2rem] md:rounded-[3rem]"
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
          <div className="relative w-full h-full bg-[#0F0F0F] overflow-hidden">
            
            {/* Image Layer: Always Full Fit (Contain) */}
            <div className="absolute inset-0 z-0 flex items-center justify-center p-4 md:p-12">
               {typeof s.image === 'string' && s.image.length > 0 ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={s.image}
                      alt={s.title}
                      fill
                      className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
                      priority={i === 0}
                    />
                  </div>
                ) : null}
            </div>

            {/* Subtle Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-[1]" />

            {/* Content Overlay */}
            <div className="relative z-10 w-full h-full max-w-[1400px] mx-auto flex flex-col justify-end p-8 md:p-16">
              <div className="animate-fade-slide">
                <h1 className="font-heading font-black text-white text-4xl md:text-7xl lg:text-8xl leading-[0.95] mb-2 md:mb-4 tracking-tighter uppercase italic drop-shadow-lg">
                  {s.title}
                </h1>
                <p className="text-white/60 text-sm md:text-xl font-medium tracking-wide max-w-md drop-shadow-md">
                  {s.subtitle}
                </p>
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
