"use client";

import { motion, useScroll } from "framer-motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-signal"
      style={{ scaleX: scrollYProgress }}
    />
  );
}
