import Image from "next/image";
import type { FocusEvent, MouseEvent, PointerEvent } from "react";
import type { Project } from "@/lib/data/projects";
import styles from "./SelectedWork.module.css";

type ProjectRowProps = {
  project: Project;
  index: number;
  active: boolean;
  onPointerEnter: (event: PointerEvent<HTMLElement>) => void;
  onPointerLeave: (event: PointerEvent<HTMLElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLElement>) => void;
  onFocus: (event: FocusEvent<HTMLElement>) => void;
  onBlur: (event: FocusEvent<HTMLElement>) => void;
  onClick: (event: MouseEvent<HTMLElement>) => void;
};

function PendingPreview({ index }: { index: number }) {
  return (
    <div className={`${styles.pendingSurface} ${styles[`surface${index + 1}`]}`}>
      <svg className={styles.pendingGeometry} viewBox="0 0 600 360" fill="none" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
        {index === 0 && <><path d="M158-20V380M444-20V380M-20 88H620M-20 274H620" /><rect x="158" y="88" width="286" height="186" /><path d="m158 274 286-186" /></>}
        {index === 1 && <><path d="M-20 315H142V236H248V157H354V78H460V-20" /><path d="M95 380V284H202V205H308V126H414V47H520V-20" /><path d="M-20 126H620" /></>}
        {index === 2 && <><path d="m120-40 210 440M236-40l210 440M352-40l210 440M-20 72H620M-20 286H620" /><path d="M70 72h424v214H70z" /></>}
        {index === 3 && <><path d="M104-20V380M234-20V380M364-20V380M494-20V380M-20 64H620M-20 194H620M-20 324H620" /><path d="m104 64 390 260M104 324 390-260" /></>}
      </svg>
      <span className={styles.pendingLabel}>PREVIEW PENDING</span>
      <span className={styles.pendingNumber} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
    </div>
  );
}

export function ProjectRow({ project, index, active, ...events }: ProjectRowProps) {
  const titleId = `work-title-${project.id}`;
  const metadataId = `work-metadata-${project.id}`;
  const previewId = `work-preview-${project.id}`;
  const statusId = `work-status-${project.id}`;
  const actionProps = {
    className: styles.rowAction,
    "data-work-action": "",
    "aria-labelledby": titleId,
    "aria-describedby": `${metadataId} ${statusId}`,
    ...events,
  };
  const content = <>
    <span className={styles.projectIndex} aria-hidden="true"><i className={styles.activeMarker} data-work-marker="" />{String(index + 1).padStart(2, "0")}</span>
    <span id={titleId} className={styles.projectTitle} data-work-title="">{project.title}</span>
    <span id={metadataId} className={styles.projectMetadata} data-work-metadata="">
      <span>{project.category ?? "CONTENT PENDING"}</span>
      <span>{project.year ?? "YEAR TBD"}</span>
      {project.secondaryMetadata && <span>{project.secondaryMetadata}</span>}
    </span>
    <span className={styles.actionSymbol} data-work-symbol="" aria-hidden="true">{project.href ? "↗" : "+"}</span>
  </>;

  return (
    <article className={styles.row} data-work-row="" data-active={active ? "true" : "false"}>
      <h3 className={styles.rowHeading}>
        {project.href
          ? <a {...actionProps} href={project.href}>{content}</a>
          : <button {...actionProps} type="button" aria-expanded={active} aria-controls={previewId}>{content}</button>}
      </h3>
      <div id={previewId} className={styles.preview} data-work-preview="" aria-hidden={!active}>
        <div className={styles.previewParallax} data-work-parallax="">
          <div className={styles.previewImage} data-work-image="">
            {project.image
              ? <Image src={project.image.src} alt={project.image.alt} fill sizes="(max-width: 900px) calc(100vw - 48px), 30vw" className={styles.actualImage} />
              : <PendingPreview index={index} />}
          </div>
        </div>
      </div>
      <span id={statusId} className={styles.srOnly}>{project.image ? "Project preview." : "Project content and preview are pending. Activate to reveal a temporary visual placeholder."}</span>
      <div className={styles.rowRule} data-work-rule="" aria-hidden="true" />
    </article>
  );
}
