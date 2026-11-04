"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

type MaskSwapProps = {
  /** Changing this swaps the content: the old slides up and clips out, the new slides in from below. */
  swapKey: string;
  className?: string;
  children: ReactNode;
};

export function MaskSwap({ swapKey, className = "", children }: MaskSwapProps) {
  const reduced = usePrefersReducedMotion();
  const transition = reduced ? { duration: 0 } : { duration: 0.4, ease: [0.65, 0, 0.35, 1] as const };

  return (
    <div className={`grid overflow-clip ${className}`}>
      <AnimatePresence initial={false}>
        <motion.div
          key={swapKey}
          className="[grid-area:1/1]"
          initial={{ y: "110%" }}
          animate={{ y: 0 }}
          exit={{ y: "-110%" }}
          transition={transition}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
