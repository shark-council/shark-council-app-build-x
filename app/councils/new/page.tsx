import { CouncilNewForm } from "@/components/councils/council-new-form";
import { CouncilNewHero } from "@/components/councils/council-new-hero";

export default function CouncilNewPage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <CouncilNewHero />
      <CouncilNewForm className="mt-4" />
    </div>
  );
}
