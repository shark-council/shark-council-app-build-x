const erc8004Registration = {
  type: "https://eips.ethereum.org/EIPS/eip-8004#registration-v1",
  name: "Technical Expert",
  description:
    "A brutally honest charting expert who believes hype kills portfolios. This agent ignores the noise and ruthlessly stress-tests your trade using price action, RSI, MACD, and volume profiles to expose hidden downsides.",
  image:
    "https://shark-council-app-pacifica.vercel.app/images/avatars/hammerhead-shark.png",
  services: [
    {
      name: "web",
      endpoint:
        "https://shark-council-app-pacifica.vercel.app/api/agents/technical-expert",
    },
  ],
  x402Support: false,
  active: true,
  registrations: [],
  supportedTrust: ["reputation"],
} as const;

const erc8004RegistrationJson = JSON.stringify(erc8004Registration);

export const erc8004Config = {
  chainId: "196",
  metadataUri: `data:application/json;base64,${Buffer.from(erc8004RegistrationJson).toString("base64")}`,
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
