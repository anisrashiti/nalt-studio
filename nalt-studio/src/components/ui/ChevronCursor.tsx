"use client";

import { motion, useMotionValue } from "framer-motion";
import { useEffect, useState } from "react";
import { LogoSymbol } from "@/components/brand/LogoSymbol";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/** The chevron as a cursor, for mouse users only. Its tip is the pointer's hot spot. */
export function ChevronCursor() {
  const hasMouse = useMediaQuery("(hover: hover) and (pointer: fine)");
  const reduced = usePrefersReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [visible, setVisible] = useState(false);
  const [overLink, setOverLink] = useState(false);

  useEffect(() => {
    if (!hasMouse) return;

    const root = document.documentElement;
    root.dataset.cursor = "chevron";

    function onMove(event: PointerEvent) {
      x.set(event.clientX);
      y.set(event.clientY);
      setVisible(true);
      setOverLink(event.target instanceof Element && event.target.closest("a, button") !== null);
    }

    function onLeave() {
      setVisible(false);
    }

    window.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);

    return () => {
      delete root.dataset.cursor;
      window.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
    };
  }, [hasMouse, x, y]);

  if (!hasMouse) {
    return null;
  }

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[70]"
      style={{ x, y, opacity: visible ? 1 : 0 }}
    >
      <motion.div
        className="-translate-x-1/2 origin-top"
        animate={{ scale: overLink ? 1.25 : 1 }}
        transition={{ duration: reduced ? 0 : 0.15 }}
      >
        <LogoSymbol height={16} className="block" />
      </motion.div>
    </motion.div>
  );
}
