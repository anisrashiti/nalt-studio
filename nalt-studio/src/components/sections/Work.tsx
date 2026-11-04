"use client";

import { useMotionValueEvent, useScroll } from "framer-motion";
import { useRef, useState } from "react";
import { MaskSwap } from "@/components/ui/MaskSwap";
import { ProjectCards } from "@/components/work/ProjectCards";
import { ProjectCredit } from "@/components/work/ProjectCredit";
import { ProjectIndex } from "@/components/work/ProjectIndex";
import { ProjectText } from "@/components/work/ProjectText";
import { ViewAllCard } from "@/components/work/ViewAllCard";
import { PROJECTS } from "@/content/site";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export function Work() {
  const groups = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const isPinned = useMediaQuery("(width >= 64rem)");
  const { scrollY } = useScroll();

  // The active project is the last one whose first card has reached the middle of the screen.
  useMotionValueEvent(scrollY, "change", () => {
    if (!isPinned) return;

    const middle = window.innerHeight / 2;
    let next = 0;
    groups.current.forEach((group, i) => {
      if (group && group.getBoundingClientRect().top <= middle) {
        next = i;
      }
    });
    setActiveIndex(next);
  });

  const active = PROJECTS[activeIndex];

  return (
    <section
      id="work"
      className="mt-24 scroll-mt-nav px-inset md:mt-32 lg:mt-[170px] lg:grid lg:grid-cols-[clamp(360px,31.528vw,454px)_minmax(0,1fr)] lg:pl-gutter"
    >
      <div className="sticky top-nav hidden h-[calc(100svh-254px)] min-h-[360px] flex-col justify-between self-start lg:flex">
        <div>
          <ProjectIndex projects={PROJECTS} activeIndex={active.index} />
          <h2 className="mt-3.5 text-title">Our work</h2>
          <MaskSwap swapKey={active.index} className="pb-0.5 text-title whitespace-nowrap text-stone">
            <p>{active.name}</p>
          </MaskSwap>
          <MaskSwap swapKey={active.index} className="mt-[58px] max-w-[300px] text-stone">
            <p>{active.story}</p>
          </MaskSwap>
        </div>
        <MaskSwap swapKey={active.index}>
          <ProjectCredit tagline={active.tagline} meta={active.meta} />
        </MaskSwap>
      </div>

      <div className="flex flex-col gap-project lg:pt-[30px]">
        <h2 className="-mb-10 px-offset text-title lg:hidden">Our work</h2>
        {PROJECTS.map((project, i) => (
          <div key={project.index}>
            <ProjectText project={project} projects={PROJECTS} />
            <ProjectCards
              project={project}
              ref={(element) => {
                groups.current[i] = element;
              }}
            >
              {i === PROJECTS.length - 1 && <ViewAllCard />}
            </ProjectCards>
          </div>
        ))}
      </div>
    </section>
  );
}
