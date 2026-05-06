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
      className="relative w-full overflow-hidden aspect-[4/3] md:aspect-[21/7] lg:aspect-[21/6]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      id="hero-carousel"
    >
      {/* Slides */}
      {heroSlides.map((s, i) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === current ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          <div className={`relative w-full h-full bg-gradient-to-r ${s.bgColor} flex items-center`}>
            {/* Blurred Background Layer (for the "blur corners" effect) */}
            <div className="absolute inset-0 overflow-hidden">
              {typeof s.image === 'string' && s.image.length > 0 ? (
                <Image
                  src={s.image}
                  alt=""
                  fill
                  className="object-cover blur-2xl scale-110 opacity-50"
                  aria-hidden="true"
                />
              ) : null}
            </div>

            {/* Main Image Layer (Fit as per resolution) */}
            <div className="absolute inset-0 flex items-center justify-center">
              {typeof s.image === 'string' && s.image.length > 0 ? (
                <Image
                  src={s.image}
                  alt={s.title}
                  fill
                  className="object-contain z-[2]"
                  priority={i === 0}
                  sizes="100vw"
                />
              ) : (
                <div className="absolute inset-0 bg-gray-900 flex items-center justify-center text-white/10 italic">
                  No Image Available
                </div>
              )}
            </div>

            {/* Subtle Overlay for text readability */}
            <div className="absolute inset-0 z-[1] bg-black/30" />

            {/* Content & Image Wrapper */}
            <div className="relative z-10 w-full h-full flex flex-col md:flex-row items-center">
              {/* Text Content (Left on Desktop) */}
              <div className="w-full md:w-1/2 px-8 md:px-16 py-10 flex flex-col justify-center order-2 md:order-1 text-center md:text-left">
                <h1 className="font-heading font-black text-white text-3xl md:text-5xl lg:text-6xl leading-[1.1] mb-4 animate-fade-slide uppercase tracking-tighter drop-shadow-lg">
                  {s.title}
                </h1>
                <p className="text-white/90 text-sm md:text-lg mb-8 leading-relaxed max-w-md animate-fade-slide font-medium drop-shadow-md">
                  {s.subtitle}
                </p>
                <div className="mt-2">
                   <button className="px-8 py-3 bg-[#A6D608] text-[#1E1E1E] font-bold rounded-full hover:bg-[#95c207] transition-all transform hover:scale-105 active:scale-95 shadow-lg">
                     Shop Collection
                   </button>
                </div>
              </div>

              {/* Image Content (Right on Desktop) */}
              <div className="w-full md:w-1/2 h-1/2 md:h-full relative order-1 md:order-2 p-6 md:p-12">
                <div className="relative w-full h-full">
                  {typeof s.image === 'string' && s.image.length > 0 ? (
                    <Image
                      src={s.image}
                      alt={s.title}
                      fill
                      className="object-contain drop-shadow-2xl"
                      priority={i === 0}
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-white/20 italic">
                      No Image Available
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Arrows */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/10 hover:bg-white/30 flex items-center justify-center text-white transition-all backdrop-blur-sm"
        aria-label="Previous slide"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/10 hover:bg-white/30 flex items-center justify-center text-white transition-all backdrop-blur-sm"
        aria-label="Next slide"
      >
        <ChevronRight size={18} />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {heroSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`transition-all duration-300 rounded-full ${
              i === current ? "w-6 h-1.5 bg-[#A6D608]" : "w-1.5 h-1.5 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
