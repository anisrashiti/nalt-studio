"use client";

import { useInView } from "framer-motion";
import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

type MediaVideoProps = {
  src: string;
};

/** A muted looping video that plays only while it is in view. */
export function MediaVideo({ src }: MediaVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const inView = useInView(ref, { amount: 0.2 });
  const reduced = usePrefersReducedMotion();
  const shouldPlay = inView && !reduced;

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    if (shouldPlay) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [shouldPlay]);

  return (
    <video
      ref={ref}
      src={src}
      muted
      loop
      playsInline
      preload="metadata"
      className="absolute inset-0 size-full object-cover"
    />
  );
}
