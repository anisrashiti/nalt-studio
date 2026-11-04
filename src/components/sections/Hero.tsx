"use client";

import { motion, useMotionTemplate, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { MediaCaption } from "@/components/ui/MediaCaption";
import { PlayPauseButton } from "@/components/ui/PlayPauseButton";
import { ReelProgress } from "@/components/ui/ReelProgress";
import { SHOWREEL_SRC } from "@/content/site";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useReel } from "@/hooks/useReel";

const SHRINK_OVER_PX = 280;
const RADIUS = 8;

function ramp(value: number, from: number, to: number) {
  return Math.min(Math.max((value - from) / (to - from), 0), 1);
}

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduced = usePrefersReducedMotion();
  const isPhone = useMediaQuery("(width < 48rem)");
  const { progress, playing, toggle } = useReel(sectionRef, videoRef);
  const { scrollY } = useScroll();

  // Phones and reduced motion skip the scroll effect and show the card from the start.
  const isStatic = reduced || isPhone;
  const sideInset = isPhone ? 8 : 16;
  const bottomInset = isPhone ? 40 : 64;

  // 0 is the full-screen reel of frame A, 1 is the inset card of frame C.
  const shrink = useTransform(scrollY, (y) => (isStatic ? 1 : ramp(y, 0, SHRINK_OVER_PX)));

  const side = useTransform(shrink, (s) => s * sideInset);
  const bottom = useTransform(shrink, (s) => s * bottomInset);
  const radius = useTransform(shrink, (s) => s * RADIUS);
  const clipPath = useMotionTemplate`inset(${side}px ${side}px ${bottom}px ${side}px round ${radius}px)`;

  const controlX = useTransform(side, (v) => -v);
  const controlY = useTransform(bottom, (v) => -v);

  // When static, the title stays visible inside the card, in place of the placeholder caption.
  const titleOpacity = useTransform(shrink, (s) => (isStatic ? 1 : 1 - ramp(s, 0, 0.6)));
  const titleY = useTransform(shrink, (s) => {
    if (isPhone) return -8;
    return isStatic ? -28 : s * -24;
  });
  const captionOpacity = useTransform(shrink, (s) => (isStatic ? 0 : ramp(s, 0.5, 1)));

  return (
    <section ref={sectionRef} id="home" className="relative h-svh min-h-[560px]">
      <motion.div className="absolute inset-0 overflow-clip bg-graphite" style={{ clipPath }}>
        {SHOWREEL_SRC ? (
          <video
            ref={videoRef}
            src={SHOWREEL_SRC}
            muted
            loop
            playsInline
            className="absolute inset-0 size-full object-cover"
          />
        ) : (
          <motion.div className="absolute bottom-[106px] left-9" style={{ opacity: captionOpacity }}>
            <MediaCaption kind="video" label="Showreel" description="Hero, shown in its shrunk state." />
          </motion.div>
        )}

        <motion.div
          className="absolute right-gutter bottom-[76px] left-gutter text-title md:right-auto md:whitespace-nowrap"
          style={{ opacity: titleOpacity, y: titleY }}
        >
          <h1>We’re NALT</h1>
          <p className="mt-0.5 text-stone">Software studio, Prishtina</p>
        </motion.div>

        <motion.div className="absolute right-gutter bottom-6" style={{ x: controlX, y: controlY }}>
          <PlayPauseButton playing={playing} onToggle={toggle} />
        </motion.div>

        <motion.div className="absolute inset-x-0 bottom-0" style={{ y: controlY }}>
          <ReelProgress value={progress} />
        </motion.div>
      </motion.div>
    </section>
  );
}
