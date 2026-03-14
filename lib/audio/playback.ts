/**
 * Plays an audio buffer (ArrayBuffer) through the browser speakers.
 * Returns a promise that resolves when playback finishes.
 */
export async function playAudioBuffer(audioData: ArrayBuffer): Promise<void> {
  const audioContext = new AudioContext();
  const audioBuffer = await audioContext.decodeAudioData(audioData);
  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioContext.destination);

  return new Promise<void>((resolve) => {
    source.onended = () => {
      audioContext.close();
      resolve();
    };
    source.start();
  });
}
