/**
 * Sends an audio blob to the /api/transcribe backend route
 * and returns the transcribed text.
 */
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append("audio", audioBlob, "audio.webm");

  const response = await fetch("/api/transcribe", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Transcription failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.transcript as string;
}
