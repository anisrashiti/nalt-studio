import type { Project } from "@/content/site";

type ProjectIndexProps = {
  projects: Project[];
  activeIndex: string;
};

export function ProjectIndex({ projects, activeIndex }: ProjectIndexProps) {
  return (
    <ol className="type-label flex gap-3.5 text-stone">
      {projects.map(({ index }) => (
        <li
          key={index}
          aria-current={index === activeIndex ? "true" : undefined}
          className={index === activeIndex ? "text-signal" : undefined}
        >
          {index}
        </li>
      ))}
    </ol>
  );
}
