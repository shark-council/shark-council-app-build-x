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
