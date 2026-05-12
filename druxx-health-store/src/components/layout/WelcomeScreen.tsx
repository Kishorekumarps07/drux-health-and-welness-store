"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export function WelcomeScreen() {
  const [show, setShow] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const shown = sessionStorage.getItem("drux_welcome_shown");
    if (shown) {
      setShow(false);
      return;
    }

    // Progress counter animation
    const duration = 2500; // 2.5 seconds
    const interval = 20; // 20ms update
    const increment = 100 / (duration / interval);
    
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        return prev + increment;
      });
    }, interval);

    const exitTimer = setTimeout(() => {
      setShow(false);
      sessionStorage.setItem("drux_welcome_shown", "true");
    }, duration + 500);

    return () => {
      clearInterval(progressTimer);
      clearTimeout(exitTimer);
    };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            y: "-100%",
            transition: { duration: 1, ease: [0.76, 0, 0.24, 1] }
          }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white"
        >
          {/* Ambient Background Glow */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#A6D608]/5 blur-[150px] rounded-full" />
          </div>

          <div className="relative flex flex-col items-center">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="relative w-48 h-24 mb-8"
            >
              <Image 
                src="/logo.png" 
                alt="Drux" 
                fill 
                className="object-contain" 
                priority
              />
            </motion.div>

            {/* Counter Area */}
            <div className="relative mb-4 flex flex-col items-center">
              <motion.span 
                className="text-[10rem] md:text-[14rem] font-black leading-none tracking-tighter text-black/[0.03] select-none absolute top-1/2 -translate-y-1/2"
              >
                {Math.floor(progress)}
              </motion.span>
              
              <div className="relative z-10 flex flex-col items-center mt-8">
                 <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[#1E1E1E] text-2xl md:text-4xl font-black uppercase tracking-tighter text-center"
                >
                  Welcome to <span className="text-[#A6D608]">Drux</span>
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-gray-400 text-[10px] font-black uppercase tracking-[0.4em] mt-2"
                >
                  Premium Health & Wellness
                </motion.p>
              </div>
            </div>

            {/* Progress Bar Container */}
            <div className="mt-16 w-64 h-[3px] bg-gray-100 relative overflow-hidden rounded-full">
              <motion.div
                className="absolute inset-y-0 left-0 bg-[#A6D608]"
                style={{ width: `${progress}%` }}
                transition={{ type: "spring", damping: 25 }}
              />
            </div>

            <div className="mt-6 flex items-center gap-2">
               <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Initializing Marketplace</span>
               <span className="w-1.5 h-1.5 rounded-full bg-[#A6D608] animate-ping" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
