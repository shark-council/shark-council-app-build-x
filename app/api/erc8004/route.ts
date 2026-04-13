import { createFailedApiResponse, createSuccessApiResponse } from "@/lib/api";
import { getErrorString } from "@/lib/error";
import { NextRequest } from "next/server";
import z from "zod";

// TODO: Implement this API route to handle ERC-8004 agent registration
export async function POST(request: NextRequest) {
  try {
    console.log("[ERC-8004 API] Handling post request...");

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

    const response = {};

    return createSuccessApiResponse(response);
  } catch (error) {
    console.error(
      `[ERC-8004 API] Failed to handle post request: ${getErrorString(error)}`,
    );
    return createFailedApiResponse({ message: "Internal server error" }, 500);
  }
}
