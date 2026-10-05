import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type RowElements = {
  row: HTMLElement;
  action: HTMLElement;
  title: HTMLElement;
  metadata: HTMLElement;
  preview: HTMLElement;
  image: HTMLElement;
  parallax: HTMLElement;
  marker: HTMLElement;
  symbol: HTMLElement;
  rule: HTMLElement;
};

export function createSelectedWork(section: HTMLElement) {
  const rows: RowElements[] = Array.from(section.querySelectorAll<HTMLElement>("[data-work-row]")).map((row) => ({
    row,
    action: row.querySelector<HTMLElement>("[data-work-action]")!,
    title: row.querySelector<HTMLElement>("[data-work-title]")!,
    metadata: row.querySelector<HTMLElement>("[data-work-metadata]")!,
    preview: row.querySelector<HTMLElement>("[data-work-preview]")!,
    image: row.querySelector<HTMLElement>("[data-work-image]")!,
    parallax: row.querySelector<HTMLElement>("[data-work-parallax]")!,
    marker: row.querySelector<HTMLElement>("[data-work-marker]")!,
    symbol: row.querySelector<HTMLElement>("[data-work-symbol]")!,
    rule: row.querySelector<HTMLElement>("[data-work-rule]")!,
  }));
  const motion = gsap.matchMedia();
  let activeIndex: number | null = null;
  let applyActive = () => {};
  let move: (index: number, clientX: number, clientY: number) => void = () => {};
  let reset: (index: number) => void = () => {};

  motion.add({
    reduced: "(prefers-reduced-motion: reduce)",
    animated: "(prefers-reduced-motion: no-preference)",
    finePointer: "(hover: hover) and (pointer: fine)",
  }, (context) => {
    const reduced = Boolean(context.conditions?.reduced);
    const parallaxEnabled = !reduced && Boolean(context.conditions?.finePointer) && navigator.maxTouchPoints === 0;
    const revealTimelines = rows.map((elements) => {
      const timeline = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });
      timeline
        .fromTo(elements.preview, { clipPath: "inset(0 50% 0 50%)" }, { clipPath: "inset(0 0% 0 0%)", duration: 0.52 }, 0)
        .fromTo(elements.image, { scale: reduced ? 1 : 1.08 }, { scale: 1, duration: 0.65 }, 0)
        .fromTo(elements.title, { x: 0 }, { x: reduced ? 0 : 16, duration: 0.4 }, 0)
        .fromTo(elements.metadata, { x: 0 }, { x: reduced ? 0 : -6, duration: 0.4 }, 0)
        .fromTo(elements.marker, { opacity: 0 }, { opacity: 1, duration: 0.24 }, 0)
        .fromTo(elements.rule, { opacity: 0.23 }, { opacity: 0.58, duration: 0.38 }, 0);
      if (elements.action.tagName === "BUTTON") timeline.fromTo(elements.symbol, { rotation: 0 }, { rotation: reduced ? 0 : 45, duration: 0.32 }, 0);
      return timeline;
    });
    const quietTimelines = rows.map(({ action }) => gsap.fromTo(action, { opacity: 1 }, { opacity: 0.78, duration: 0.32, paused: true, ease: "power2.out" }));
    const pointerTweens = rows.map(({ parallax }) => parallaxEnabled ? {
      x: gsap.quickTo(parallax, "x", { duration: 0.45, ease: "power3.out" }),
      y: gsap.quickTo(parallax, "y", { duration: 0.45, ease: "power3.out" }),
    } : null);

    if (!reduced) {
      const entry = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: { trigger: section, start: "top 88%", once: true },
      });
      entry
        .from(section.querySelector("[data-work-label]"), { yPercent: 110, duration: 0.42 }, 0)
        .from(section.querySelector("[data-work-count]"), { opacity: 0, y: 10, duration: 0.4 }, 0.1)
        .from(section.querySelectorAll("[data-work-rule]"), { scaleX: 0, transformOrigin: "left center", duration: 0.55, stagger: 0.055 }, 0.18)
        .from(rows.map(({ row }) => row), { y: 20, opacity: 0, duration: 0.5, stagger: 0.08 }, 0.28);
    }

    reset = (index) => {
      pointerTweens[index]?.x(0);
      pointerTweens[index]?.y(0);
    };
    move = (index, clientX, clientY) => {
      if (!parallaxEnabled || activeIndex !== index || !pointerTweens[index]) return;
      const bounds = rows[index].row.getBoundingClientRect();
      const x = gsap.utils.clamp(-1, 1, ((clientX - bounds.left) / bounds.width - 0.5) * 2);
      const y = gsap.utils.clamp(-1, 1, ((clientY - bounds.top) / bounds.height - 0.5) * 2);
      pointerTweens[index]!.x(x * 10);
      pointerTweens[index]!.y(y * 7);
    };
    applyActive = () => {
      revealTimelines.forEach((timeline, index) => {
        const active = index === activeIndex;
        const quiet = activeIndex !== null && !active;
        if (reduced) {
          timeline.progress(active ? 1 : 0).pause();
          quietTimelines[index].progress(quiet ? 1 : 0).pause();
        } else {
          if (active) timeline.play(); else timeline.reverse();
          if (quiet) quietTimelines[index].play(); else quietTimelines[index].reverse();
        }
        if (!active) reset(index);
      });
    };
    applyActive();

    return () => {
      pointerTweens.forEach((tweens) => {
        tweens?.x.tween.kill();
        tweens?.y.tween.kill();
      });
      applyActive = () => {};
      move = () => {};
      reset = () => {};
    };
  });

  return {
    setActive(index: number | null) {
      activeIndex = index;
      applyActive();
    },
    movePointer(index: number, clientX: number, clientY: number) { move(index, clientX, clientY); },
    resetPointer(index: number) { reset(index); },
    destroy() { motion.revert(); },
  };
}
