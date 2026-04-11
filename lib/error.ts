import axios from "axios";
import { toast } from "sonner";

export function handleError(args: {
  error: unknown;
  toastTitle?: string;
  toastMessage?: string;
}) {
  console.error(`[Lib] Error: ${getErrorString(args.error)}`);
  toast.error(args.toastTitle || "Something went wrong", {
    description: args.toastMessage || getErrorString(args.error),
  });
}

export function getErrorString(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return JSON.stringify({
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
  }
  if (error instanceof Error) {
    return error.message;
  }
  return JSON.stringify(error, (_, value) =>
    typeof value === "bigint" ? value.toString() : value,
  );
}
