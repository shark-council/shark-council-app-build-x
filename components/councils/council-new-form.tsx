"use client";

import { AgentCard } from "@/components/agents/agent-card";
import EntityList from "@/components/ui-extra/entity-list";
import EntityListDefaultNoEntitiesCard from "@/components/ui-extra/entity-list-default-no-entities-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAgents } from "@/hooks/use-agents";
import { cn } from "@/lib/utils";
import { Erc8004Agent } from "@/types/erc8004";
import { ClassValue } from "clsx";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function CouncilNewForm({ className }: { className?: ClassValue }) {
  const router = useRouter();
  const { data: agents, isLoading: isAgentsLoading } = useAgents();
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([]);

  const onToggleAgent = (agentId: string) => {
    setSelectedAgentIds((current) =>
      current.includes(agentId)
        ? current.filter((id) => id !== agentId)
        : [...current, agentId],
    );
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push("/councils/chat");
  };

  return (
    <form className={cn("flex flex-col gap-4", className)} onSubmit={onSubmit}>
      {isAgentsLoading || !agents ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      ) : (
        <EntityList<Erc8004Agent>
          entities={agents}
          renderEntityCard={(agent) => {
            const isSelected = selectedAgentIds.includes(agent.agent_id);

            return (
              <div
                key={agent.agent_id}
                role="button"
                tabIndex={0}
                onClick={() => onToggleAgent(agent.agent_id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onToggleAgent(agent.agent_id);
                  }
                }}
                className={cn(
                  "rounded-2xl cursor-pointer transition-colors",
                  isSelected ? "ring-2 ring-primary" : "hover:bg-muted/20",
                )}
              >
                <AgentCard agent={agent} />
              </div>
            );
          }}
          noEntitiesCard={
            <EntityListDefaultNoEntitiesCard noEntitiesText="No agents found" />
          }
        />
      )}

      <p className="text-sm text-muted-foreground">
        {selectedAgentIds.length} agent
        {selectedAgentIds.length === 1 ? "" : "s"} selected
      </p>

      <Button type="submit">Consult the Council</Button>
    </form>
  );
}
