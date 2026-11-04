"use client";

import { useEffect, useRef, useState } from "react";
import { EMAIL } from "@/content/site";
import { CopiedChip } from "./CopiedChip";

const CHIP_MS = 2000;

export function CopyEmail() {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(EMAIL);
    } catch {
      window.location.href = `mailto:${EMAIL}`;
      return;
    }

    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), CHIP_MS);
  }

  return (
    <span className="relative inline-block">
      <button
        type="button"
        onClick={copy}
        aria-label={`Copy email address ${EMAIL}`}
        className="link-signal cursor-pointer select-text"
      >
        {EMAIL}
      </button>
      <span aria-live="polite" className="absolute top-1/2 left-full ml-[11px] -translate-y-1/2 whitespace-nowrap">
        {copied && <CopiedChip />}
      </span>
    </span>
  );
}
