import { erc8004Config } from "@/config/erc8004";
import { Erc8004Agent } from "@/types/erc8004";
import axios from "axios";

export async function getAccountAgents(
  address: string,
): Promise<Erc8004Agent[]> {
  const response = await axios.get<{ data: Erc8004Agent[] }>(
    `${erc8004Config.explorerApiBaseUrl}/accounts/${address}/agents`,
    {
      headers: {
        "X-API-Key": process.env._8004SCAN_API_KEY,
      },
    },
  );

  return response.data.data;
}

export function buildErc8004MetadataUri(args: {
  name: string;
  description: string;
  image: string;
  endpoint: string;
}): string {
  const metadata = {
    type: "https://eips.ethereum.org/EIPS/eip-8004#registration-v1",
    name: args.name,
    description: args.description,
    image: args.image,
    services: [
      {
        name: "web",
        endpoint: args.endpoint,
      },
    ],
    x402Support: false,
    active: true,
    registrations: [],
    supportedTrust: ["reputation"],
  } as const;

  return `data:application/json;base64,${Buffer.from(JSON.stringify(metadata)).toString("base64")}`;
}
