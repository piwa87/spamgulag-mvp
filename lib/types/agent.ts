export type AgentStatus = "idle" | "listening" | "thinking" | "speaking" | "error";

export interface TranscriptEntry {
  id: string;
  role: "caller" | "agent" | "system";
  text: string;
  timestamp: number;
}

export interface AgentState {
  status: AgentStatus;
  transcript: TranscriptEntry[];
  muteReply: boolean;
  errorMessage: string | null;
}

export interface SessionConfig {
  ok: boolean;
}
