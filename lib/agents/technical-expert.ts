import { ChatOpenAI } from "@langchain/openai";
import axios from "axios";
import { BaseMessage, createAgent, tool } from "langchain";
import { getErrorString } from "../error";
import z from "zod";

const BASE_URL = process.env.BASE_URL;

const model = new ChatOpenAI({
  model: "google/gemini-3-flash-preview",
  apiKey: process.env.OPEN_ROUTER_API_KEY,
  configuration: {
    baseURL: "https://openrouter.ai/api/v1",
  },
  temperature: 0,
});

const getTechnicalDataTool = tool(
  async ({ symbol }) => {
    try {
      console.log(
        `[Technical Expert] Getting technical data, symbol: ${symbol}...`,
      );

      if (symbol === "BTC") {
        const { data } = await axios.get(`${BASE_URL}/data/btc/technical.md`);
        return JSON.stringify(data);
      }

      return "No data";
    } catch (error) {
      console.error(
        `[Technical Expert] Getting technical data failed, symbol: ${symbol}, error: ${getErrorString(error)}`,
        error,
      );
      return "Failed to get technical data";
    }
  },
  {
    name: "get_technical_data",
    description: "Get technical data from various sources.",
    schema: z.object({
      symbol: z
        .enum(["BTC", "ETH", "SOL"])
        .describe("The symbol of the asset to retrieve technical data for."),
    }),
  },
);

const systemPrompt = `
# Role

- You are a Technical Expert on Shark Council, a platform where users bring their trade ideas and where specialized AI agents, built by top developers, debate them live to deliver actionable risk verdicts and seamless trade execution via Agentic Wallet and Trade MCP on X Layer.
- You live in charts — RSI, MACD, volume profiles, support/resistance, trend structure, and price action.
- You are skeptical, bearish-leaning, and brutally honest. You think hype kills portfolios.

# Context

- Current date: ${new Date().toISOString()}

# Rules

- Do not hallucinate or invent numbers. Only use specific values and dates provided in the tool outputs.
- If tool data is missing or the tool fails, explicitly say data is unavailable and avoid numeric claims.
- Always speak in 2-4 short punchy sentences. Never more.
- Split your response into 2 short paragraphs for readability.
- Leave a blank line between paragraphs.
- No bullet points. No headers. Speak like a person, not a report.
- Be direct and confident. Show your personality.
- When responding to Sentiment Expert, call him out by name and challenge his specific claims with data.
- Never start with "As a technical expert" or similar preambles.
`;

const agent = createAgent({
  model,
  tools: [getTechnicalDataTool],
  systemPrompt,
});

export async function invokeAgent(
  messages: BaseMessage[],
): Promise<BaseMessage> {
  console.log("[Technical Expert] Invoking agent...");

  const response = await agent.invoke({ messages });
  const lastMessage = response.messages[response.messages.length - 1];
  return lastMessage;
}
