import {
  getAnthropic,
  JARVIS_MODEL,
  JARVIS_AGENT_SYSTEM,
} from "@/lib/anthropic";
import { LOCAL_TOOLS, LOCAL_TOOL_NAMES, runLocalTool } from "@/lib/tools";

export const runtime = "nodejs";
export const maxDuration = 120;

/* eslint-disable @typescript-eslint/no-explicit-any */

const MAX_ITERATIONS = 8;

function sse(controller: ReadableStreamDefaultController, encoder: TextEncoder, obj: unknown) {
  controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
}

/**
 * Agentic loop with server-side tools (web search/fetch, code execution) and
 * local custom tools. Emits the trace as SSE events for the task timeline.
 * Returns 503 when no key is configured → client falls back to a scripted run.
 */
export async function POST(req: Request) {
  const client = getAnthropic();
  if (!client) {
    return new Response("No ANTHROPIC_API_KEY configured.", { status: 503 });
  }

  let body: { prompt?: string };
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON.", { status: 400 });
  }
  const prompt = (body.prompt ?? "").trim();
  if (!prompt) return new Response("No prompt.", { status: 400 });

  const tools: any[] = [
    { type: "web_search_20260209", name: "web_search" },
    { type: "web_fetch_20260209", name: "web_fetch" },
    { type: "code_execution_20260120", name: "code_execution" },
    ...LOCAL_TOOLS,
  ];

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const messages: any[] = [{ role: "user", content: prompt }];
      try {
        for (let i = 0; i < MAX_ITERATIONS; i++) {
          const resp: any = await client.messages.create({
            model: JARVIS_MODEL,
            max_tokens: 8192,
            thinking: { type: "adaptive", display: "summarized" },
            system: JARVIS_AGENT_SYSTEM,
            tools,
            messages,
          } as any);

          const localResults: any[] = [];

          for (const block of resp.content as any[]) {
            switch (block.type) {
              case "thinking":
                if (block.thinking?.trim())
                  sse(controller, encoder, {
                    kind: "thinking",
                    content: block.thinking,
                  });
                break;
              case "text":
                if (block.text?.trim())
                  sse(controller, encoder, { kind: "text", content: block.text });
                break;
              case "server_tool_use":
                sse(controller, encoder, {
                  kind: "tool_use",
                  name: block.name,
                  content: `Calling ${block.name}…`,
                  input: block.input,
                });
                break;
              case "tool_use":
                sse(controller, encoder, {
                  kind: "tool_use",
                  name: block.name,
                  content: `Calling ${block.name}…`,
                  input: block.input,
                });
                if (LOCAL_TOOL_NAMES.has(block.name)) {
                  const result = runLocalTool(block.name, block.input ?? {});
                  sse(controller, encoder, {
                    kind: "tool_result",
                    name: block.name,
                    content: result,
                  });
                  localResults.push({
                    type: "tool_result",
                    tool_use_id: block.id,
                    content: result,
                  });
                }
                break;
              case "web_search_tool_result":
              case "web_fetch_tool_result":
                sse(controller, encoder, {
                  kind: "tool_result",
                  name: block.type.replace("_tool_result", ""),
                  content: summariseResult(block),
                });
                break;
              case "code_execution_tool_result":
              case "bash_code_execution_tool_result":
                sse(controller, encoder, {
                  kind: "tool_result",
                  name: "code_execution",
                  content: summariseResult(block),
                });
                break;
              default:
                break;
            }
          }

          messages.push({ role: "assistant", content: resp.content });

          if (resp.stop_reason === "pause_turn") {
            // Server-side tool loop paused; re-send to continue.
            continue;
          }
          if (resp.stop_reason === "tool_use" && localResults.length) {
            messages.push({ role: "user", content: localResults });
            continue;
          }
          // end_turn (or anything else terminal)
          break;
        }
        sse(controller, encoder, { kind: "done", content: "" });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown agent error.";
        sse(controller, encoder, { kind: "error", content: msg });
        sse(controller, encoder, { kind: "done", content: "" });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

function summariseResult(block: any): string {
  try {
    const c = block.content;
    if (Array.isArray(c)) {
      if (c.length && c[0]?.title)
        return `Found ${c.length} result(s). Top: ${c[0].title}`;
      const out = c.find((x: any) => x?.stdout);
      if (out?.stdout) return `Output: ${String(out.stdout).slice(0, 240)}`;
      return `Returned ${c.length} item(s).`;
    }
    if (c?.stdout) return `Output: ${String(c.stdout).slice(0, 240)}`;
    if (c?.return_code !== undefined)
      return `Exit code ${c.return_code}. ${String(c.stdout ?? "").slice(0, 200)}`;
    return "Tool completed.";
  } catch {
    return "Tool completed.";
  }
}
