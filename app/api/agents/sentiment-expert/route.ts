import { invokeAgent } from "@/lib/agents/sentiment-expert";
import { createFailedApiResponse, createSuccessApiResponse } from "@/lib/api";
import { getErrorString } from "@/lib/error";
import { HumanMessage } from "langchain";
import { NextRequest } from "next/server";
import z from "zod";

export async function POST(request: NextRequest) {
  try {
    console.log("[Sentiment Expert API] Handling post request...");

    // Define the schema for request body validation
    const bodySchema = z.object({
      message: z.string(),
    });

    // Extract request body
    const body = await request.json();

    // Validate request body using schema
    const bodyParseResult = bodySchema.safeParse(body);
    if (!bodyParseResult.success) {
      return createFailedApiResponse({ message: "Invalid request body" }, 400);
    }

    // Extract validated data
    const { message } = bodyParseResult.data;

    // Invoke the agent
    const agentResponse = await invokeAgent([new HumanMessage(message)]);

    const response =
      typeof agentResponse.content === "string"
        ? agentResponse.content
        : JSON.stringify(agentResponse.content);

    return createSuccessApiResponse({ response });
  } catch (error) {
    console.error(
      `[Sentiment Expert API] Failed to handle post request: ${getErrorString(error)}`,
    );
    return createFailedApiResponse({ message: "Internal server error" }, 500);
  }
}
