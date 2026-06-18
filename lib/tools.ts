import type Anthropic from "@anthropic-ai/sdk";

/**
 * Custom local tools Jarvis can call in agent mode. These are resolved
 * server-side so they show up as real tool-calls in the task timeline.
 * They are intentionally lightweight demos of tool-calling.
 */
export const LOCAL_TOOLS: Anthropic.Tool[] = [
  {
    name: "get_system_status",
    description:
      "Report Jarvis's current operational status: time, a synthetic core-temperature and power-level reading. Use when the user asks how you are, for a status report, or a 'systems check'.",
    input_schema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "set_reminder",
    description:
      "Record a reminder for the user with a label and a relative time. Use when the user asks to be reminded of something.",
    input_schema: {
      type: "object",
      properties: {
        label: { type: "string", description: "What to remind the user about" },
        in_minutes: {
          type: "number",
          description: "How many minutes from now",
        },
      },
      required: ["label", "in_minutes"],
    },
  },
  {
    name: "save_note",
    description:
      "Save a short note to Jarvis's local log. Use when the user asks you to note, jot down, or remember something briefly.",
    input_schema: {
      type: "object",
      properties: {
        text: { type: "string", description: "The note content" },
      },
      required: ["text"],
    },
  },
];

/** Resolve a local tool call to a string result. */
export function runLocalTool(name: string, input: Record<string, unknown>): string {
  switch (name) {
    case "get_system_status": {
      const temp = (36 + Math.random() * 4).toFixed(1);
      const power = (90 + Math.random() * 10).toFixed(0);
      return `Systems nominal. Local time ${new Date().toLocaleTimeString(
        "en-GB",
      )}. Core temperature ${temp}°C. Power at ${power}%. All subsystems online.`;
    }
    case "set_reminder": {
      const label = String(input.label ?? "your reminder");
      const mins = Number(input.in_minutes ?? 0);
      const when = new Date(Date.now() + mins * 60_000).toLocaleTimeString("en-GB");
      return `Reminder set: "${label}" at ${when} (in ${mins} minute${
        mins === 1 ? "" : "s"
      }).`;
    }
    case "save_note": {
      return `Noted, and filed to the local log: "${String(input.text ?? "")}".`;
    }
    default:
      return `Unknown local tool: ${name}.`;
  }
}

export const LOCAL_TOOL_NAMES = new Set(LOCAL_TOOLS.map((t) => t.name));
