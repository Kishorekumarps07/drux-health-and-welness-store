"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, MousePointer2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCMSStore } from "@/store/cmsStore";

const isVideo = (url: string) => /\.(mp4|webm|mov|ogg)$/i.test(url) || url.includes('/video/upload/');

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
      className="relative w-full overflow-hidden aspect-[3/4] md:aspect-[21/8] lg:aspect-[21/7] rounded-[2rem] md:rounded-[3rem] shadow-xl border border-gray-100"
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
          <div className="relative w-full h-full bg-[#F9F9F9] overflow-hidden">
            
            {/* Layer 1: Soft Light Immersive Background */}
            <div className="absolute inset-0 z-0">
              {/* Subtle background color based on slide (optional) or just soft white */}
              <div className="absolute inset-0 bg-gradient-to-br from-white via-[#F3F4F6] to-[#E5E7EB]" />
              
              {/* Soft blurred accent of the image/video */}
              {typeof s.image === 'string' && s.image.length > 0 ? (
                isVideo(s.image) ? (
                   <video
                    src={s.image}
                    autoPlay
                    muted
                    loop
                    className="absolute inset-0 w-full h-full object-cover blur-[140px] opacity-20 scale-150"
                  />
                ) : (
                  <Image
                    src={s.image}
                    alt=""
                    fill
                    className="object-cover blur-[140px] opacity-20 scale-150"
                  />
                )
              ) : null}
            </div>

            {/* Content Layout */}
            <div className="relative z-10 w-full h-full max-w-[1400px] mx-auto flex flex-col md:flex-row items-center px-8 md:px-16 pt-6 md:pt-0">
              
              {/* Text Area (Deep Charcoal Typography) */}
              <div className="w-full md:w-1/2 flex flex-col justify-center text-left pt-6 md:pt-0 shrink-0 md:shrink">
                <div className="animate-fade-slide">
                  <span className="inline-block px-3 py-1 rounded-full bg-black/5 text-black/40 text-[10px] font-bold tracking-[0.2em] mb-3 md:mb-6 uppercase border border-black/5">
                    Premium Quality
                  </span>
                  <h1 className={`font-black text-[#1A1A1A] leading-[0.9] mb-3 md:mb-6 tracking-tight uppercase ${
                    s.title.length > 20 || (s.subtitle && s.subtitle.length > 80)
                      ? "text-3xl sm:text-4xl md:text-5xl lg:text-7xl"
                      : "text-5xl md:text-6xl lg:text-8xl"
                  }`}>
                    {s.title}
                  </h1>
                  <p className={`text-[#4A4A4A] mb-2 md:mb-10 leading-relaxed max-w-[280px] md:max-w-md font-medium tracking-wide ${
                    s.subtitle && s.subtitle.length > 80
                      ? "text-xs sm:text-sm md:text-base line-clamp-3"
                      : "text-base md:text-xl line-clamp-4"
                  }`}>
                    {s.subtitle}
                  </p>
                </div>
              </div>

              {/* Product Visual */}
              <div className="w-full md:w-1/2 flex-1 md:h-[80%] min-h-[220px] relative flex items-center justify-center shrink-0 mt-2 md:mt-0 pb-6 md:pb-0">
                <div className="relative w-full h-full p-0 md:p-8">
                  {typeof s.image === 'string' && s.image.length > 0 && (
                    isVideo(s.image) ? (
                      <video
                        src={s.image}
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.12)] animate-float"
                      />
                    ) : (
                      <Image
                        src={s.image}
                        alt={s.title}
                        fill
                        className="object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.12)] animate-float"
                        priority={i === 0}
                      />
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows (Light Glass Style) */}
      <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 z-30 hidden md:flex justify-between pointer-events-none">
        <button
          onClick={prev}
          className="pointer-events-auto w-14 h-14 rounded-full border border-gray-200 bg-white/70 backdrop-blur-xl flex items-center justify-center text-[#1A1A1A] hover:bg-[#A6D608] hover:border-[#A6D608] transition-all group shadow-lg"
        >
          <ChevronLeft className="group-hover:-translate-x-0.5 transition-transform" size={24} />
        </button>
        <button
          onClick={next}
          className="pointer-events-auto w-14 h-14 rounded-full border border-gray-200 bg-white/70 backdrop-blur-xl flex items-center justify-center text-[#1A1A1A] hover:bg-[#A6D608] hover:border-[#A6D608] transition-all group shadow-lg"
        >
          <ChevronRight className="group-hover:translate-x-0.5 transition-transform" size={24} />
        </button>
      </div>

      {/* Modern Progress Line */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4">
        {heroSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all duration-700 ${
              i === current ? "w-16 bg-[#A6D608]" : "w-4 bg-black/10 hover:bg-black/20"
            }`}
          />
        ))}
      </div>

    </div>
  );
}
