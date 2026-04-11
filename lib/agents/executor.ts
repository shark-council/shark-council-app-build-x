import { ChatOpenAI } from "@langchain/openai";
import { exec } from "child_process";
import { BaseMessage, createAgent, tool } from "langchain";
import { promisify } from "util";
import { getErrorString } from "../error";
import { z } from "zod";
import os from "os";
import path from "path";

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

      // Only allow specific command prefixes
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
      "Execute OKX Onchain OS Agentic Wallet CLI commands. Use this to perform operations like getting balance, checking status, viewing addresses, or sending tokens.",
    schema: z.object({
      command: z
        .string()
        .describe(
          "The CLI command to execute, excluding the 'onchainos' prefix. e.g. 'wallet status', 'wallet addresses', 'wallet balance --chain ethereum'.",
        ),
    }),
  },
);

const systemPrompt = `
# Role

- You are Executor, an AI Agent with an OKX Onchain OS Agentic Wallet.

# Context

- Current date: ${new Date().toISOString()}

# Rules

- ...
`;

const agent = createAgent({
  model,
  tools: [executeWalletCommandTool],
  systemPrompt,
});

export async function invokeAgent(
  messages: BaseMessage[],
): Promise<BaseMessage> {
  console.log("[Executor] Invoking agent...");

  const response = await agent.invoke({ messages });
  const lastMessage = response.messages[response.messages.length - 1];
  return lastMessage;
}
