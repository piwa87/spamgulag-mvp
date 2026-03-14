"use client";

import { useCallback, useRef, useState } from "react";
import AgentControls from "@/components/AgentControls";
import StatusBadge from "@/components/StatusBadge";
import TranscriptPanel from "@/components/TranscriptPanel";
import { createMicrophoneRecorder, MicrophoneRecorder } from "@/lib/audio/microphone";
import { playAudioBuffer } from "@/lib/audio/playback";
import { transcribeAudio } from "@/lib/ai/transcribe";
import { generateReply } from "@/lib/ai/generateReply";
import { synthesizeSpeech } from "@/lib/ai/synthesizeSpeech";
import { transition } from "@/lib/state/agentStateMachine";
import { AgentState, AgentStatus, TranscriptEntry } from "@/lib/types/agent";

const INITIAL_STATE: AgentState = {
  status: "idle",
  transcript: [],
  muteReply: false,
  errorMessage: null,
};

function makeId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export default function HomePage() {
  const [state, setState] = useState<AgentState>(INITIAL_STATE);

  // Use a ref to hold the mic recorder so it persists across renders
  const recorderRef = useRef<MicrophoneRecorder | null>(null);

  // Track whether the agent loop should still be running
  const activeRef = useRef(false);

  // Track current transcript for use inside callbacks without stale closures
  const transcriptRef = useRef<TranscriptEntry[]>([]);

  const setStatus = useCallback((status: AgentStatus) => {
    setState((prev) => ({
      ...prev,
      status: transition(prev.status, status),
      errorMessage: status === "error" ? prev.errorMessage : null,
    }));
  }, []);

  const addEntry = useCallback((entry: TranscriptEntry) => {
    transcriptRef.current = [...transcriptRef.current, entry];
    setState((prev) => ({
      ...prev,
      transcript: transcriptRef.current,
    }));
  }, []);

  const setError = useCallback((message: string) => {
    setState((prev) => ({
      ...prev,
      status: "error",
      errorMessage: message,
    }));
  }, []);

  /**
   * Handles one chunk of audio from the microphone.
   * Runs the full pipeline: transcribe -> reply -> speak.
   */
  const handleAudioChunk = useCallback(
    async (audioBlob: Blob, muteReply: boolean) => {
      if (!activeRef.current) return;

      let transcript = "";
      try {
        setStatus("thinking");
        transcript = await transcribeAudio(audioBlob);
      } catch (err) {
        console.error("Transcription error:", err);
        setError("Transcription failed. Check your API key and connection.");
        return;
      }

      if (!transcript.trim() || !activeRef.current) {
        // Nothing spoken in this chunk, go back to listening
        setStatus("listening");
        return;
      }

      addEntry({
        id: makeId(),
        role: "caller",
        text: transcript,
        timestamp: Date.now(),
      });

      let reply = "";
      try {
        reply = await generateReply(transcriptRef.current);
      } catch (err) {
        console.error("Reply error:", err);
        setError("AI reply failed. Check your API key and connection.");
        return;
      }

      if (!reply.trim() || !activeRef.current) {
        setStatus("listening");
        return;
      }

      addEntry({
        id: makeId(),
        role: "agent",
        text: reply,
        timestamp: Date.now(),
      });

      if (muteReply) {
        // Skip playback, go straight back to listening
        setStatus("listening");
        return;
      }

      let audioData: ArrayBuffer;
      try {
        audioData = await synthesizeSpeech(reply);
      } catch (err) {
        console.error("Synthesis error:", err);
        setError("Speech synthesis failed. Check your API key.");
        return;
      }

      if (!activeRef.current) return;

      setStatus("speaking");
      try {
        // Mic is stopped while speaking to avoid audio feedback
        recorderRef.current?.stop();
        await playAudioBuffer(audioData);
      } catch (err) {
        console.error("Playback error:", err);
        // Non-fatal — continue loop
      }

      if (!activeRef.current) return;

      // Resume listening after playback
      setStatus("listening");
      await restartMic(muteReply);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setStatus, setError, addEntry]
  );

  /**
   * (Re)starts the microphone recorder.
   */
  const restartMic = useCallback(
    async (muteReply: boolean) => {
      recorderRef.current?.stop();

      const recorder = createMicrophoneRecorder((blob) => {
        handleAudioChunk(blob, muteReply);
      }, 4000);

      recorderRef.current = recorder;

      try {
        await recorder.start();
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Unknown microphone error";
        if (msg.includes("Permission") || msg.includes("NotAllowed")) {
          setError("Microphone access denied. Please allow mic access.");
        } else {
          setError(`Microphone error: ${msg}`);
        }
      }
    },
    [handleAudioChunk, setError]
  );

  const handleStart = useCallback(async () => {
    activeRef.current = true;
    transcriptRef.current = [];
    setState((prev) => ({
      ...prev,
      status: "listening",
      transcript: [],
      errorMessage: null,
    }));

    addEntry({
      id: makeId(),
      role: "system",
      text: "Agent started. Listening for caller…",
      timestamp: Date.now(),
    });

    const muteReply = state.muteReply;
    await restartMic(muteReply);
  }, [addEntry, restartMic, state.muteReply]);

  const handleStop = useCallback(() => {
    activeRef.current = false;
    recorderRef.current?.stop();
    recorderRef.current = null;
    setState((prev) => ({
      ...prev,
      status: "idle",
      errorMessage: null,
    }));
  }, []);

  const handleToggleMute = useCallback(() => {
    setState((prev) => ({ ...prev, muteReply: !prev.muteReply }));
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Scam Handler</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            AI voice agent — acoustic bridge prototype
          </p>
        </div>
        <StatusBadge status={state.status} />
      </header>

      {/* Controls */}
      <section className="bg-white border-b border-gray-200 px-6 py-5">
        <AgentControls
          status={state.status}
          muteReply={state.muteReply}
          onStart={handleStart}
          onStop={handleStop}
          onToggleMute={handleToggleMute}
        />
        {state.errorMessage && (
          <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm">
            ⚠️ {state.errorMessage}
          </div>
        )}
      </section>

      {/* Transcript */}
      <section className="flex-1 px-6 py-5 overflow-hidden">
        <div className="h-full max-h-[calc(100vh-220px)]">
          <TranscriptPanel entries={state.transcript} />
        </div>
      </section>
    </main>
  );
}
