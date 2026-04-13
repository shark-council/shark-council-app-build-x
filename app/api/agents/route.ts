import { invokeAgent } from "@/lib/agents/executor";
import { createFailedApiResponse, createSuccessApiResponse } from "@/lib/api";
import { getErrorString } from "@/lib/error";
import { HumanMessage } from "langchain";
import { NextRequest } from "next/server";
import z from "zod";

export async function POST(request: NextRequest) {
  try {
    console.log("[Agents API] Handling post request...");

    const bodySchema = z.object({
      image: z.string(),
      name: z.string(),
      description: z.string(),
      endpoint: z.string().url(),
    });

    const body = await request.json();

    const bodyParseResult = bodySchema.safeParse(body);
    if (!bodyParseResult.success) {
      return createFailedApiResponse({ message: "Invalid request body" }, 400);
    }

    const { image, name, description, endpoint } = bodyParseResult.data;

    const message = new HumanMessage(
      `Please create an ERC-8004 agent with the following details using the create_erc8004_agent tool:\n- Name: ${name}\n- Description: ${description}\n- Image: ${image}\n- Endpoint: ${endpoint}\n\nReturn a concise summary of the created agent details, including the Agent ID and Transaction Hash.`,
    );

    const agentResponse = await invokeAgent([message]);

    const response = { message: agentResponse.content };

    return createSuccessApiResponse(response);
  } catch (error) {
    console.error(
      `[Agents API] Failed to handle post request: ${getErrorString(error)}`,
    );
    return createFailedApiResponse({ message: "Internal server error" }, 500);
  }
}
