import { motion, type MotionValue } from "framer-motion";

type ReelProgressProps = {
  /** Playback position from 0 to 1. */
  value: MotionValue<number>;
};

export function ReelProgress({ value }: ReelProgressProps) {
  return (
    <div aria-hidden className="h-[3px] bg-cream">
      <motion.div className="h-full origin-left bg-signal" style={{ scaleX: value }} />
    </div>
  );
}
