"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { MouseEvent, PointerEvent } from "react";
import { ProjectRow } from "@/components/ProjectRow";
import { createSelectedWork } from "@/lib/animations/selectedWork";
import { projects } from "@/lib/data/projects";
import styles from "./SelectedWork.module.css";

function hasFinePointer() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

export function SelectedWork() {
  const section = useRef<HTMLElement>(null);
  const animation = useRef<ReturnType<typeof createSelectedWork> | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [focusIndex, setFocusIndex] = useState<number | null>(null);
  const [tapIndex, setTapIndex] = useState<number | null>(null);
  const activeIndex = focusIndex ?? hoverIndex ?? tapIndex;

  useLayoutEffect(() => {
    if (!section.current) return;
    animation.current = createSelectedWork(section.current);
    return () => {
      animation.current?.destroy();
      animation.current = null;
    };
  }, []);

  useLayoutEffect(() => {
    animation.current?.setActive(activeIndex);
  }, [activeIndex]);

  const enterRow = (index: number, event: PointerEvent<HTMLElement>) => {
    if (event.pointerType !== "mouse" || !hasFinePointer()) return;
    setFocusIndex(null);
    setHoverIndex(index);
  };

  const activateRow = (index: number, event: MouseEvent<HTMLElement>) => {
    const project = projects[index];
    if (project.href) {
      // A touch first tap reveals the preview; the second follows the real link.
      // Keyboard and desktop link activation retain native browser behavior.
      const pointerType = (event.nativeEvent as globalThis.PointerEvent).pointerType;
      const touchActivation = event.detail > 0 && (!hasFinePointer() || pointerType === "touch" || pointerType === "pen");
      if (touchActivation && tapIndex !== index) {
        event.preventDefault();
        setTapIndex(index);
      }
      return;
    }
    setFocusIndex(null);
    setTapIndex(activeIndex === index ? null : index);
  };

  return (
    <section ref={section} id="work" className={styles.section} aria-labelledby="work-heading" data-work-section="" onKeyDown={(event) => {
      if (event.key !== "Escape") return;
      setHoverIndex(null);
      setFocusIndex(null);
      setTapIndex(null);
    }}>
      <header className={styles.sectionHeader}>
        <div className={styles.labelMask}><h2 id="work-heading" className={styles.sectionLabel} data-work-label="">SELECTED WORK</h2></div>
        <span className={styles.projectCount} data-work-count="" aria-label={`${projects.length} projects`}>{String(projects.length).padStart(2, "0")}</span>
      </header>
      <div className={styles.topRule} data-work-rule="" aria-hidden="true" />
      <div className={styles.rows}>
        {projects.map((project, index) => <ProjectRow
          key={project.id}
          project={project}
          index={index}
          active={activeIndex === index}
          onPointerEnter={(event) => enterRow(index, event)}
          onPointerLeave={() => {
            setHoverIndex((current) => current === index ? null : current);
            animation.current?.resetPointer(index);
          }}
          onPointerMove={(event) => {
            if (event.pointerType === "mouse" && activeIndex === index) animation.current?.movePointer(index, event.clientX, event.clientY);
          }}
          onFocus={(event) => {
            if (event.currentTarget.matches(":focus-visible")) setFocusIndex(index);
          }}
          onBlur={() => setFocusIndex((current) => current === index ? null : current)}
          onClick={(event) => activateRow(index, event)}
        />)}
      </div>
      <p className={styles.contentStatus}>PROJECT CONTENT / ASSETS PENDING</p>
    </section>
  );
}
