import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { ChatOpenAI } from "@langchain/openai";
import { exec } from "child_process";
import { BaseMessage, createAgent, type ReactAgent, tool } from "langchain";
import os from "os";
import path from "path";
import { promisify } from "util";
import { z } from "zod";
import { getErrorString } from "../error";

const execAsync = promisify(exec);

const onchainosPath = path.join(os.homedir(), ".local", "bin", "onchainos.exe");

const model = new ChatOpenAI({
  model: "google/gemini-3-flash-preview",
  apiKey: process.env.OPEN_ROUTER_API_KEY,
  configuration: {
    baseURL: "https://openrouter.ai/api/v1",
  },
  temperature: 0,
});

const executeWalletCommandTool = tool(
  async ({ command }) => {
    try {
      console.log(`[Executor] Executing wallet command: ${command}...`);

      // Only allow commands in the form `onchainos wallet ...`.
      if (!command.startsWith("wallet ")) {
        throw new Error("Invalid command, only 'wallet' commands are allowed");
      }

      const { stdout, stderr } = await execAsync(
        `"${onchainosPath}" ${command}`,
      );
      return stdout || stderr;
    } catch (error) {
      console.error(
        `[Executor] Failed to execute wallet command: ${getErrorString(error)}`,
        error,
      );
      return `Failed to execute wallet command: ${getErrorString(error)}`;
    }
  },
  {
    name: "execute_wallet_command",
    description:
      "Execute OKX Onchain OS Agentic Wallet CLI commands in the form 'onchainos wallet [OPTIONS] <COMMAND>' while excluding the leading 'onchainos' binary name. Supported wallet commands include login, verify, add, switch, status, addresses, logout, chains, balance, send, history, sign-message, and contract-call.",
    schema: z.object({
      command: z
        .string()
        .describe(
          "The CLI fragment to execute after the 'onchainos' binary. It must start with 'wallet' and follow the shape 'wallet [OPTIONS] <COMMAND>'. Global wallet options include '--base-url <BASE_URL>' and '--chain <CHAIN>'. Supported subcommands are 'login', 'verify', 'add', 'switch', 'status', 'addresses', 'logout', 'chains', 'balance', 'send', 'history', 'sign-message', and 'contract-call'. Examples: 'wallet status', 'wallet addresses', 'wallet balance --chain ethereum', 'wallet send --help', or 'wallet contract-call --help'.",
        ),
    }),
  },
);

const systemPrompt = `
# Role

- You are Executor, an AI Agent with an OKX Onchain OS Agentic Wallet.

# Context

- Current date: ${new Date().toISOString()}

# Swap Instructions

- Swaps must use OKX OnchainOS MCP tools only. Do not execute swaps through the Onchain OS CLI.
- For swap intent, follow this order: validate chain and token details, verify the active wallet or recipient address context, get the best quote, handle approval if needed, then build the swap transaction.
- Never guess chain names, chain indexes, token addresses, wallet addresses, or amounts. If any required execution detail is missing or ambiguous, ask the user.
- For EVM swaps, use the DEX tool flow: supported chains or liquidity if needed, quote with dex-okx-dex-quote, approval with dex-okx-dex-approve-transaction when the sell token is not native, then construct the trade with dex-okx-dex-swap.
- For Solana swaps, use dex-okx-dex-solana-swap-instruction instead of the EVM swap tool.
- If approval is needed, approve only the amount required for the trade or a small safety buffer. Never approve unlimited allowance.
- MCP tools are responsible for quote discovery and swap transaction construction. Agentic Wallet commands are responsible for wallet-side actions such as checking wallet state, approvals, signing, and broadcasting when a wallet command is required.
- If MCP is unavailable, do not fall back to CLI swap execution. Explain that swap execution is temporarily unavailable instead.
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
      tools: [executeWalletCommandTool, ...mcpTools],
      systemPrompt,
    });
  } catch (error) {
    console.error("[Executor] Failed to initialize MCP client:", error);
    // Fallback to only using the wallet command tool if MCP fails
    cachedAgent = createAgent({
      model,
      tools: [executeWalletCommandTool],
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
