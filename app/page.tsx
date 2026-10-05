import { NaltIntroHero } from "@/components/NaltIntroHero";
import { SelectedWork } from "@/components/SelectedWork";
import { CapabilitiesSystem } from "@/components/CapabilitiesSystem";

export default function Home() {
  return (
    <main id="main">
      <NaltIntroHero />
      <SelectedWork />
      <CapabilitiesSystem />
    </main>
  );
}
