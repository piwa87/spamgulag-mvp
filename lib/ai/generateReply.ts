import { TranscriptEntry } from "@/lib/types/agent";

/**
 * Sends the conversation history to /api/reply and returns the agent's next reply.
 */
export async function generateReply(
  transcript: TranscriptEntry[]
): Promise<string> {
  const response = await fetch("/api/reply", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transcript }),
  });

  if (!response.ok) {
    throw new Error(`Reply generation failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.reply as string;
}
