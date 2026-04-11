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
} as const;
