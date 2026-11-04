// All placeholder copy and links for the homepage. Replace these with real content.

export type MediaKind = "video" | "image";

export type ProjectCard = {
  kind: MediaKind;
  label: string;
  description: string;
  shape: "hero" | "detail";
  /** Real media path. Leave unset to show the placeholder. */
  src?: string;
};

export type Project = {
  index: string;
  name: string;
  story: string;
  tagline: string;
  meta: string;
  cards: ProjectCard[];
};

export type Service = {
  label: string;
  line: string;
  included: string;
};

export type Post = {
  headline: string;
  tag: string;
  date: string;
  description?: string;
  href: string;
};

export const EMAIL = "hello@nalt.studio";

/** The showreel video path. Leave unset to show the placeholder. */
export const SHOWREEL_SRC: string | undefined = undefined;

export const LINKS = {
  allProjects: "#",
  privacy: "#",
  workWithUs: `mailto:${EMAIL}?subject=Work%20with%20us`,
  instagram: "#",
  linkedin: "#",
  behance: "#",
  github: "#",
};

export const NAV_LINKS = [
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Latest", href: "#latest" },
  { label: "Contact", href: "#contact" },
];

// What the nav pill shows for each section. The intro counts as Home, as in frame B.
export const SECTION_LABELS: Record<string, string> = {
  home: "Home",
  about: "Home",
  work: "Work",
  services: "Services",
  latest: "Latest",
  contact: "Contact",
};

const STORY =
  "A real paragraph about the project: who the client is, what was broken, what you built, and what changed. Four to six sentences, written plainly.";

const HERO_CARD: ProjectCard = {
  kind: "video",
  label: "Hero clip",
  description: "The strongest moment: key screen or product in use.",
  shape: "hero",
};

const DETAIL_CARD: ProjectCard = {
  kind: "image",
  label: "Detail",
  description: "A close-up: interaction, type, a component.",
  shape: "detail",
};

const CONTEXT_CARD: ProjectCard = {
  kind: "image",
  label: "Context",
  description: "The work in the real world: device, place, people.",
  shape: "detail",
};

export const PROJECTS: Project[] = [
  {
    index: "01",
    name: "Project name 01",
    story: STORY,
    tagline: "One-line tagline about the outcome",
    meta: "2026, Sector",
    cards: [HERO_CARD, DETAIL_CARD, CONTEXT_CARD],
  },
  {
    index: "02",
    name: "Project name 02",
    story: STORY,
    tagline: "One-line tagline about the outcome",
    meta: "2026, Sector",
    cards: [HERO_CARD, DETAIL_CARD],
  },
  {
    index: "03",
    name: "Project name 03",
    story: STORY,
    tagline: "One-line tagline about the outcome",
    meta: "2026, Sector",
    cards: [HERO_CARD, DETAIL_CARD],
  },
];

export const SERVICES: Service[] = [
  {
    label: "Websites",
    line: "Sites where brand, content and code work as one system.",
    included: "Strategy, UX, design, development, CMS",
  },
  {
    label: "E-commerce",
    line: "Stores that connect product, checkout and operations.",
    included: "Storefront, checkout, integrations",
  },
  {
    label: "Digital products",
    line: "Apps and tools built around how people actually work.",
    included: "Research, UX, design systems, frontend",
  },
  {
    label: "Custom platforms",
    line: "Systems for integrations, automation and scale.",
    included: "Architecture, backend, automation",
  },
];

// The Latest section stays hidden until there are at least this many real posts.
export const MIN_POSTS = 3;

export const POSTS: Post[] = [
  {
    headline: "A plain headline about the post",
    tag: "Project",
    date: "Sun 25 Oct",
    description: "A photo from the studio or the project.",
    href: "#",
  },
  {
    headline: "A plain headline about the post",
    tag: "Studio",
    date: "Sun 25 Oct",
    href: "#",
  },
  {
    headline: "A plain headline about the post",
    tag: "Talk",
    date: "Sun 25 Oct",
    href: "#",
  },
];
