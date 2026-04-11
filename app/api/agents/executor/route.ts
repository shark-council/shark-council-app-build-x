import { invokeAgent } from "@/lib/agents/executor";
import { createFailedApiResponse, createSuccessApiResponse } from "@/lib/api";
import { getErrorString } from "@/lib/error";
import { HumanMessage } from "langchain";
import { NextRequest } from "next/server";
import z from "zod";

export async function POST(request: NextRequest) {
  try {
    console.log("[Executor API] Handling post request...");

    const bodySchema = z.object({
      message: z.string(),
    });

    const body = await request.json();

    const bodyParseResult = bodySchema.safeParse(body);
    if (!bodyParseResult.success) {
      return createFailedApiResponse({ message: "Invalid request body" }, 400);
    }

    const { message } = bodyParseResult.data;

    const agentResponse = await invokeAgent([new HumanMessage(message)]);

    const response =
      typeof agentResponse.content === "string"
        ? agentResponse.content
        : JSON.stringify(agentResponse.content);

    return createSuccessApiResponse({ response });
  } catch (error) {
    console.error(
      `[Executor API] Failed to handle post request, error: ${getErrorString(error)}`,
    );
    return createFailedApiResponse({ message: "Internal server error" }, 500);
  }
}
