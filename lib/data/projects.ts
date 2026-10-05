export type ProjectImage = {
  src: string;
  alt: string;
};

export type Project = {
  id: string;
  title: string;
  category: string | null;
  year: number | null;
  image: ProjectImage | null;
  href?: string;
  secondaryMetadata?: string;
};

// Replace these neutral entries when approved project content is available.
// A real href changes the disclosure into a semantic project link.
export const projects: readonly Project[] = [
  { id: "project-01", title: "Project 01", category: null, year: null, image: null },
  { id: "project-02", title: "Project 02", category: null, year: null, image: null },
  { id: "project-03", title: "Project 03", category: null, year: null, image: null },
  { id: "project-04", title: "Project 04", category: null, year: null, image: null },
];
