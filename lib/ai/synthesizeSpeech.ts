/**
 * Sends text to /api/synthesize and returns an ArrayBuffer of audio.
 */
export async function synthesizeSpeech(text: string): Promise<ArrayBuffer> {
  const response = await fetch("/api/synthesize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error(`Speech synthesis failed: ${response.statusText}`);
  }

  return response.arrayBuffer();
}
