import { SplitGrid } from "@/components/ui/SplitGrid";
import { LINKS } from "@/content/site";

export function SiteFooter() {
  return (
    <SplitGrid className="mt-16 pb-8 md:mt-[120px] md:pb-14">
      <footer className="flex justify-between border-t border-rule pt-[19px] text-stone md:grid md:grid-cols-[233px_1fr] xl:col-start-2">
        <p>© 2026 NALT Studio</p>
        <a href={LINKS.privacy} className="link-signal w-fit">
          Privacy
        </a>
      </footer>
    </SplitGrid>
  );
}
