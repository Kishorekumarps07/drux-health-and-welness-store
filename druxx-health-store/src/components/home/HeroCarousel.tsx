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

  if (!heroSlides || heroSlides.length === 0) {
    return null; // Don't show a blank box if admin deleted all slides
  }

  if (!mounted) {
    return <div className="w-full aspect-[4/3] md:aspect-[21/7] lg:aspect-[21/6] bg-[#1E1E1E] animate-pulse rounded-xl" />;
  }

  const currentSlide = heroSlides[current];

  return (
    <div
      className="relative w-full overflow-hidden aspect-[16/9] md:aspect-[21/8] lg:aspect-[21/7] rounded-none md:rounded-[3rem] shadow-none md:shadow-xl border-none md:border md:border-gray-100"
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
            {/* Background cover effect */}
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

            {/* Mobile: Full-bleed image layout with bottom text overlay; Desktop: side-by-side splits */}
            <div className="relative z-10 w-full h-full max-w-[1400px] mx-auto flex flex-col md:flex-row items-center">
              
              {/* Text Area */}
              <div className="absolute bottom-0 inset-x-0 z-20 md:relative md:bottom-auto md:inset-x-auto w-full md:w-1/2 flex flex-col justify-end md:justify-center p-4 pt-12 md:p-0 md:pl-16 text-left bg-gradient-to-t from-black/85 via-black/40 to-transparent md:from-transparent md:via-transparent md:to-transparent text-white md:text-[#1A1A1A]">
                <h1 className={`font-black leading-[1.1] md:leading-[0.9] mb-1 md:mb-6 tracking-tight uppercase break-words text-lg md:text-6xl lg:text-8xl`}>
                  {currentSlide.title}
                </h1>
                <p className="text-gray-200 md:text-[#4A4A4A] mb-0 md:mb-10 leading-relaxed max-w-[280px] md:max-w-md font-medium tracking-wide text-[10px] md:text-xl line-clamp-1 md:line-clamp-3">
                  {currentSlide.subtitle}
                </p>
              </div>

              {/* Image Area */}
              <div className="absolute inset-0 md:relative w-full md:w-1/2 h-full md:h-[80%] flex items-center justify-center z-10 md:z-20">
                <div className="relative w-full h-full p-0 md:p-8">
                  {currentSlide.image && (
                    isVideo(currentSlide.image) ? (
                      <video src={currentSlide.image} autoPlay muted loop playsInline className="w-full h-full object-cover md:object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.08)]" />
                    ) : (
                      <Image src={currentSlide.image} alt={currentSlide.title} fill className="object-cover md:object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.08)]" priority sizes="(max-width: 768px) 100vw, 50vw" />
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

      <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {heroSlides.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)} className={`h-1 rounded-full transition-all duration-700 ${i === current ? "w-8 bg-[#A6D608]" : "w-2 bg-black/10 md:bg-white/40 hover:bg-black/20"}`} />
        ))}
      </div>
    </div>
  );
}
