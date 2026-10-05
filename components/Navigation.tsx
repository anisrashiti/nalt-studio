"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const items = ["WORK", "CAPABILITIES", "ABOUT", "CONTACT"];

export function Navigation() {
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      menuButton.current?.focus();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return (
    <header className="navigation interface-reveal">
      <Link className="wordmark" href="/" aria-label="NALT Studio home">
        <Image src="/brand/nalt-wordmark.png" alt="NALT" width={1075} height={235} priority />
      </Link>
      <button
        ref={menuButton}
        className="menu-toggle mono"
        type="button"
        aria-expanded={open}
        aria-controls="primary-navigation"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? "CLOSE" : "MENU"}<span aria-hidden="true">{open ? "−" : "+"}</span>
      </button>
      <nav id="primary-navigation" aria-label="Primary" className="nav-items mono" data-open={open}>
        {items.map((item) => (
          item === "WORK" || item === "CAPABILITIES"
            ? <a key={item} className="nav-item" href={item === "WORK" ? "#work" : "#capabilities"} onClick={() => setOpen(false)}>{item}</a>
            : <span key={item} className="nav-item" aria-disabled="true" title="Coming soon">{item}</span>
        ))}
      </nav>
    </header>
  );
}
