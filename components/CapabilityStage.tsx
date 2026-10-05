import { CapabilityVisual } from "@/components/CapabilityVisual";
import type { Capability } from "@/lib/data/capabilities";
import styles from "./CapabilitiesSystem.module.css";

type CapabilityStageProps = {
  capability: Capability;
  index: number;
};

function Title({ title, index }: { title: string; index: number }) {
  if (index < 2) return <>{title}</>;
  const [first, ...rest] = title.split(" ");
  return <><span>{first} </span><span>{rest.join(" ")}</span></>;
}

export function CapabilityStage({ capability, index }: CapabilityStageProps) {
  const titleId = `capability-title-${capability.id}`;

  return (
    <article
      className={`${styles.stage} ${styles[`stage${index + 1}`]}`}
      aria-labelledby={titleId}
      data-capability-stage=""
      data-stage-index={index}
      data-active={index === 0 ? "true" : "false"}
    >
      <div className={styles.stageComposition}>
        <div className={styles.registration}>
          <span className={styles.node} data-capability-node="" aria-hidden="true" />
          <span className={styles.stageIndex} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
        </div>

        <div className={styles.stageBody} data-capability-body="">
          <h3 id={titleId} className={styles.stageTitle} data-capability-title=""><Title title={capability.title} index={index} /></h3>
          <p className={styles.stageCopy} data-capability-copy="">{capability.description}</p>
          <ul className={styles.tags} data-capability-tags="" aria-label={`${capability.title} capabilities`}>
            {capability.tags.map((tag) => <li key={tag}>{tag}</li>)}
          </ul>
        </div>

        <div className={styles.staticVisual} data-capability-static="" data-stage-visual="" aria-hidden="true">
          <CapabilityVisual state={index} className={styles.systemVisual} />
        </div>
      </div>
    </article>
  );
}
