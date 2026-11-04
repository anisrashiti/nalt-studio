import { LINKS } from "@/content/site";

export function ViewAllCard() {
  return (
    <a
      href={LINKS.allProjects}
      className="group type-label relative block h-[140px] rounded-card bg-graphite"
    >
      <span className="absolute top-5 left-5 whitespace-pre">{"[ Link ]  View all projects"}</span>
      <span className="absolute top-[62px] right-5 transition-colors md:right-9 group-hover:text-signal group-focus-visible:text-signal">
        [ View all projects ]
      </span>
    </a>
  );
}
