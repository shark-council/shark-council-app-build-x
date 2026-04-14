export const erc8004Config = {
  chainId: "196",
  identityRegistryAddress: "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432",
  identityRegistryRegisterAbi: [
    {
      inputs: [
        {
          internalType: "string",
          name: "agentURI",
          type: "string",
        },
      ],
      name: "register",
      outputs: [
        {
          internalType: "uint256",
          name: "agentId",
          type: "uint256",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
  ],
  explorerBaseUrl: "https://8004scan.io/agents/xlayer",
  explorerApiBaseUrl: "https://8004scan.io/api/v1/public",
  minCreatedAt: new Date("2026-04-14T00:00:00+03:00"),
} as const;
