import { execFile } from "child_process";
import express, { Request, Response } from "express";
import os from "os";
import path from "path";
import { promisify } from "util";
import { z } from "zod";

const execFileAsync = promisify(execFile);

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;

// Allow overriding the CLI path via environment variable.
// Default matches the Next.js app's original logic but adjusts for Linux path instead of Windows (.exe)
const CLI_PATH =
  process.env.CLI_PATH || path.join(os.homedir(), ".local", "bin", "onchainos");

app.use(express.json());

// Authentication Middleware
const authMiddleware = (
  req: Request,
  res: Response,
  next: express.NextFunction,
) => {
  if (!API_KEY) {
    console.warn("WARNING: API_KEY is not set. Refusing all requests.");
    res.status(500).json({ error: "Server misconfiguration: API_KEY not set" });
    return;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized: Missing Bearer token" });
    return;
  }

  const token = authHeader.split(" ")[1];
  if (token !== API_KEY) {
    res.status(403).json({ error: "Forbidden: Invalid API key" });
    return;
  }

  next();
};

const executeRequestSchema = z.object({
  args: z.array(z.string()),
});

app.post("/execute", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { args } = executeRequestSchema.parse(req.body);

    console.log(`[Proxy] Executing command: onchainos ${args.join(" ")}`);

    const { stdout, stderr } = await execFileAsync(CLI_PATH, args);

    res.json({ stdout, stderr });
  } catch (error) {
    console.error(`[Proxy] Error executing command:`, error);

    if (error instanceof z.ZodError) {
      res
        .status(400)
        .json({ error: "Invalid request body", details: error.errors });
    } else {
      res.status(500).json({
        error: "Execution failed",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }
});

app.listen(PORT, () => {
  console.log(`[Proxy] Server listening on port ${PORT}`);
  if (!API_KEY) {
    console.error(`[Proxy] FATAL: API_KEY environment variable is missing!`);
  }
});
