import { ChatOpenAI } from "@langchain/openai";
import { exec } from "child_process";
import { BaseMessage, createAgent, tool } from "langchain";
import { promisify } from "util";
import { getErrorString } from "../error";

const execAsync = promisify(exec);

const model = new ChatOpenAI({
  model: "google/gemini-3-flash-preview",
  apiKey: process.env.OPEN_ROUTER_API_KEY,
  configuration: {
    baseURL: "https://openrouter.ai/api/v1",
  },
  temperature: 0,
});

const getWalletStatusTool = tool(
  async () => {
    try {
      console.log(`[Executor] Getting wallet status...`);

      const { stdout, stderr } = await execAsync("onchainos wallet status");
      return stdout || stderr;
    } catch (error) {
      console.error(
        `[Executor] Failed to get wallet status, error: ${getErrorString(error)}`,
        error,
      );
      return "Failed to get wallet status";
    }
  },
  {
    name: "get_wallet_status",
    description:
      "Check if the agentic wallet is logged in and see the active account and policy settings.",
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
  tools: [getWalletStatusTool],
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
