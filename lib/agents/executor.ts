import { ChatOpenAI } from "@langchain/openai";
import { BaseMessage, createAgent } from "langchain";

const model = new ChatOpenAI({
  model: "google/gemini-3-flash-preview",
  apiKey: process.env.OPEN_ROUTER_API_KEY,
  configuration: {
    baseURL: "https://openrouter.ai/api/v1",
  },
  temperature: 0,
});

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
  tools: [],
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
