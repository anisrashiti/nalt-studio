import { useMotionValueEvent, useScroll } from "framer-motion";
import { useState } from "react";
import { SECTION_LABELS } from "@/content/site";

/** The label of the last section whose top has reached the middle of the screen. */
export function useCurrentSection() {
  const { scrollY } = useScroll();
  const [label, setLabel] = useState(SECTION_LABELS.home);

  useMotionValueEvent(scrollY, "change", () => {
    const middle = window.innerHeight / 2;
    let next = SECTION_LABELS.home;

    for (const [id, sectionLabel] of Object.entries(SECTION_LABELS)) {
      const section = document.getElementById(id);
      if (section && section.getBoundingClientRect().top <= middle) {
        next = sectionLabel;
      }
    }

    setLabel(next);
  });

  return label;
}
