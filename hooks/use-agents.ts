import { ApiResponse } from "@/types/api";
import { Erc8004Agent } from "@/types/erc8004";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

async function getAgents({
  signal,
}: {
  signal: AbortSignal;
}): Promise<Erc8004Agent[]> {
  console.log("[Hook] Getting agents...");

  const { data } = await axios.get<ApiResponse<{ agents: Erc8004Agent[] }>>(
    "/api/agents",
    { signal },
  );

  if (!data.isSuccess || !data.data?.agents) {
    throw new Error(data.error?.message ?? "Failed to get agents");
  }

  return data.data.agents;
}

export function useAgents() {
  return useQuery({
    queryKey: ["agents"],
    queryFn: ({ signal }) => getAgents({ signal }),
    retry: 2,
    refetchOnWindowFocus: false,
    refetchInterval: 30000,
  });
}
