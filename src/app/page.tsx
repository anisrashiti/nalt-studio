import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Contact } from "@/components/sections/Contact";
import { Hero } from "@/components/sections/Hero";
import { Intro } from "@/components/sections/Intro";
import { Latest } from "@/components/sections/Latest";
import { Services } from "@/components/sections/Services";
import { Work } from "@/components/sections/Work";
import { ChevronCursor } from "@/components/ui/ChevronCursor";

export default function Home() {
  return (
    <>
      <ScrollProgress />
      <ChevronCursor />
      <SiteHeader />
      <main>
        <Hero />
        <Intro />
        <Work />
        <Services />
        <Latest />
        <Contact />
      </main>
      <SiteFooter />
    </>
  );
}
