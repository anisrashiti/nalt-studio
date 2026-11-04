"use client";

import { animate, motion, useInView, useMotionValue } from "framer-motion";
import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

export function Intro() {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduced = usePrefersReducedMotion();
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const opacity = useMotionValue(1);
  const y = useMotionValue(0);

  // Hidden only once JavaScript runs and only if still below the screen, so the text can never get stuck invisible.
  useEffect(() => {
    const element = ref.current;
    if (element && !reduced && element.getBoundingClientRect().top > window.innerHeight) {
      opacity.set(0);
      y.set(24);
    }
  }, [reduced, opacity, y]);

  useEffect(() => {
    if (!inView) return;

    const transition = { duration: reduced ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] as const };
    const animations = [animate(opacity, 1, transition), animate(y, 0, transition)];
    return () => animations.forEach((animation) => animation.stop());
  }, [inView, reduced, opacity, y]);

  return (
    <section id="about" className="scroll-mt-nav px-gutter">
      <motion.p ref={ref} className="max-w-[620px] text-intro" style={{ opacity, y }}>
        We design and build websites, stores and software for companies with{" "}
        <span className="text-signal">somewhere to go</span>. One small team, strategy to code.{" "}
        <span className="text-stone">Find us in Prishtina, Kosovo.</span>
      </motion.p>
    </section>
  );
}
