"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ShieldCheck, Smartphone, Zap, ChevronLeft, ChevronRight, Target, Heart } from "lucide-react";
import { AdvantageItem } from "@/store/cmsStore";

const iconMap: Record<string, any> = {
  shield: <ShieldCheck size={32} className="text-[#A6D608]" />,
  smartphone: <Smartphone size={32} className="text-[#2CA7A0]" />,
  zap: <Zap size={32} className="text-[#FF7A00]" />,
  target: <Target size={32} className="text-[#08D6A6]" />,
  heart: <Heart size={32} className="text-[#D6085A]" />,
};

interface AdvantageCarouselProps {
  advantages: AdvantageItem[];
}

export function AdvantageCarousel({ advantages }: AdvantageCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const next = useCallback(() => {
    if (!advantages || advantages.length === 0) return;
    setCurrent((c) => (c + 1) % advantages.length);
  }, [advantages]);

  const prev = useCallback(() => {
    if (!advantages || advantages.length === 0) return;
    setCurrent((c) => (c - 1 + advantages.length) % advantages.length);
  }, [advantages]);

  useEffect(() => {
    if (!mounted || !advantages || advantages.length === 0) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next, advantages, mounted]);

  if (!advantages || advantages.length === 0) {
    return null; // Do not render if admin intentionally deleted all advantages
  }

  if (!mounted) {
    return <div className="w-full h-[500px] bg-[#1E1E1E] animate-pulse" />;
  }

  return (
    <section className="py-12 md:py-24 bg-[#1E1E1E] overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 md:mb-16">
          <div>
            <p className="text-[#A6D608] font-black uppercase tracking-[0.3em] text-[8px] md:text-[10px] mb-3 md:mb-4">The Drux Advantage</p>
            <h2 className="text-3xl md:text-6xl font-black text-white uppercase tracking-tighter leading-[0.85]">
              More Than Just <br />A Store.
            </h2>
          </div>
          <div className="flex items-center gap-4">
             <button onClick={prev} className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white/5 transition-all"><ChevronLeft size={18} /></button>
             <button onClick={next} className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white/5 transition-all"><ChevronRight size={18} /></button>
          </div>
        </div>

        <div className="relative min-h-[500px] md:min-h-[550px]">
          {advantages.map((item, i) => (
            <div
              key={item.id}
              className={`absolute inset-0 transition-all duration-1000 flex flex-col md:flex-row items-center gap-6 md:gap-10 ${
                i === current ? "opacity-100 translate-x-0 z-10 scale-100" : "opacity-0 translate-x-12 z-0 scale-95"
              }`}
            >
              <div className="w-full md:w-2/3 h-[400px] md:h-[550px] rounded-[2rem] md:rounded-[3rem] border border-white/5 relative overflow-hidden group shadow-2xl">
                 {item.image ? (
                   <Image src={item.image} alt={item.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 66vw" />
                 ) : (
                   <div className="absolute inset-0 bg-gray-900 flex items-center justify-center text-white/10 italic">No Image</div>
                 )}
                 <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                 <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
                 <div className="absolute inset-0 p-6 md:p-16 flex flex-col justify-end">
                    <div className="mb-4 md:mb-6 p-3 md:p-4 w-fit rounded-xl md:rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
                       {iconMap[item.iconType] || <ShieldCheck size={24} className="text-[#A6D608] md:w-8 md:h-8" />}
                    </div>
                    <h3 className="text-2xl md:text-5xl font-black text-white mb-3 md:mb-4 uppercase tracking-tighter leading-none">{item.title}</h3>
                    <p className="text-white/70 text-sm md:text-xl font-medium leading-relaxed max-w-xl line-clamp-3 md:line-clamp-none">{item.desc}</p>
                 </div>
              </div>

              <div className="hidden md:flex flex-col gap-6 w-1/3">
                 <p className="text-[#A6D608] font-black text-xs uppercase tracking-widest opacity-50">Up Next</p>
                 {advantages.filter((_, idx) => idx !== current).slice(0, 2).map((other) => (
                   <div key={other.id} className="p-8 rounded-[2.5rem] bg-white/5 border border-white/5 flex items-center gap-6 group hover:bg-white/10 transition-all cursor-pointer" onClick={() => setCurrent(advantages.indexOf(other))}>
                      <div className="w-16 h-16 rounded-2xl overflow-hidden relative shrink-0">
                         {other.image ? <Image src={other.image} alt={other.title} fill className="object-cover opacity-60 group-hover:opacity-100 transition-opacity" sizes="64px" /> : <div className="absolute inset-0 bg-gray-800" />}
                      </div>
                      <div>
                        <h4 className="text-white font-black uppercase text-sm tracking-tight mb-1">{other.title}</h4>
                        <p className="text-gray-500 text-[11px] line-clamp-1">{other.desc}</p>
                      </div>
                   </div>
                 ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 mt-12">
           {advantages.map((_, i) => (
             <button key={i} onClick={() => setCurrent(i)} className={`h-1 transition-all duration-500 rounded-full ${i === current ? 'w-12 bg-[#A6D608]' : 'w-4 bg-white/10'}`} />
           ))}
        </div>
      </div>
    </section>
  );
}
