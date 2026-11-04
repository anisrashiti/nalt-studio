import { NAV_LINKS } from "@/content/site";

export function NavLinks() {
  return (
    <ul className="type-label flex gap-[34.5px]">
      {NAV_LINKS.map((link) => (
        <li key={link.href}>
          <a href={link.href} className="link-signal">
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
