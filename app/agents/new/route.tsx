import { AgentNewForm } from "@/components/agents/agent-new-form";
import { AgentNewHero } from "@/components/agents/agent-new-hero";

export default function AgentNewPage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <AgentNewHero />
      <AgentNewForm className="mt-4" />
    </div>
  );
}
