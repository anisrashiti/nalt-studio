import type { ReactNode, Ref } from "react";
import { MediaPlaceholder } from "@/components/ui/MediaPlaceholder";
import type { Project } from "@/content/site";

const SHAPES = {
  hero: "aspect-[4/3] md:aspect-[942/520]",
  detail: "aspect-[4/3] md:aspect-[942/400]",
};

type ProjectCardsProps = {
  project: Project;
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
};

export function ProjectCards({ project, ref, children }: ProjectCardsProps) {
  return (
    <div ref={ref} className="flex flex-col gap-stack">
      {project.cards.map((card) => (
        <MediaPlaceholder
          key={card.label}
          kind={card.kind}
          label={card.label}
          description={card.description}
          src={card.src}
          className={SHAPES[card.shape]}
        />
      ))}
      {children}
    </div>
  );
}
