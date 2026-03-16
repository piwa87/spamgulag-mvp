/**
 * Captures microphone audio from the browser in short chunks
 * and delivers them as Blobs for transcription.
 */

export interface MicrophoneRecorder {
  start: () => Promise<void>;
  stop: () => void;
}

export function createMicrophoneRecorder(
  onChunk: (blob: Blob) => void,
  chunkIntervalMs = 4000
): MicrophoneRecorder {
  let mediaRecorder: MediaRecorder | null = null;
  let stream: MediaStream | null = null;
  let chunkTimer: ReturnType<typeof setTimeout> | null = null;

  async function start(): Promise<void> {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        onChunk(event.data);
      }
    };

    mediaRecorder.start();

    // Request a chunk every chunkIntervalMs milliseconds
    function scheduleChunk() {
      chunkTimer = setTimeout(() => {
        if (mediaRecorder && mediaRecorder.state === "recording") {
          mediaRecorder.requestData();
          scheduleChunk();
        }
      }, chunkIntervalMs);
    }
    scheduleChunk();
  }

  function stop(): void {
    if (chunkTimer !== null) {
      clearTimeout(chunkTimer);
      chunkTimer = null;
    }
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      stream = null;
    }
    mediaRecorder = null;
  }

  return { start, stop };
}
