"use client";

import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useState } from "react";
import { Wordmark } from "@/components/brand/Wordmark";
import { useCurrentSection } from "@/hooks/useCurrentSection";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { Clock } from "./Clock";
import { NavLinks } from "./NavLinks";
import { NavPill } from "./NavPill";

const COLLAPSE_AFTER_PX = 80;

// How far the logo moves to sit inside the pill.
const LOGO_IN_PILL = { desktop: { x: 2, y: -1 }, phone: { x: 6, y: -9 } };

export function SiteHeader() {
  const reduced = usePrefersReducedMotion();
  const isPhone = useMediaQuery("(width < 48rem)");
  const section = useCurrentSection();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > COLLAPSE_AFTER_PX));

  // The full links do not fit on a phone, so it always shows the pill.
  const collapsed = scrolled || isPhone;
  const logoOffset = isPhone ? LOGO_IN_PILL.phone : LOGO_IN_PILL.desktop;
  const transition = { duration: reduced ? 0 : 0.35, ease: [0.65, 0, 0.35, 1] as const };

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <NavPill collapsed={collapsed} section={section} />

      <motion.a
        href="#home"
        tabIndex={collapsed ? -1 : undefined}
        className={`absolute top-[34px] left-gutter block ${collapsed ? "" : "pointer-events-auto"}`}
        initial={false}
        animate={collapsed ? logoOffset : { x: 0, y: 0 }}
        transition={transition}
      >
        <Wordmark height={14} className="block" />
      </motion.a>

      <motion.nav
        aria-label="Main"
        inert={collapsed}
        className={`absolute top-[34px] left-[132px] hidden md:block ${collapsed ? "" : "pointer-events-auto"}`}
        initial={false}
        animate={{ clipPath: collapsed ? "inset(-8px 100% -8px -8px)" : "inset(-8px -8px -8px -8px)" }}
        transition={transition}
      >
        <NavLinks />
      </motion.nav>

      <div className="absolute top-6 right-gutter md:top-[34px]">
        <Clock />
      </div>
    </header>
  );
}
