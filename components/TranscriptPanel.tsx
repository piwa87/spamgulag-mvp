"use client";

import { useEffect, useRef } from "react";
import { TranscriptEntry } from "@/lib/types/agent";

interface TranscriptPanelProps {
  entries: TranscriptEntry[];
}

const ROLE_LABELS: Record<TranscriptEntry["role"], string> = {
  caller: "Caller",
  agent: "Agent",
  system: "System",
};

const ROLE_STYLES: Record<TranscriptEntry["role"], string> = {
  caller: "bg-gray-100 text-gray-800",
  agent: "bg-blue-50 text-blue-900 border-l-4 border-blue-400",
  system: "bg-yellow-50 text-yellow-800 text-sm italic",
};

const LABEL_STYLES: Record<TranscriptEntry["role"], string> = {
  caller: "text-gray-500",
  agent: "text-blue-600",
  system: "text-yellow-700",
};

export default function TranscriptPanel({ entries }: TranscriptPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest entry
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries]);

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-3">
        Transcript
      </h2>
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {entries.length === 0 && (
          <p className="text-gray-400 text-sm text-center mt-8">
            The conversation transcript will appear here.
          </p>
        )}
        {entries.map((entry) => (
          <div
            key={entry.id}
            className={`rounded-lg px-4 py-3 ${ROLE_STYLES[entry.role]}`}
          >
            <span
              className={`text-xs font-bold uppercase tracking-wide mr-2 ${LABEL_STYLES[entry.role]}`}
            >
              {ROLE_LABELS[entry.role]}:
            </span>
            <span>{entry.text}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
