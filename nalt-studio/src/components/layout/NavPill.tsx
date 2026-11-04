import { motion } from "framer-motion";
import { useEffect, useId, useRef, useState } from "react";
import { LogoSymbol } from "@/components/brand/LogoSymbol";
import { MaskSwap } from "@/components/ui/MaskSwap";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { NavMenu } from "./NavMenu";

type NavPillProps = {
  collapsed: boolean;
  section: string;
};

export function NavPill({ collapsed, section }: NavPillProps) {
  const reduced = usePrefersReducedMotion();
  const menuId = useId();
  const rootRef = useRef<HTMLElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [requestedOpen, setRequestedOpen] = useState(false);
  const open = requestedOpen && collapsed;

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setRequestedOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setRequestedOpen(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <nav
      ref={rootRef}
      aria-label="Menu"
      inert={!collapsed}
      className={`absolute top-inset left-inset w-[232px] ${collapsed ? "pointer-events-auto" : ""}`}
    >
      <motion.button
        ref={buttonRef}
        type="button"
        onClick={() => setRequestedOpen(!open)}
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`Menu. Current section: ${section}`}
        className="group relative block h-12 w-full cursor-pointer rounded-pill bg-rule"
        initial={false}
        animate={{ clipPath: collapsed ? "inset(0 0% 0 0 round 6px)" : "inset(0 100% 0 0 round 6px)" }}
        transition={{ duration: reduced ? 0 : 0.35, ease: [0.65, 0, 0.35, 1] }}
      >
        <MaskSwap
          swapKey={section}
          className="type-label absolute top-[17px] left-[108px] transition-colors group-hover:text-signal group-focus-visible:text-signal"
        >
          {section}
        </MaskSwap>
        <motion.span
          className="absolute top-5 right-4 block"
          initial={false}
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: reduced ? 0 : 0.25 }}
        >
          <LogoSymbol height={7.724} className="block" />
        </motion.span>
      </motion.button>
      <NavMenu id={menuId} open={open} current={section} onNavigate={() => setRequestedOpen(false)} />
    </nav>
  );
}
