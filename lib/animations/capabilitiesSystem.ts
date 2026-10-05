import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { capabilityVisualStates } from "@/lib/data/capabilities";

gsap.registerPlugin(ScrollTrigger);

export function createCapabilitiesSystem(section: HTMLElement) {
  const stages = Array.from(section.querySelectorAll<HTMLElement>("[data-capability-stage]"));
  const nodes = stages.map((stage) => stage.querySelector<HTMLElement>("[data-capability-node]")!);
  const wrapper = section.querySelector<HTMLElement>("[data-capability-stages]")!;
  const progress = section.querySelector<HTMLElement>("[data-capability-progress]")!;
  const shared = section.querySelector<SVGSVGElement>('svg[data-system-shared="true"]')!;
  const stateLabels = Array.from(section.querySelectorAll<HTMLElement>("[data-system-state-index]"));
  const media = gsap.matchMedia();
  let refreshTimer: ReturnType<typeof setTimeout> | undefined;
  let destroyed = false;
  let nodePositions: number[] = [];

  const measure = () => {
    const bounds = wrapper.getBoundingClientRect();
    const first = nodes[0].getBoundingClientRect();
    const last = nodes[nodes.length - 1].getBoundingClientRect();
    const start = first.top + first.height / 2 - bounds.top;
    const end = last.top + last.height / 2 - bounds.top;
    nodePositions = nodes.map((node) => {
      const box = node.getBoundingClientRect();
      return box.top + box.height / 2 - bounds.top;
    });
    wrapper.style.setProperty("--spine-start", `${start}px`);
    wrapper.style.setProperty("--spine-distance", `${end - start}px`);
  };
  measure();
  const nearestStage = (scrollProgress: number) => {
    const position = nodePositions[0] + scrollProgress * (nodePositions[nodePositions.length - 1] - nodePositions[0]);
    return nodePositions.reduce((closest, node, index) => Math.abs(node - position) < Math.abs(nodePositions[closest] - position) ? index : closest, 0);
  };

  media.add({
    reduced: "(prefers-reduced-motion: reduce)",
    animated: "(prefers-reduced-motion: no-preference)",
    desktop: "(min-width: 1100px)",
  }, (context) => {
    const reduced = Boolean(context.conditions?.reduced);
    const desktop = Boolean(context.conditions?.desktop) && !reduced;
    section.dataset.layout = reduced ? "static" : desktop ? "desktop" : "inline";
    let activeIndex = -1;

    const markActive = (index: number) => {
      section.dataset.activeStage = String(index);
      stages.forEach((stage, stageIndex) => { stage.dataset.active = String(index === stageIndex); });
      stateLabels.forEach((label, labelIndex) => { label.dataset.active = String(index === labelIndex); });
    };

    if (reduced) {
      markActive(0);
      // Content, inline geometry and the connected spine stay fully resolved.
      // Intersection observation changes only the current-state marker, never motion.
      const observer = new IntersectionObserver(() => {
        const focus = window.innerHeight * 0.46;
        let closest = 0;
        let distance = Infinity;
        nodes.forEach((node, index) => {
          const bounds = node.getBoundingClientRect();
          const current = Math.abs(bounds.top + bounds.height / 2 - focus);
          if (current < distance) { closest = index; distance = current; }
        });
        markActive(closest);
      }, { threshold: [0, 0.25, 0.5, 0.75, 1] });
      stages.forEach((stage) => observer.observe(stage));
      return () => observer.disconnect();
    }

    // These finite, reversible tweens are created inside the media context.
    // Scroll callbacks only play/reverse them, so all of them revert on teardown.
    const activation = stages.map((stage, index) => {
      const timeline = gsap.timeline({ paused: true, defaults: { ease: "power3.out", duration: 0.42 } });
      timeline
        .fromTo(stage.querySelector("[data-capability-title]"), { opacity: 0.6, y: 0 }, { opacity: 1, y: -8 }, 0)
        .fromTo(stage.querySelector("[data-capability-copy]"), { opacity: 0.78, y: 12 }, { opacity: 1, y: 0 }, 0.04)
        .fromTo(stage.querySelector("[data-capability-tags]"), { opacity: 0.72, y: 8 }, { opacity: 1, y: 0 }, 0.08);
      if (!desktop) {
        const units = stage.querySelectorAll<SVGGElement>("[data-system-unit]");
        units.forEach((unit, unitIndex) => {
          const geometry = capabilityVisualStates[index].units[unitIndex];
          const source = `translate(${geometry.x + (unitIndex - 1) * -8} ${geometry.y + 10}) scale(${geometry.scaleX} ${geometry.scaleY})`;
          const target = `translate(${geometry.x} ${geometry.y}) scale(${geometry.scaleX} ${geometry.scaleY})`;
          timeline.fromTo(unit,
            { attr: { transform: source } },
            { attr: { transform: target }, duration: 0.55 }, 0.04 + unitIndex * 0.04);
        });
      }
      return timeline;
    });

    const applyActive = (index: number, immediate = false) => {
      if (index === activeIndex && !immediate) return;
      activeIndex = index;
      markActive(index);
      activation.forEach((timeline, stageIndex) => {
        if (immediate) timeline.progress(index === stageIndex ? 1 : 0).pause();
        else if (index === stageIndex) timeline.play();
        else timeline.reverse();
      });
    };

    const evolution = gsap.timeline({ paused: true, defaults: { ease: "power2.inOut" } });
    evolution.fromTo(progress, { scaleY: 0 }, { scaleY: 1, duration: 3, ease: "none" }, 0);
    if (desktop) {
      const units = Array.from(shared.querySelectorAll<SVGGElement>("[data-system-unit]"));
      const links = Array.from(shared.querySelectorAll<SVGPathElement>("[data-system-links]"));
      const marker = shared.querySelector<SVGRectElement>("[data-system-marker]")!;
      const detailSelectors = ["plane", "slot", "state", "stack"];
      units.forEach((unit, index) => {
        const first = capabilityVisualStates[0].units[index];
        gsap.set(unit, { attr: { transform: `translate(${first.x} ${first.y}) scale(${first.scaleX} ${first.scaleY})` }, opacity: first.opacity });
      });
      gsap.set(marker, { attr: { transform: `translate(${capabilityVisualStates[0].marker.x} ${capabilityVisualStates[0].marker.y})` } });

      capabilityVisualStates.slice(1).forEach((state, stateOffset) => {
        const index = stateOffset + 1;
        const position = index - 0.85;
        units.forEach((unit, unitIndex) => {
          const geometry = state.units[unitIndex];
          evolution.to(unit, { attr: { transform: `translate(${geometry.x} ${geometry.y}) scale(${geometry.scaleX} ${geometry.scaleY})` }, opacity: geometry.opacity, duration: 0.7 }, position);
          evolution.to(unit.querySelector("[data-system-frame]"), { attr: { rx: geometry.radius, ry: Math.min(56, geometry.radius) }, duration: 0.7 }, position);
        });
        links.forEach((link, linkIndex) => {
          evolution.to(link, { attr: { d: state.links[linkIndex] }, opacity: state.linkOpacity, duration: 0.7 }, position);
        });
        detailSelectors.forEach((detail, detailIndex) => {
          evolution.to(shared.querySelectorAll(`[data-system-${detail}-detail]`), { opacity: detailIndex === index ? 0.7 : 0, duration: 0.45 }, position + 0.08);
        });
        evolution.to(shared.querySelector("[data-system-platform-detail]"), { opacity: index === 3 ? 0.7 : 0, duration: 0.5 }, position + 0.12);
        if (index === 1) {
          // One continuing signal moves into the transaction path, then advances.
          evolution.to(marker, { attr: { transform: "translate(196 220)" }, duration: 0.25 }, position)
            .to(marker, { attr: { transform: `translate(${state.marker.x} ${state.marker.y})` }, duration: 0.45, ease: "none" }, position + 0.25);
        } else evolution.to(marker, { attr: { transform: `translate(${state.marker.x} ${state.marker.y})` }, duration: 0.7 }, position);
      });
    }

    applyActive(0, true);
    const trigger = ScrollTrigger.create({
      id: "nalt-capabilities",
      trigger: nodes[0],
      endTrigger: nodes[nodes.length - 1],
      start: "center 46%",
      end: "center 46%",
      animation: evolution,
      scrub: 0.3,
      invalidateOnRefresh: true,
      onUpdate(self) { applyActive(nearestStage(self.progress)); },
      onRefresh(self) { measure(); applyActive(nearestStage(self.progress), true); },
    });
    // Correct initial deep links and restored native scroll positions.
    applyActive(nearestStage(trigger.progress), true);
    return () => {
      section.dataset.layout = "static";
      markActive(0);
    };
  });

  // Work's touch disclosures change the preceding section's height. Re-measure
  // only when layout changes, rather than polling or running an idle RAF loop.
  const observer = new ResizeObserver(() => {
    measure();
    if (refreshTimer) clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => { if (!destroyed) ScrollTrigger.refresh(); }, 80);
  });
  observer.observe(wrapper);
  const work = document.querySelector<HTMLElement>("[data-work-section]");
  if (work) observer.observe(work);
  document.fonts.ready.then(() => { if (!destroyed) { measure(); ScrollTrigger.refresh(); } });

  return {
    destroy() {
      destroyed = true;
      observer.disconnect();
      if (refreshTimer) clearTimeout(refreshTimer);
      media.revert();
      wrapper.style.removeProperty("--spine-start");
      wrapper.style.removeProperty("--spine-distance");
      section.dataset.layout = "static";
    },
  };
}
