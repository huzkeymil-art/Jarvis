export type Role = "user" | "assistant";

export interface Message {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
  /** transient flag while the assistant message is streaming */
  streaming?: boolean;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  workspaceId?: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface Workspace {
  id: string;
  name: string;
  description: string;
  /** lucide icon name */
  icon: string;
  color: string;
  systemPrompt?: string;
  createdAt: number;
}

export type AgentStepKind =
  | "thinking"
  | "tool_use"
  | "tool_result"
  | "text"
  | "error"
  | "done";

export interface AgentStep {
  id: string;
  kind: AgentStepKind;
  /** tool name for tool_use / tool_result */
  name?: string;
  /** human-readable body */
  content: string;
  /** structured input for tool calls */
  input?: unknown;
  createdAt: number;
}

export type AgentTaskStatus = "idle" | "running" | "complete" | "error";

export interface AgentTask {
  id: string;
  prompt: string;
  status: AgentTaskStatus;
  steps: AgentStep[];
  createdAt: number;
}

export type AppMode = "demo" | "live";

export type OrbState = "idle" | "listening" | "thinking" | "speaking";

export interface Capabilities {
  anthropic: boolean;
  elevenlabs: boolean;
}
