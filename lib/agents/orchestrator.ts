import { ApiResponse } from "@/types/api";
import { ChatOpenAI } from "@langchain/openai";
import { BaseMessage, HumanMessage } from "langchain";

type DebateAgentRole = "sentiment-expert" | "technical-expert";

type DebateEntry = {
  role: DebateAgentRole;
  content: string;
};

type DebateRound = {
  agent: DebateAgentRole;
  thinkingLabel: string;
  instruction: string;
};

const BASE_URL = process.env.BASE_URL;
const THINKING_DELAY_MS = 2200;
const MESSAGE_DELAY_MS = 1400;

const DEBATE_ROUNDS: DebateRound[] = [
  {
    agent: "sentiment-expert",
    thinkingLabel: "Sentiment Expert is sizing up the room...",
    instruction:
      "Open the debate. State your position on this topic. What does the crowd say?",
  },
  {
    agent: "technical-expert",
    thinkingLabel: "Technical Expert is pulling up the charts...",
    instruction:
      "Respond to Sentiment Expert directly. What does the chart say? Challenge their specific claims.",
  },
  {
    agent: "sentiment-expert",
    thinkingLabel: "Sentiment Expert is firing back...",
    instruction:
      "Push back on Technical Expert's specific technical arguments. Why are they missing the bigger picture?",
  },
  {
    agent: "technical-expert",
    thinkingLabel: "Technical Expert is checking the data one more time...",
    instruction:
      "Final word. Stand your ground or concede specific points — but be clear about the risk here.",
  },
];

const model = new ChatOpenAI({
  model: "google/gemini-3-flash-preview",
  apiKey: process.env.OPEN_ROUTER_API_KEY,
  configuration: {
    baseURL: "https://openrouter.ai/api/v1",
  },
  temperature: 0.7,
});

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function callAgent(
  role: DebateAgentRole,
  prompt: string,
): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/agents/${role}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: prompt }),
  });
  const data: ApiResponse<{ response: string }> = await res.json();
  if (!data.isSuccess || !data.data) {
    throw new Error(`${role} returned an error`);
  }
  return data.data.response;
}

function extractUserTopic(messages: BaseMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].type === "human") {
      const content = messages[i].content;
      return typeof content === "string" ? content : JSON.stringify(content);
    }
  }
  return "Unknown topic";
}

function buildDebateTranscript(history: DebateEntry[]) {
  let transcript = "";
  for (const entry of history) {
    const name =
      entry.role === "sentiment-expert"
        ? "Sentiment Expert"
        : "Technical Expert";
    const cleanContent = entry.content.replace(/\n+/g, " ");
    transcript += `${name}: ${cleanContent}\n\n`;
  }

  return transcript;
}

function buildAgentPrompt(
  userTopic: string,
  history: DebateEntry[],
  instruction: string,
): string {
  return `
Task:

${instruction}

# Debate topic

${userTopic}

# Debate transcript

${buildDebateTranscript(history)}
  `;
}

function buildVerdictPrompt(userTopic: string, history: DebateEntry[]): string {
  return `
# Task

- You are Shark Council Orchestrator — a sharp, decisive risk arbiter.
- You have just witnessed a live debate between Sentiment Expert and Technical Expert.
- Deliver your verdict.
- The verdict must explain who made the stronger case, what the risk verdict is, and what the trader should do.
- Keep the verdict to 3-5 sentences.
- Format the verdict into 2 short paragraphs with a blank line between them.
- If the debate supports waiting instead of acting, still provide the best tentative trade setup rather than leaving fields blank.
- Be authoritative. No hedging.

# Debate topic

${userTopic}

# Debate transcript

${buildDebateTranscript(history)}
  `;
}

export async function* streamOrchestrator(
  messages: BaseMessage[],
): AsyncGenerator<string> {
  const userTopic = extractUserTopic(messages);
  const debateHistory: DebateEntry[] = [];

  // Run the debate rounds sequentially
  for (const round of DEBATE_ROUNDS) {
    yield `data: ${JSON.stringify({
      role: "orchestrator",
      type: "tool-call",
      content: round.thinkingLabel,
    })}\n\n`;

    await delay(THINKING_DELAY_MS);

    const prompt = buildAgentPrompt(
      userTopic,
      debateHistory,
      round.instruction,
    );
    const response = await callAgent(round.agent, prompt);

    debateHistory.push({ role: round.agent, content: response });

    yield `data: ${JSON.stringify({
      role: round.agent,
      type: "message",
      content: response,
    })}\n\n`;

    await delay(MESSAGE_DELAY_MS);
  }

  // Orchestrator delivers the verdict
  yield `data: ${JSON.stringify({
    role: "orchestrator",
    type: "tool-call",
    content: "Shark Council deliberates...",
  })}\n\n`;

  await delay(THINKING_DELAY_MS);

  const verdictPrompt = buildVerdictPrompt(userTopic, debateHistory);
  const verdictResponse = await model.invoke([new HumanMessage(verdictPrompt)]);
  const verdict =
    typeof verdictResponse.content === "string"
      ? verdictResponse.content
      : JSON.stringify(verdictResponse.content);

  yield `data: ${JSON.stringify({
    role: "orchestrator",
    type: "final",
    content: verdict,
  })}\n\n`;

  yield `data: [DONE]\n\n`;
}
