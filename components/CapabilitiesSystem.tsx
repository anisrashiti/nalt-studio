"use client";

import { useLayoutEffect, useRef } from "react";
import { CapabilityStage } from "@/components/CapabilityStage";
import { CapabilityVisual } from "@/components/CapabilityVisual";
import { createCapabilitiesSystem } from "@/lib/animations/capabilitiesSystem";
import { capabilities } from "@/lib/data/capabilities";
import styles from "./CapabilitiesSystem.module.css";

export function CapabilitiesSystem() {
  const section = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (!section.current) return;
    const system = createCapabilitiesSystem(section.current);
    return () => system.destroy();
  }, []);

  return (
    <section
      ref={section}
      id="capabilities"
      className={styles.section}
      aria-labelledby="capabilities-heading"
      data-capabilities-section=""
      data-layout="static"
      data-active-stage="0"
    >
      <header className={styles.sectionHeader}>
        <h2 id="capabilities-heading" className={styles.sectionLabel}>03 / WHAT WE BUILD</h2>
        <span className={styles.sectionRange} aria-hidden="true">CAPABILITIES [ 01—04 ]</span>
      </header>

      <div className={styles.stages} data-capability-stages="">
        <div className={styles.spine} data-capability-spine="" aria-hidden="true" />
        <div className={styles.progress} data-capability-progress="" aria-hidden="true" />

        <div className={styles.stageList}>
          {capabilities.map((capability, index) => (
            <CapabilityStage key={capability.id} capability={capability} index={index} />
          ))}
        </div>

        <div className={styles.sharedRail} data-capability-shared="" aria-hidden="true">
          <div className={styles.stickySystem}>
            <p className={styles.systemLabel}>ONE SYSTEM / FOUR FORMS</p>
            <div className={styles.sharedVisual}>
              <CapabilityVisual state={0} shared className={styles.systemVisual} />
            </div>
            <div className={styles.stateLabels}>
              {capabilities.map((capability, index) => (
                <span key={capability.id} data-system-state-index={index} data-active={index === 0 ? "true" : "false"}>
                  <i />{String(index + 1).padStart(2, "0")}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
