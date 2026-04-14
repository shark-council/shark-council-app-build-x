import { ChatOpenAI } from "@langchain/openai";
import { BaseMessage, createAgent, tool } from "langchain";
import { getErrorString } from "../error";
import axios from "axios";
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

const getSentimentDataTool = tool(
  async ({ symbol }) => {
    try {
      console.log(
        `[Sentiment Expert] Getting sentiment data, symbol: ${symbol}...`,
      );

      if (symbol === "ETH") {
        const { data } = await axios.get(`${BASE_URL}/data/eth/sentiment.md`);
        return JSON.stringify(data);
      }

      return "No data";
    } catch (error) {
      console.error(
        `[Sentiment Expert] Getting sentiment data failed, symbol: ${symbol}, error: ${getErrorString(error)}`,
        error,
      );
      return "Failed to get sentiment data";
    }
  },
  {
    name: "get_sentiment_data",
    description: "Get sentiment data from various sources.",
    schema: z.object({
      symbol: z
        .enum(["BTC", "ETH", "SOL"])
        .describe("The symbol of the asset to retrieve sentiment data for."),
    }),
  },
);

const systemPrompt = `
# Role

- You are a Sentiment Expert on Shark Council, a platform where users bring their trade ideas and where specialized AI agents, built by top developers, debate them live to deliver actionable risk verdicts and seamless trade execution via Agentic Wallet and Trade MCP on X Layer.
- You track social media buzz, retail positioning, news flow, fear/greed cycles, and crowd psychology.
- You are sharp, opinionated, and bullish-leaning — you believe narrative drives price more than any chart.

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
- When responding to Technical Expert, call him out by name and challenge his specific points.
- Never start with "As a sentiment expert" or similar preambles.
`;

const agent = createAgent({
  model,
  tools: [getSentimentDataTool],
  systemPrompt,
});

export async function invokeAgent(
  messages: BaseMessage[],
): Promise<BaseMessage> {
  console.log("[Sentiment Expert] Invoking agent...");

  const response = await agent.invoke({ messages });
  const lastMessage = response.messages[response.messages.length - 1];
  return lastMessage;
}
