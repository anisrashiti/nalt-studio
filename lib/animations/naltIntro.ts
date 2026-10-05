import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(CustomEase, ScrollTrigger);
CustomEase.create("nalt-expand", "0.76,0,0.18,1");

// Intentionally scoped to the current document, without cookies or storage.
// A full reload plays the opening; client-side remounts use the resolved scene.
let hasPlayed = false;

export const NALT_INTRO_TIMINGS = {
  locate: 0.12,
  draw: 0.28,
  identify: 1,
  massive: 1.43,
  break: 1.95,
  expand: 2.4,
  typography: 2.7,
  resolve: 3.1,
  live: 4.05,
} as const;

function createLiveMotion(scene: HTMLElement) {
  const media = gsap.matchMedia();
  const select = gsap.utils.selector(scene);
  media.add("(prefers-reduced-motion: no-preference)", () => {
    const small = scene.clientWidth < 768;
    gsap.timeline({
      scrollTrigger: {
        id: "nalt-hero-exit",
        trigger: scene,
        start: "top top",
        end: "bottom top",
        scrub: 0.45,
      },
    })
      .to(select(".hero-content"), { y: small ? -22 : -40, ease: "none", duration: 1 }, 0)
      .to(select(".hero-mark-scroll"), { x: small ? 35 : 70, y: -65, ease: "none", duration: 1 }, 0)
      .to(select(".hero-support, .global-metadata, .viewport-metadata"), { opacity: 0.4, ease: "none", duration: 1 }, 0);

    // Touch and hybrid touch devices retain native, stationary hero interaction.
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches || navigator.maxTouchPoints > 0) return;
    const mark = scene.querySelector<SVGSVGElement>(".hero-mark > svg")!;
    const heading = scene.querySelector<HTMLElement>(".hero-heading")!;
    const settings = { duration: 0.65, ease: "power3.out" };
    const markX = gsap.quickTo(mark, "x", settings);
    const markY = gsap.quickTo(mark, "y", settings);
    const headingX = gsap.quickTo(heading, "x", settings);
    const headingY = gsap.quickTo(heading, "y", settings);
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const box = scene.getBoundingClientRect();
      const x = gsap.utils.clamp(-1, 1, (event.clientX - box.left) / box.width * 2 - 1);
      const y = gsap.utils.clamp(-1, 1, (event.clientY - box.top) / box.height * 2 - 1);
      markX(x * 4);
      markY(y * 4);
      headingX(x * -1.5);
      headingY(y * -1.5);
    };
    const reset = () => { markX(0); markY(0); headingX(0); headingY(0); };
    scene.addEventListener("pointermove", move, { passive: true });
    scene.addEventListener("pointerleave", reset);
    window.addEventListener("blur", reset);
    return () => {
      scene.removeEventListener("pointermove", move);
      scene.removeEventListener("pointerleave", reset);
      window.removeEventListener("blur", reset);
      for (const quick of [markX, markY, headingX, headingY]) quick.tween.kill();
    };
  });
  return media;
}

export function createNaltIntro(scene: HTMLElement) {
  const select = gsap.utils.selector(scene);
  const mark = scene.querySelector<HTMLElement>(".hero-mark")!;
  const fill = mark.querySelector<SVGPathElement>(".mark-fill")!;
  const outline = mark.querySelector<SVGPathElement>(".mark-outline")!;
  const fragments = scene.querySelector<HTMLElement>(".identity-fragments")!;
  const letterN = scene.querySelector<HTMLElement>(".letter-n")!;
  const letterL = scene.querySelector<HTMLElement>(".letter-l")!;
  const letterT = scene.querySelector<HTMLElement>(".letter-t")!;
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
  let live = false;
  let liveMotion: ReturnType<typeof createLiveMotion> | undefined;

  const setLive = () => {
    if (live) return;
    live = true;
    document.documentElement.classList.remove("intro-pending");
    scene.dataset.introState = "live";
    scene.dataset.introPhase = "live";
    hasPlayed = true;
    gsap.set(mark, { clearProps: "transform,opacity,visibility,willChange" });
    gsap.set(fill, { opacity: 1 });
    gsap.set(outline, { opacity: 0 });
    gsap.set([...interfaceElements, ...content, ...headlines], { clearProps: "transform,opacity,visibility,willChange" });
    gsap.set(decoration, { opacity: 0 });
    liveMotion = createLiveMotion(scene);
  };

  const skip = () => {
    const skipHadFocus = document.activeElement === scene.querySelector(".skip-intro");
    timeline?.progress(1);
    setLive();
    if (skipHadFocus) scene.querySelector<HTMLAnchorElement>(".wordmark")?.focus();
  };

  motion.add({ reduced: "(prefers-reduced-motion: reduce)", motion: "(prefers-reduced-motion: no-preference)" }, (context) => {
    const cleanup = () => {
      resizeObserver?.disconnect();
      liveMotion?.revert();
      liveMotion = undefined;
      live = false;
    };
    if (context.conditions?.reduced || hasPlayed) {
      setLive();
      return cleanup;
    }

    const small = scene.clientWidth < 768;
    const finalBox = mark.getBoundingClientRect();
    const sceneBox = scene.getBoundingClientRect();
    const startWidth = small ? 92 : Math.min(180, sceneBox.width * 0.11);
    const initialScale = startWidth / finalBox.width;
    const x = sceneBox.left + sceneBox.width / 2 - (finalBox.left + finalBox.width / 2);
    const y = sceneBox.top + sceneBox.height / 2 - (finalBox.top + finalBox.height / 2);
    const wordmarkWidth = sceneBox.width * (small ? 0.86 : 0.72);
    const brandMarkWidth = wordmarkWidth / 3.48;
    const assemblyRatio = small ? 0.76 / 0.86 : 0.62 / 0.72;
    const anchorX = sceneBox.width / 2 - brandMarkWidth * 0.3;
    const anchorY = sceneBox.height / 2 - (small ? 8 : 14);
    const brandX = sceneBox.left + anchorX - (finalBox.left + finalBox.width / 2);
    const brandY = sceneBox.top + anchorY - (finalBox.top + finalBox.height / 2);
    const brandScale = brandMarkWidth / finalBox.width;

    scene.style.setProperty("--intro-mark-width", `${brandMarkWidth}px`);
    scene.style.setProperty("--intro-anchor-x", `${anchorX}px`);
    scene.style.setProperty("--intro-anchor-y", `${anchorY}px`);
    scene.dataset.introState = "playing";
    scene.dataset.introPhase = "init";
    gsap.set(mark, { x, y, scale: initialScale, opacity: 1, transformOrigin: "50% 50%", willChange: "transform" });
    gsap.set(fill, { opacity: 0 });
    gsap.set(outline, { opacity: 0, strokeDasharray: length, strokeDashoffset: length });
    gsap.set([...content, ...interfaceElements], { opacity: 0, y: 8 });
    // Reset the pre-paint CSS translation before setting GSAP's percentage transform.
    gsap.set(headlines, { y: 0, yPercent: 112, willChange: "transform" });
    gsap.set(decoration, { opacity: 0 });
    gsap.set(fragments, { scale: assemblyRatio, transformOrigin: "0 0" });
    gsap.set(letterN, { xPercent: -112 });
    gsap.set(letterL, { yPercent: 112 });
    gsap.set(letterT, { xPercent: 105, yPercent: -42 });

    timeline = gsap.timeline({ id: "nalt-intro", onComplete: setLive });
    for (const [label, time] of Object.entries(NALT_INTRO_TIMINGS)) {
      timeline.addLabel(label, time);
      timeline.call(() => { scene.dataset.introPhase = label; }, [], label);
    }

    timeline
      .to(select(".coordinate-system"), { opacity: 1, duration: 0.26, ease: "power1.out" }, "locate")
      .set(outline, { opacity: 1 }, "draw")
      .to(outline, { strokeDashoffset: 0, duration: 0.48, ease: "power2.inOut" }, "draw")
      .to(fill, { opacity: 1, duration: 0.14 }, "draw+=0.45")
      .to(outline, { opacity: 0, duration: 0.12 }, "draw+=0.57")
      .to(mark, { y: y - (small ? 8 : 12), duration: 0.2, ease: "power2.out" }, "draw+=0.57")
      .set(select(".identity-fragments"), { opacity: 1 }, "identify")
      .to(mark, { x: brandX, y: brandY, scale: brandScale * assemblyRatio, duration: 0.43, ease: "power3.inOut" }, "identify")
      .to(letterN, { xPercent: 0, duration: 0.44, ease: "power3.out" }, "identify")
      .to(letterL, { yPercent: 0, duration: 0.44, ease: "power3.out" }, "identify+=0.07")
      .to(letterT, { xPercent: 0, yPercent: 0, duration: 0.44, ease: "power3.out" }, "identify+=0.14")
      .to(fragments, { scale: 1, duration: 0.28, ease: "power3.inOut" }, "massive")
      .to(mark, { scale: brandScale, duration: 0.28, ease: "power3.inOut" }, "massive")
      .to(letterN, { xPercent: -155, duration: 0.38, ease: "power3.in" }, "break")
      .to(letterL, { yPercent: 145, duration: 0.36, ease: "power3.in" }, "break+=0.05")
      .to(letterT, { xPercent: 145, yPercent: -95, duration: 0.4, ease: "power3.in" }, "break+=0.03")
      .fromTo(select(".ghost-one"), { scale: 1, opacity: 0.2 }, { scale: 1.18, opacity: 0, duration: 0.42, ease: "power2.out", immediateRender: false }, "break+=0.03")
      .fromTo(select(".ghost-two"), { scale: 1, opacity: 0.13 }, { scale: 1.33, opacity: 0, duration: 0.4, ease: "power2.out", immediateRender: false }, "break+=0.08")
      .fromTo(select(".scan-line"), { xPercent: -100, opacity: 0 }, { xPercent: 100, opacity: 0.45, duration: 0.15, ease: "none" }, "break+=0.1")
      .to(select(".scan-line"), { opacity: 0, duration: 0.07 }, "break+=0.25")
      .to(select(".guide"), { scale: 1.15, opacity: 0.45, duration: 0.2, ease: "power2.out" }, "break")
      .to(select(".technical-marker"), {
        x: (index: number) => index % 2 ? 28 : -28,
        y: (index: number) => index < 2 ? -20 : 20,
        opacity: 0,
        duration: 0.36,
        ease: "power2.out",
      }, "break")
      .to(mark, { x: 0, y: 0, scale: 1, duration: 1.08, ease: "nalt-expand" }, "expand")
      .to(select(".coordinate-system, .identity-fragments"), { opacity: 0, duration: 0.32 }, "expand")
      .to(headlines, { yPercent: 0, duration: 0.75, stagger: 0.1, ease: "power4.out" }, "typography")
      .to(select(".eyebrow"), { opacity: 1, y: 0, duration: 0.4 }, "typography-=0.05")
      .to(select(".hero-support .content-reveal"), { opacity: 1, y: 0, duration: 0.42, stagger: 0.1 }, "resolve")
      .to(interfaceElements, { opacity: 1, y: 0, duration: 0.48, stagger: 0.12, ease: "power2.out" }, "resolve")
      .call(() => undefined, [], "live");

    if (small) timeline.timeScale(1.2);

    // Resize settles the same SVG into the responsive CSS position; it never swaps the mark.
    resizeObserver = new ResizeObserver(() => {
      if (scene.clientWidth === lastWidth && scene.clientHeight === lastHeight) return;
      lastWidth = scene.clientWidth;
      lastHeight = scene.clientHeight;
      if (timeline && timeline.progress() < 1) skip();
    });
    resizeObserver.observe(scene);
    return cleanup;
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
