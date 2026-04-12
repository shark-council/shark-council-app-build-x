import { streamOrchestrator } from "@/lib/agents/orchestrator";
import { createFailedApiResponse } from "@/lib/api";
import { getErrorString } from "@/lib/error";
import { AIMessage, HumanMessage } from "langchain";
import { NextRequest } from "next/server";
import z from "zod";

export async function POST(request: NextRequest) {
  try {
    console.log("[Orchestrator API] Handling post request...");

    // Define the schema for request body validation
    const historyItemSchema = z.object({
      role: z.enum([
        "user",
        "orchestrator",
        "sentiment-expert",
        "technical-expert",
      ]),
      content: z.string(),
      type: z.enum(["thinking", "tool-call", "message", "final"]),
    });
    const bodySchema = z.object({
      message: z.string(),
      history: z.array(historyItemSchema),
    });

    // Extract request body
    const body = await request.json();

    // Validate request body using schema
    const bodyParseResult = bodySchema.safeParse(body);
    if (!bodyParseResult.success) {
      return createFailedApiResponse({ message: "Invalid request body" }, 400);
    }

    const { message, history } = bodyParseResult.data;

    // Convert history to LangChain messages (user + orchestrator final only)
    const langchainMessages = history
      .filter(
        (m) =>
          m.role === "user" ||
          (m.role === "orchestrator" && m.type === "final"),
      )
      .map((m) => {
        if (m.role === "user") return new HumanMessage(m.content);
        return new AIMessage(m.content);
      });

    langchainMessages.push(new HumanMessage(message));

    // Pipe the async generator into a ReadableStream, encoding each SSE chunk as bytes
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of streamOrchestrator(langchainMessages)) {
            controller.enqueue(encoder.encode(chunk));
          }
        } catch (error) {
          console.error(
            `[Orchestrator API] Streaming error: ${getErrorString(error)}`,
          );
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: "Stream failed" })}\n\n`,
            ),
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error(
      `[Orchestrator API] Failed to handle post request: ${getErrorString(error)}`,
    );
    return createFailedApiResponse({ message: "Internal server error" }, 500);
  }
}
