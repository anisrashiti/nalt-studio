import type { Project } from "@/content/site";
import { ProjectCredit } from "./ProjectCredit";
import { ProjectIndex } from "./ProjectIndex";

type ProjectTextProps = {
  project: Project;
  projects: Project[];
};

/** A project's text above its own cards, for screens too narrow for the pinned column. */
export function ProjectText({ project, projects }: ProjectTextProps) {
  return (
    <div className="mb-8 px-offset lg:hidden">
      <ProjectIndex projects={projects} activeIndex={project.index} />
      <h3 className="mt-3.5 text-title text-stone">{project.name}</h3>
      <p className="mt-4 max-w-[480px] text-stone">{project.story}</p>
      <div className="mt-6">
        <ProjectCredit tagline={project.tagline} meta={project.meta} />
      </div>
    </div>
  );
}
