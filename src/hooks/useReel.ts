import { useAnimationFrame, useInView, useMotionValue } from "framer-motion";
import { useEffect, useState, type RefObject } from "react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

// How long the placeholder reel loops for until a real video is set.
const PLACEHOLDER_SECONDS = 20;

/** Playback state for the showreel. It runs only while in view, and never starts on its own under reduced motion. */
export function useReel(
  containerRef: RefObject<HTMLElement | null>,
  videoRef: RefObject<HTMLVideoElement | null>,
) {
  const progress = useMotionValue(0);
  const reduced = usePrefersReducedMotion();
  const inView = useInView(containerRef);
  const [choice, setChoice] = useState<boolean | null>(null);

  const playing = choice ?? !reduced;
  const running = playing && inView;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (running) {
      video.play().catch((error: DOMException) => {
        // A pause during startup also rejects; only a blocked autoplay should show the play button.
        if (error.name === "NotAllowedError") {
          setChoice(false);
        }
      });
    } else {
      video.pause();
    }
  }, [running, videoRef]);

  useAnimationFrame((_, delta) => {
    if (!running) return;

    const video = videoRef.current;
    if (video) {
      progress.set(video.duration ? video.currentTime / video.duration : 0);
    } else {
      progress.set((progress.get() + delta / 1000 / PLACEHOLDER_SECONDS) % 1);
    }
  });

  return {
    progress,
    playing,
    toggle: () => setChoice(!playing),
  };
}
