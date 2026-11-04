import { SectionHeading } from "@/components/ui/SectionHeading";
import { SplitGrid } from "@/components/ui/SplitGrid";
import { TableRow } from "@/components/ui/TableRow";
import { SERVICES } from "@/content/site";

export function Services() {
  return (
    <section id="services" className="mt-24 scroll-mt-nav md:mt-32 xl:mt-[220px]">
      <SplitGrid>
        <SectionHeading title="What we do" subtitle="Four services" />
        <div>
          {SERVICES.map((service) => (
            <TableRow
              key={service.label}
              label={service.label}
              line={service.line}
              detail={service.included}
              href="#contact"
            />
          ))}
        </div>
      </SplitGrid>
    </section>
  );
}
