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
    return <div className="w-full aspect-[16/9] md:aspect-[21/8] bg-gray-100 animate-pulse rounded-none md:rounded-[3rem]" />;
  }

  const currentSlide = heroSlides[current];

  return (
    <div
      className="relative w-full overflow-hidden rounded-none md:rounded-[3rem] shadow-none md:shadow-xl border-none md:border md:border-gray-100 transition-all duration-500 ease-in-out max-h-[60vh] md:max-h-[calc(100vh-220px)]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      id="hero-carousel"
    >
      {/* ── Dynamic Height Reference ── */}
      {/* This invisible image determines the carousel container height based on the active image's aspect ratio */}
      {currentSlide.image && !isVideo(currentSlide.image) ? (
        <img
          src={currentSlide.image}
          alt=""
          className="w-full h-auto opacity-0 pointer-events-none select-none block"
        />
      ) : (
        // Video fallback height (16:9 on mobile, 21:8 on desktop)
        <div className="w-full aspect-[16/9] md:aspect-[21/8] opacity-0 pointer-events-none" />
      )}

      {/* ── Slide Content ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
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
                  <img src={currentSlide.image} alt="" className="absolute inset-0 w-full h-full object-cover blur-[140px] opacity-20 scale-150" />
                )
              )}
            </div>

            {/* Slide Container */}
            <div className="relative z-10 w-full h-full flex items-center justify-center">
              {currentSlide.image && (
                isVideo(currentSlide.image) ? (
                  <video src={currentSlide.image} autoPlay muted loop playsInline className="w-full h-full object-cover" />
                ) : (
                  <img src={currentSlide.image} alt={currentSlide.title} className="w-full h-full object-cover" />
                )
              )}

              {/* Accessibility/SEO Text (Visually hidden to prevent obscuring custom banner graphics) */}
              {(currentSlide.title || currentSlide.subtitle) && (
                <div className="sr-only">
                  <h1>{currentSlide.title}</h1>
                  <p>{currentSlide.subtitle}</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ── Navigation Controls ── */}
      <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 z-30 hidden md:flex justify-between pointer-events-none">
        <button onClick={prev} className="pointer-events-auto w-14 h-14 rounded-full border border-gray-200 bg-white/70 backdrop-blur-xl flex items-center justify-center text-[#1A1A1A] hover:bg-[#A6D608] hover:border-[#A6D608] transition-all group shadow-lg">
          <ChevronLeft size={24} />
        </button>
        <button onClick={next} className="pointer-events-auto w-14 h-14 rounded-full border border-gray-200 bg-white/70 backdrop-blur-xl flex items-center justify-center text-[#1A1A1A] hover:bg-[#A6D608] hover:border-[#A6D608] transition-all group shadow-lg">
          <ChevronRight size={24} />
        </button>
      </div>

      {/* ── Bottom Gradient Fade (Amazon/Flipkart style to blend with content below) ── */}
      <div className="absolute bottom-0 inset-x-0 h-16 md:h-32 bg-gradient-to-t from-white via-white/40 to-transparent z-20 pointer-events-none" />

      {/* ── Slide Indicators ── */}
      <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {heroSlides.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)} className={`h-1 rounded-full transition-all duration-700 ${i === current ? "w-8 bg-[#A6D608]" : "w-2 bg-black/10 md:bg-white/40 hover:bg-black/20"}`} />
        ))}
      </div>
    </div>
  );
}
