"use client";

import EntityList from "@/components/ui-extra/entity-list";
import EntityListDefaultNoEntitiesCard from "@/components/ui-extra/entity-list-default-no-entities-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAgents } from "@/hooks/use-agents";
import { cn } from "@/lib/utils";
import { Erc8004Agent } from "@/types/erc8004";
import { ClassValue } from "clsx";
import { AgentCard } from "./agent-card";

export function AgentList(props: { className?: ClassValue }) {
  const { data: agents, isLoading: isAgentsLoading } = useAgents();

  if (isAgentsLoading || !agents) {
    return (
      <div className={cn("flex flex-col gap-4", props.className)}>
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
      </div>
    );
  }

  return (
    <EntityList<Erc8004Agent>
      entities={agents}
      renderEntityCard={(agent, index) => (
        <AgentCard key={index} agent={agent} />
      )}
      noEntitiesCard={
        <EntityListDefaultNoEntitiesCard noEntitiesText="No agents found" />
      }
      className={props.className}
    />
  );
}
