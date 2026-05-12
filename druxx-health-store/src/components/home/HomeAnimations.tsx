"use client";

import { motion } from "framer-motion";
import React from "react";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.8, ease: "easeOut" as const }
};

export function HomeAnimations({ children }: { children: React.ReactNode }) {
  const childrenArray = React.Children.toArray(children);
  
  return (
    <>
      {childrenArray.map((child, index) => (
        <motion.div key={index} {...fadeInUp}>
          {child}
        </motion.div>
      ))}
    </>
  );
}
