import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";

gsap.registerPlugin(CustomEase);
CustomEase.create("nalt-expand", "0.76,0,0.18,1");

// Intentionally scoped to the current document, without cookies or storage.
// A full reload plays the opening; client-side remounts use the resolved scene.
let hasPlayed = false;

export const NALT_INTRO_TIMINGS = {
  locate: 0.15,
  draw: 0.35,
  identify: 0.85,
  break: 1.15,
  expand: 1.5,
  typography: 1.75,
  resolve: 2,
  live: 3,
} as const;

export function createNaltIntro(scene: HTMLElement) {
  const select = gsap.utils.selector(scene);
  const mark = scene.querySelector<HTMLElement>(".hero-mark")!;
  const fill = scene.querySelector<SVGPathElement>(".mark-fill")!;
  const outline = scene.querySelector<SVGPathElement>(".mark-outline")!;
  const interfaceElements = select(".interface-reveal");
  const content = select(".content-reveal");
  const headlines = select(".headline-line");
  const decoration = select(".coordinate-system, .identity-fragments, .mark-ghost, .scan-line");
  const length = outline.getTotalLength();
  const motion = gsap.matchMedia();
  let timeline: gsap.core.Timeline | undefined;
  let resizeObserver: ResizeObserver | undefined;
  let lastWidth = scene.clientWidth;
  let lastHeight = scene.clientHeight;

  const setLive = () => {
    document.documentElement.classList.remove("intro-pending");
    scene.dataset.introState = "live";
    hasPlayed = true;
    gsap.set(mark, { clearProps: "transform,opacity,visibility,willChange" });
    gsap.set(fill, { opacity: 1 });
    gsap.set(outline, { opacity: 0 });
    gsap.set([...interfaceElements, ...content, ...headlines], { clearProps: "transform,opacity,visibility,willChange" });
    gsap.set(decoration, { opacity: 0 });
  };

  const skip = () => {
    const skipHadFocus = document.activeElement === scene.querySelector(".skip-intro");
    timeline?.progress(1);
    setLive();
    if (skipHadFocus) scene.querySelector<HTMLAnchorElement>(".wordmark")?.focus();
  };

  motion.add({ reduced: "(prefers-reduced-motion: reduce)", motion: "(prefers-reduced-motion: no-preference)" }, (context) => {
    if (context.conditions?.reduced || hasPlayed) {
      setLive();
      return;
    }

    const small = scene.clientWidth < 768;
    const finalBox = mark.getBoundingClientRect();
    const sceneBox = scene.getBoundingClientRect();
    const startWidth = small ? 92 : Math.min(180, sceneBox.width * 0.11);
    const initialScale = startWidth / finalBox.width;
    const x = sceneBox.left + sceneBox.width / 2 - (finalBox.left + finalBox.width / 2);
    const y = sceneBox.top + sceneBox.height / 2 - (finalBox.top + finalBox.height / 2);

    scene.style.setProperty("--intro-mark-width", `${startWidth}px`);
    scene.dataset.introState = "playing";
    gsap.set(mark, { x, y, scale: initialScale, opacity: 1, transformOrigin: "50% 50%", willChange: "transform" });
    gsap.set(fill, { opacity: 0 });
    gsap.set(outline, { opacity: 0, strokeDasharray: length, strokeDashoffset: length });
    gsap.set([...content, ...interfaceElements], { opacity: 0, y: 8 });
    gsap.set(headlines, { yPercent: 112, willChange: "transform" });
    gsap.set(decoration, { opacity: 0 });
    gsap.set(select(".intro-letter"), { xPercent: (index: number) => index === 0 ? -108 : 108 });

    timeline = gsap.timeline({ id: "nalt-intro", onComplete: setLive });
    for (const [label, time] of Object.entries(NALT_INTRO_TIMINGS)) timeline.addLabel(label, time);

    timeline
      .to(select(".coordinate-system"), { opacity: 1, duration: 0.26, ease: "power1.out" }, "locate")
      .set(outline, { opacity: 1 }, "draw")
      .to(outline, { strokeDashoffset: 0, duration: 0.6, ease: "power2.inOut" }, "draw")
      .to(fill, { opacity: 1, duration: 0.14 }, "draw+=0.55")
      .to(outline, { opacity: 0, duration: 0.12 }, "draw+=0.65")
      .set(select(".identity-fragments"), { opacity: 1 }, "identify")
      .to(select(".intro-letter"), { xPercent: 0, duration: 0.28, stagger: 0.035, ease: "power3.out" }, "identify")
      .fromTo(select(".ghost-one"), { scale: 1, opacity: 0.3 }, { scale: 1.5, opacity: 0, duration: 0.48, ease: "power2.out", immediateRender: false }, "break")
      .fromTo(select(".ghost-two"), { scale: 1, opacity: 0.3 }, { scale: 1.85, opacity: 0, duration: 0.48, ease: "power2.out", immediateRender: false }, "break+=0.07")
      .to(select(".intro-letter"), { xPercent: (index: number) => index === 0 ? -110 : 110, duration: 0.2, ease: "power2.in" }, "break+=0.08")
      .fromTo(select(".scan-line"), { xPercent: -100, opacity: 0 }, { xPercent: 100, opacity: 0.7, duration: 0.15, ease: "none" }, "break+=0.1")
      .to(select(".scan-line"), { opacity: 0, duration: 0.07 }, "break+=0.25")
      .to(select(".guide"), { scale: 1.15, opacity: 0.45, duration: 0.2, ease: "power2.out" }, "break")
      .to(select(".technical-marker"), {
        x: (index: number) => index % 2 ? 28 : -28,
        y: (index: number) => index < 2 ? -20 : 20,
        opacity: 0,
        duration: 0.36,
        ease: "power2.out",
      }, "break")
      .to(mark, { x: 0, y: 0, scale: 1, duration: 1.02, ease: "nalt-expand" }, "expand")
      .to(select(".coordinate-system, .identity-fragments"), { opacity: 0, duration: 0.32 }, "expand")
      .to(headlines, { yPercent: 0, duration: 0.7, stagger: 0.1, ease: "power4.out" }, "typography")
      .to(select(".eyebrow"), { opacity: 1, y: 0, duration: 0.4 }, "typography-=0.05")
      .to(select(".hero-support .content-reveal"), { opacity: 1, y: 0, duration: 0.4, stagger: 0.1 }, "typography+=0.4")
      .to(interfaceElements, { opacity: 1, y: 0, duration: 0.45, stagger: 0.12, ease: "power2.out" }, "resolve")
      .call(() => undefined, [], "live");

    if (small) timeline.timeScale(1.18);

    // Resize settles the same SVG into the responsive CSS position; it never swaps the mark.
    resizeObserver = new ResizeObserver(() => {
      if (scene.clientWidth === lastWidth && scene.clientHeight === lastHeight) return;
      lastWidth = scene.clientWidth;
      lastHeight = scene.clientHeight;
      if (timeline && timeline.progress() < 1) skip();
    });
    resizeObserver.observe(scene);
    return () => resizeObserver?.disconnect();
  });

  return {
    skip,
    destroy() {
      resizeObserver?.disconnect();
      motion.revert();
      document.documentElement.classList.remove("intro-pending");
    },
  };
}
