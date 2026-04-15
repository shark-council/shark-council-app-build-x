import { erc8004Config } from "@/config/erc8004";
import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { ChatOpenAI } from "@langchain/openai";
import { BaseMessage, createAgent, type ReactAgent, tool } from "langchain";
import { encodeFunctionData } from "viem";
import { z } from "zod";
import { buildErc8004MetadataUri } from "../erc8004";
import { getErrorString } from "../error";

const model = new ChatOpenAI({
  model: "google/gemini-3-flash-preview",
  apiKey: process.env.OPEN_ROUTER_API_KEY,
  configuration: {
    baseURL: "https://openrouter.ai/api/v1",
  },
  temperature: 0,
});

function buildWalletArgs(
  command: string,
  options: Array<string | undefined | false>,
) {
  return [
    "wallet",
    command,
    ...options.filter((option): option is string => Boolean(option)),
  ];
}

function formatWalletCommandForLog(args: string[]) {
  return `onchainos ${args.join(" ")}`;
}

async function executeWalletCli(args: string[]): Promise<string> {
  try {
    console.log(
      `[Executor] Executing remote wallet command: ${formatWalletCommandForLog(args)}...`,
    );

    const proxyUrl = process.env.ONCHAINOS_PROXY_URL;
    const proxyApiKey = process.env.ONCHAINOS_PROXY_API_KEY;

    if (!proxyUrl) {
      throw new Error("ONCHAINOS_PROXY_URL environment variable is not set.");
    }

    const response = await fetch(`${proxyUrl.replace(/\/$/, "")}/execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(proxyApiKey ? { Authorization: `Bearer ${proxyApiKey}` } : {}),
      },
      body: JSON.stringify({ args }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Remote API error: ${response.status} ${response.statusText} - ${errorText}`,
      );
    }

    const data = (await response.json()) as {
      stdout?: string;
      stderr?: string;
    };
    return data.stdout ?? data.stderr ?? "";
  } catch (error) {
    console.error(
      `[Executor] Failed to execute remote wallet command: ${getErrorString(error)}`,
      error,
    );
    return `Failed to execute wallet command: ${getErrorString(error)}`;
  }
}

function buildWalletContractCallArgs(options: {
  aaDexTokenAddr?: string;
  aaDexTokenAmount?: string;
  amt?: string;
  baseUrl?: string;
  force?: boolean;
  from?: string;
  gasLimit?: string;
  inputData?: string;
  to: string;
}) {
  return buildWalletArgs("contract-call", [
    options.baseUrl && "--base-url",
    options.baseUrl,
    "--to",
    options.to,
    "--chain",
    "196",
    options.amt && "--amt",
    options.amt,
    options.inputData && "--input-data",
    options.inputData,
    options.gasLimit && "--gas-limit",
    options.gasLimit,
    options.from && "--from",
    options.from,
    options.aaDexTokenAddr && "--aa-dex-token-addr",
    options.aaDexTokenAddr,
    options.aaDexTokenAmount && "--aa-dex-token-amount",
    options.aaDexTokenAmount,
    options.force && "--force",
  ]);
}

async function executeWalletContractCall(options: {
  aaDexTokenAddr?: string;
  aaDexTokenAmount?: string;
  amt?: string;
  baseUrl?: string;
  force?: boolean;
  from?: string;
  gasLimit?: string;
  inputData?: string;
  to: string;
}) {
  return executeWalletCli(buildWalletContractCallArgs(options));
}

function tryParseJson(rawOutput: string) {
  const trimmedOutput = rawOutput.trim();
  if (!trimmedOutput) {
    return undefined;
  }

  try {
    return JSON.parse(trimmedOutput) as unknown;
  } catch {
    const firstBraceIndex = trimmedOutput.indexOf("{");
    const lastBraceIndex = trimmedOutput.lastIndexOf("}");

    if (firstBraceIndex === -1 || lastBraceIndex <= firstBraceIndex) {
      return undefined;
    }

    try {
      return JSON.parse(
        trimmedOutput.slice(firstBraceIndex, lastBraceIndex + 1),
      ) as unknown;
    } catch {
      return undefined;
    }
  }
}

function findFirstPropertyValue(
  value: unknown,
  propertyNames: Set<string>,
  depth = 0,
): unknown {
  if (depth > 5 || value == null) {
    return undefined;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const candidate = findFirstPropertyValue(item, propertyNames, depth + 1);
      if (candidate !== undefined) {
        return candidate;
      }
    }

    return undefined;
  }

  if (typeof value !== "object") {
    return undefined;
  }

  for (const [key, nestedValue] of Object.entries(value)) {
    if (propertyNames.has(key)) {
      return nestedValue;
    }

    const candidate = findFirstPropertyValue(
      nestedValue,
      propertyNames,
      depth + 1,
    );
    if (candidate !== undefined) {
      return candidate;
    }
  }

  return undefined;
}

function toOptionalString(value: unknown) {
  if (typeof value === "string") {
    const trimmedValue = value.trim();
    return trimmedValue ? trimmedValue : undefined;
  }

  if (typeof value === "number" || typeof value === "bigint") {
    return String(value);
  }

  return undefined;
}

function toOptionalBoolean(value: unknown) {
  if (typeof value === "boolean") {
    return value;
  }

  return undefined;
}

function parseWalletExecutionOutput(rawOutput: string) {
  const parsedJson = tryParseJson(rawOutput);

  const txHashFromJson = toOptionalString(
    findFirstPropertyValue(parsedJson, new Set(["txHash", "hash"])),
  );
  const agentIdFromJson = toOptionalString(
    findFirstPropertyValue(parsedJson, new Set(["agentId", "tokenId"])),
  );
  const confirming = toOptionalBoolean(
    findFirstPropertyValue(parsedJson, new Set(["confirming"])),
  );
  const message = toOptionalString(
    findFirstPropertyValue(parsedJson, new Set(["message"])),
  );
  const next = toOptionalString(
    findFirstPropertyValue(parsedJson, new Set(["next"])),
  );

  const txHashMatch = rawOutput.match(/0x[a-fA-F0-9]{64}/);
  const agentIdMatch = rawOutput.match(/"agentId"\s*:\s*"?(\d+)"?/i);

  return {
    parsedJson,
    txHash: txHashFromJson ?? txHashMatch?.[0],
    agentId: agentIdFromJson ?? agentIdMatch?.[1],
    confirming,
    message,
    next,
  };
}

const walletStatusTool = tool(
  async ({ baseUrl }) => {
    return executeWalletCli(
      buildWalletArgs("status", [
        baseUrl && "--base-url",
        baseUrl,
        "--chain",
        "196",
      ]),
    );
  },
  {
    name: "wallet_status",
    description:
      "Run 'onchainos wallet status' to show the current Agentic Wallet login state, active account, and policy status.",
    schema: z.object({
      baseUrl: z
        .string()
        .optional()
        .describe("Optional backend service URL passed as --base-url."),
    }),
  },
);

const walletAddressesTool = tool(
  async ({ baseUrl }) => {
    return executeWalletCli(
      buildWalletArgs("addresses", [
        baseUrl && "--base-url",
        baseUrl,
        "--chain",
        "196",
      ]),
    );
  },
  {
    name: "wallet_addresses",
    description:
      "Run 'onchainos wallet addresses' to show wallet addresses for X Layer.",
    schema: z.object({
      baseUrl: z
        .string()
        .optional()
        .describe("Optional backend service URL passed as --base-url."),
    }),
  },
);

const walletBalanceSchema = z.object({
  all: z
    .boolean()
    .optional()
    .describe("Pass --all to query assets across all accounts."),
  baseUrl: z
    .string()
    .optional()
    .describe("Optional backend service URL passed as --base-url."),
  tokenAddress: z
    .string()
    .optional()
    .describe("Optional token contract address passed as --token-address."),
  force: z
    .boolean()
    .optional()
    .describe(
      "Pass --force only when the user explicitly asks to refresh, sync, or update wallet data.",
    ),
});

const walletBalanceTool = tool(
  async ({ all, baseUrl, tokenAddress, force }) => {
    return executeWalletCli(
      buildWalletArgs("balance", [
        all && "--all",
        baseUrl && "--base-url",
        baseUrl,
        "--chain",
        "196",
        tokenAddress && "--token-address",
        tokenAddress,
        force && "--force",
      ]),
    );
  },
  {
    name: "wallet_balance",
    description:
      "Run 'onchainos wallet balance' to query Agentic Wallet balances for X Layer, optionally across all accounts or for a specific token.",
    schema: walletBalanceSchema,
  },
);

const walletChainsTool = tool(
  async ({ baseUrl }) => {
    return executeWalletCli(
      buildWalletArgs("chains", [
        baseUrl && "--base-url",
        baseUrl,
        "--chain",
        "196",
      ]),
    );
  },
  {
    name: "wallet_chains",
    description:
      "Run 'onchainos wallet chains' to list wallet-supported chains.",
    schema: z.object({
      baseUrl: z
        .string()
        .optional()
        .describe("Optional backend service URL passed as --base-url."),
    }),
  },
);

const walletContractCallSchema = z.object({
  baseUrl: z
    .string()
    .optional()
    .describe("Optional backend service URL passed as --base-url."),
  to: z.string().describe("Contract address passed as --to."),
  amt: z
    .string()
    .optional()
    .describe(
      "Optional native token amount in minimal units passed as --amt. Whole number string only.",
    ),
  inputData: z.string().describe("EVM call data passed as --input-data."),
  gasLimit: z
    .string()
    .optional()
    .describe("Optional EVM gas limit override passed as --gas-limit."),
  from: z
    .string()
    .optional()
    .describe("Optional sender address passed as --from."),
  aaDexTokenAddr: z
    .string()
    .optional()
    .describe(
      "Optional AA DEX token contract address passed as --aa-dex-token-addr.",
    ),
  aaDexTokenAmount: z
    .string()
    .optional()
    .describe("Optional AA DEX token amount passed as --aa-dex-token-amount."),
  force: z
    .boolean()
    .optional()
    .describe(
      "Pass --force only to continue an already-confirmed backend confirmation flow.",
    ),
});

const walletContractCallTool = tool(
  async ({
    aaDexTokenAddr,
    aaDexTokenAmount,
    amt,
    baseUrl,
    force,
    from,
    gasLimit,
    inputData,
    to,
  }) => {
    return executeWalletContractCall({
      aaDexTokenAddr,
      aaDexTokenAmount,
      amt,
      baseUrl,
      force,
      from,
      gasLimit,
      inputData,
      to,
    });
  },
  {
    name: "wallet_contract_call",
    description:
      "Run 'onchainos wallet contract-call' to execute a wallet-side smart contract interaction on X Layer using EVM input data. This is for non-swap wallet contract interactions, approvals, and custom calls.",
    schema: walletContractCallSchema,
  },
);

const createErc8004AgentSchema = z.object({
  baseUrl: z
    .string()
    .optional()
    .describe("Optional backend service URL passed as --base-url."),
  name: z
    .string()
    .min(1)
    .describe("The ERC-8004 agent name used in the registration metadata."),
  description: z
    .string()
    .min(1)
    .describe(
      "The ERC-8004 agent description used in the registration metadata.",
    ),
  image: z
    .string()
    .url()
    .describe("The image URL used in the registration metadata."),
  endpoint: z
    .string()
    .url()
    .describe("The web service endpoint used in the registration metadata."),
  from: z
    .string()
    .optional()
    .describe("Optional sender address passed as --from."),
  gasLimit: z
    .string()
    .optional()
    .describe("Optional EVM gas limit override passed as --gas-limit."),
  force: z
    .boolean()
    .optional()
    .describe(
      "Pass --force only to continue an already-confirmed backend confirmation flow.",
    ),
});

const createErc8004AgentTool = tool(
  async ({
    baseUrl,
    description,
    endpoint,
    force,
    from,
    gasLimit,
    image,
    name,
  }) => {
    const metadataUri = buildErc8004MetadataUri({
      name,
      description,
      image,
      endpoint,
    });

    const inputData = encodeFunctionData({
      abi: erc8004Config.identityRegistryRegisterAbi,
      functionName: "register",
      args: [metadataUri],
    });

    const rawOutput = await executeWalletContractCall({
      baseUrl,
      force,
      from,
      gasLimit,
      inputData,
      to: erc8004Config.identityRegistryAddress,
    });

    const parsedOutput = parseWalletExecutionOutput(rawOutput);

    return {
      action: "create_erc8004_agent",
      agentId: parsedOutput.agentId,
      chain: erc8004Config.chainId,
      confirming: parsedOutput.confirming,
      description,
      endpoint,
      image,
      message: parsedOutput.message,
      metadataUri,
      name,
      next: parsedOutput.next,
      rawOutput,
      registryAddress: erc8004Config.identityRegistryAddress,
      txHash: parsedOutput.txHash,
    };
  },
  {
    name: "create_erc8004_agent",
    description:
      "Create an ERC-8004 agent on X Layer by building registration metadata from name, description, image, and endpoint, then calling the fixed Identity Registry through the single-argument register(agentURI) function.",
    schema: createErc8004AgentSchema,
  },
);

const systemPrompt = `
# Role

- You are Executor, an AI Agent with an OKX Onchain OS Agentic Wallet.
- You work only on X Layer. All tools and operations are restricted to the X Layer network.

# Context

- Current date: ${new Date().toISOString()}

# Tools

- Wallet tools are deterministic wrappers around specific Onchain OS Agentic Wallet CLI commands.
- The create_erc8004_agent tool is a dedicated fixed-flow registration tool for ERC-8004 agent creation on X Layer.

# Swap Instructions

- Swaps must use OKX OnchainOS MCP tools only. Do not execute swaps through the Onchain OS CLI.
- For swap intent, follow this order: validate token details, verify the active wallet or recipient address context, get the best quote, handle approval if needed, then build the swap transaction.
- Never guess token addresses, wallet addresses, or amounts. If any required execution detail is missing or ambiguous, ask the user.
- For EVM swaps, use the DEX tool flow: supported liquidity if needed, quote with dex-okx-dex-quote, approval with dex-okx-dex-approve-transaction when the sell token is not native, then construct the trade with dex-okx-dex-swap.
- If approval is needed, approve only the amount required for the trade or a small safety buffer. Never approve unlimited allowance.
- MCP tools are responsible for quote discovery and swap transaction construction. Wallet tools are responsible for deterministic wallet-side actions such as checking wallet state, listing addresses, querying balances, listing supported chains, and wallet contract calls when a wallet command is required.
- If MCP is unavailable, do not fall back to CLI swap execution. Explain that swap execution is temporarily unavailable instead.

# Wallet Tool Instructions

- Use wallet_status to inspect the current Agentic Wallet login state, active account, and policy state.
- Use wallet_addresses to list wallet addresses.
- Use wallet_balance to query balances.
- Use wallet_chains to list supported wallet chains.
- Use create_erc8004_agent when the user wants to create or register an ERC-8004 agent on X Layer through the Agentic Wallet.
- create_erc8004_agent always targets the fixed Identity Registry and builds the agentURI from the required metadata fields name, description, image, and endpoint before calling register(agentURI).
- If any of name, description, image, or endpoint are missing for create_erc8004_agent, ask the user instead of guessing.
- Use wallet_contract_call only for wallet-side contract interactions. It is not a swap routing tool.
- Do not use wallet_contract_call for the fixed ERC-8004 creation flow unless the user explicitly asks for a manual or generic contract call.
- Only use force when continuing an explicit confirmation flow.
`;

let cachedAgent: ReactAgent | null = null;

async function getAgent() {
  if (cachedAgent) {
    return cachedAgent;
  }

  console.log("[Executor] Initializing MCP client and fetching tools...");
  try {
    const mcpClient = new MultiServerMCPClient({
      mcpServers: {
        "onchainos-mcp": {
          url: "https://web3.okx.com/api/v1/onchainos-mcp",
          headers: {
            "OK-ACCESS-KEY": process.env.OK_ACCESS_KEY as string,
          },
        },
      },
    });

    const mcpTools = await mcpClient.getTools();
    console.log(`[Executor] Successfully loaded ${mcpTools.length} MCP tools`);

    cachedAgent = createAgent({
      model,
      tools: [
        walletStatusTool,
        walletAddressesTool,
        walletBalanceTool,
        walletChainsTool,
        createErc8004AgentTool,
        walletContractCallTool,
        ...mcpTools,
      ],
      systemPrompt,
    });
  } catch (error) {
    console.error("[Executor] Failed to initialize MCP client:", error);
    // Fallback to only using the deterministic wallet tools if MCP fails
    cachedAgent = createAgent({
      model,
      tools: [
        walletStatusTool,
        walletAddressesTool,
        walletBalanceTool,
        walletChainsTool,
        walletContractCallTool,
        createErc8004AgentTool,
      ],
      systemPrompt,
    });
  }

  return cachedAgent;
}

export async function invokeAgent(
  messages: BaseMessage[],
): Promise<BaseMessage> {
  console.log("[Executor] Invoking agent...");

  const agent = await getAgent();
  const response = await agent.invoke({ messages });
  const lastMessage = response.messages[response.messages.length - 1];
  return lastMessage;
}
