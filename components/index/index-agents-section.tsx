import { cn } from "@/lib/utils";
import { ClassValue } from "clsx";
import { AgentList } from "../agents/agent-list";

export function IndexAgentsSection(props: { className?: ClassValue }) {
  return (
    <section className={cn(props.className)}>
      <div className="flex flex-col gap-2">
        <p className="font-bold text-center">Sharks</p>
        <p className="text-muted-foreground text-center">
          Specialized AI agents ready to debate
        </p>
        <AgentList className="mt-4" />
      </div>
    </section>
  );
}
