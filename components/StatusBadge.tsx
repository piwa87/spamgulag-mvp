"use client";

import { AgentStatus } from "@/lib/types/agent";

interface StatusBadgeProps {
  status: AgentStatus;
}

const STATUS_LABELS: Record<AgentStatus, string> = {
  idle: "Idle",
  listening: "Listening…",
  thinking: "Thinking…",
  speaking: "Speaking",
  error: "Error",
};

const STATUS_COLORS: Record<AgentStatus, string> = {
  idle: "bg-gray-200 text-gray-700",
  listening: "bg-green-100 text-green-800 animate-pulse",
  thinking: "bg-yellow-100 text-yellow-800 animate-pulse",
  speaking: "bg-blue-100 text-blue-800 animate-pulse",
  error: "bg-red-100 text-red-800",
};

const STATUS_DOTS: Record<AgentStatus, string> = {
  idle: "bg-gray-400",
  listening: "bg-green-500",
  thinking: "bg-yellow-500",
  speaking: "bg-blue-500",
  error: "bg-red-500",
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${STATUS_COLORS[status]}`}
    >
      <span
        className={`w-2.5 h-2.5 rounded-full ${STATUS_DOTS[status]}`}
      />
      {STATUS_LABELS[status]}
    </span>
  );
}
