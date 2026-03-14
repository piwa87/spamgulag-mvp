"use client";

import { AgentStatus } from "@/lib/types/agent";

interface AgentControlsProps {
  status: AgentStatus;
  muteReply: boolean;
  onStart: () => void;
  onStop: () => void;
  onToggleMute: () => void;
}

export default function AgentControls({
  status,
  muteReply,
  onStart,
  onStop,
  onToggleMute,
}: AgentControlsProps) {
  const isRunning = status !== "idle" && status !== "error";

  return (
    <div className="flex flex-wrap items-center gap-4">
      <button
        onClick={onStart}
        disabled={isRunning}
        className="px-8 py-4 rounded-xl text-lg font-bold bg-green-600 text-white hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Start agent
      </button>

      <button
        onClick={onStop}
        disabled={!isRunning}
        className="px-8 py-4 rounded-xl text-lg font-bold bg-red-600 text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Stop agent
      </button>

      <button
        onClick={onToggleMute}
        className={`px-6 py-4 rounded-xl text-base font-semibold border-2 transition-colors ${
          muteReply
            ? "border-orange-500 bg-orange-50 text-orange-700"
            : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
        }`}
      >
        {muteReply ? "🔇 Reply muted" : "🔊 Mute reply"}
      </button>
    </div>
  );
}
