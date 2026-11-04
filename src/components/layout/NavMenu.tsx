import { AnimatePresence, motion } from "framer-motion";
import { NAV_LINKS } from "@/content/site";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const ITEMS = [{ label: "Home", href: "#home" }, ...NAV_LINKS];
const HIDDEN = { clipPath: "inset(0 0 100% 0 round 6px)" };
const SHOWN = { clipPath: "inset(0 0 0% 0 round 6px)" };

type NavMenuProps = {
  id: string;
  open: boolean;
  current: string;
  onNavigate: () => void;
};

export function NavMenu({ id, open, current, onNavigate }: NavMenuProps) {
  const reduced = usePrefersReducedMotion();

  return (
    <AnimatePresence>
      {open && (
        <motion.ul
          id={id}
          className="type-label absolute inset-x-0 top-[52px] rounded-pill bg-rule py-3 text-stone"
          initial={HIDDEN}
          animate={SHOWN}
          exit={HIDDEN}
          transition={{ duration: reduced ? 0 : 0.25, ease: [0.65, 0, 0.35, 1] }}
        >
          {ITEMS.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                onClick={onNavigate}
                aria-current={item.label === current ? "true" : undefined}
                className={`link-signal block px-3.5 py-3.5 md:py-1.5 ${item.label === current ? "text-cream" : ""}`}
              >
                {item.label}
              </a>
            </li>
          ))}
        </motion.ul>
      )}
    </AnimatePresence>
  );
}
