import { AgentStatus } from "@/lib/types/agent";

/**
 * Valid state transitions for the conversation loop.
 * idle -> listening -> thinking -> speaking -> listening
 */
const TRANSITIONS: Record<AgentStatus, AgentStatus[]> = {
  idle: ["listening", "error"],
  listening: ["thinking", "idle", "error"],
  thinking: ["speaking", "idle", "error"],
  speaking: ["listening", "idle", "error"],
  error: ["idle"],
};

export function canTransition(from: AgentStatus, to: AgentStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export function transition(
  current: AgentStatus,
  next: AgentStatus
): AgentStatus {
  if (canTransition(current, next)) {
    return next;
  }
  // Allow forced reset to idle from any state
  if (next === "idle") {
    return "idle";
  }
  console.warn(`Invalid state transition: ${current} -> ${next}`);
  return current;
}
