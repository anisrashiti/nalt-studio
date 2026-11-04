import { CopyEmail } from "@/components/ui/CopyEmail";
import { MediaPlaceholder } from "@/components/ui/MediaPlaceholder";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SplitGrid } from "@/components/ui/SplitGrid";
import { TableRow } from "@/components/ui/TableRow";
import { EMAIL, LINKS } from "@/content/site";

export function Contact() {
  return (
    <section id="contact" className="mt-24 scroll-mt-nav md:mt-32 xl:mt-[226px]">
      <SplitGrid>
        {/* Below 1280px these two split up, so the photo card ends up after the table. */}
        <div className="contents xl:flex xl:flex-col xl:justify-between">
          <SectionHeading title="Say hello" subtitle="Projects, press and careers" />
          <MediaPlaceholder
            kind="image"
            label="Studio photo"
            description="The real studio and people."
            className="order-last -ml-offset h-[218px] w-[366px] max-w-[calc(100vw-2*var(--spacing-inset))] xl:order-none"
          >
            <p className="type-label absolute bottom-1.5 left-3">
              Say hello
              <br />
              {EMAIL}
            </p>
          </MediaPlaceholder>
        </div>

        <div>
          <TableRow label="New projects" line="Tell us what you’re building." detail={<CopyEmail />} />
          <TableRow
            label="Careers"
            line="One small team in Prishtina."
            detail={
              <a href={LINKS.workWithUs} className="link-signal">
                Work with us
              </a>
            }
          />
          <TableRow
            label="Channels"
            line={
              <a href={LINKS.instagram} className="link-signal">
                Instagram
              </a>
            }
            detail={
              <>
                <a href={LINKS.linkedin} className="link-signal">
                  LinkedIn
                </a>
                {" · "}
                <a href={LINKS.behance} className="link-signal">
                  Behance
                </a>
                {" · "}
                <a href={LINKS.github} className="link-signal">
                  GitHub
                </a>
              </>
            }
          />
        </div>
      </SplitGrid>
    </section>
  );
}
