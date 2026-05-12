"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { HeroSlide } from "@/store/cmsStore";

const isVideo = (url: string) => /\.(mp4|webm|mov|ogg)$/i.test(url) || url.includes('/video/upload/');

interface HeroCarouselProps {
  heroSlides: HeroSlide[];
}

export function HeroCarousel({ heroSlides }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const next = useCallback(() => {
    if (!heroSlides || heroSlides.length === 0) return;
    setCurrent((c) => (c + 1) % heroSlides.length);
  }, [heroSlides]);

  const prev = useCallback(() => {
    if (!heroSlides || heroSlides.length === 0) return;
    setCurrent((c) => (c - 1 + heroSlides.length) % heroSlides.length);
  }, [heroSlides]);

  useEffect(() => {
    if (!mounted || isPaused || !heroSlides || heroSlides.length === 0) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [isPaused, next, heroSlides, mounted]);

  if (!mounted || !heroSlides || heroSlides.length === 0) {
    return <div className="w-full aspect-[4/3] md:aspect-[21/7] lg:aspect-[21/6] bg-[#1E1E1E] animate-pulse rounded-xl" />;
  }

  const currentSlide = heroSlides[current];

  return (
    <div
      className="relative w-full overflow-hidden aspect-[3/4] md:aspect-[21/8] lg:aspect-[21/7] rounded-[2rem] md:rounded-[3rem] shadow-xl border border-gray-100"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      id="hero-carousel"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide.id}
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "-100%", opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
          className="absolute inset-0 z-10"
        >
          <div className="relative w-full h-full bg-[#F9F9F9] overflow-hidden">
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 bg-gradient-to-br from-white via-[#F3F4F6] to-[#E5E7EB]" />
              {currentSlide.image && (
                isVideo(currentSlide.image) ? (
                  <video src={currentSlide.image} autoPlay muted loop className="absolute inset-0 w-full h-full object-cover blur-[140px] opacity-20 scale-150" />
                ) : (
                  <Image src={currentSlide.image} alt="" fill className="object-cover blur-[140px] opacity-20 scale-150" sizes="100vw" />
                )
              )}
            </div>

            <div className="relative z-10 w-full h-full max-w-[1400px] mx-auto flex flex-col md:flex-row items-center px-8 md:px-16 pt-6 md:pt-0">
              <div className="w-full md:w-1/2 flex flex-col justify-center text-left pt-6 md:pt-0 shrink-0 md:shrink">
                <span className="inline-block px-3 py-1 rounded-full bg-black/5 text-black/40 text-[10px] font-bold tracking-[0.2em] mb-3 md:mb-6 uppercase border border-black/5">Premium Quality</span>
                <h1 className={`font-black text-[#1A1A1A] leading-[0.9] mb-3 md:mb-6 tracking-tight uppercase ${currentSlide.title.length > 20 ? "text-3xl sm:text-4xl md:text-5xl lg:text-7xl" : "text-5xl md:text-6xl lg:text-8xl"}`}>
                  {currentSlide.title}
                </h1>
                <p className="text-[#4A4A4A] mb-2 md:mb-10 leading-relaxed max-w-[280px] md:max-w-md font-medium tracking-wide text-base md:text-xl line-clamp-4">
                  {currentSlide.subtitle}
                </p>
              </div>

              <div className="w-full md:w-1/2 flex-1 md:h-[80%] min-h-[220px] relative flex items-center justify-center shrink-0 mt-2 md:mt-0 pb-6 md:pb-0">
                <div className="relative w-full h-full p-0 md:p-8">
                  {currentSlide.image && (
                    isVideo(currentSlide.image) ? (
                      <video src={currentSlide.image} autoPlay muted loop playsInline className="w-full h-full object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.12)]" />
                    ) : (
                      <Image src={currentSlide.image} alt={currentSlide.title} fill className="object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.12)]" priority sizes="(max-width: 768px) 100vw, 50vw" />
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 z-30 hidden md:flex justify-between pointer-events-none">
        <button onClick={prev} className="pointer-events-auto w-14 h-14 rounded-full border border-gray-200 bg-white/70 backdrop-blur-xl flex items-center justify-center text-[#1A1A1A] hover:bg-[#A6D608] hover:border-[#A6D608] transition-all group shadow-lg">
          <ChevronLeft size={24} />
        </button>
        <button onClick={next} className="pointer-events-auto w-14 h-14 rounded-full border border-gray-200 bg-white/70 backdrop-blur-xl flex items-center justify-center text-[#1A1A1A] hover:bg-[#A6D608] hover:border-[#A6D608] transition-all group shadow-lg">
          <ChevronRight size={24} />
        </button>
      </div>

      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4">
        {heroSlides.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)} className={`h-1.5 rounded-full transition-all duration-700 ${i === current ? "w-16 bg-[#A6D608]" : "w-4 bg-black/10 hover:bg-black/20"}`} />
        ))}
      </div>
    </div>
  );
}
