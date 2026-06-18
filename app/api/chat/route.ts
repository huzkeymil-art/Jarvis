import { getAnthropic, JARVIS_MODEL, JARVIS_SYSTEM } from "@/lib/anthropic";

export const runtime = "nodejs";
export const maxDuration = 60;

interface InMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Streaming chat endpoint (live mode). Streams plain text deltas.
 * Returns 503 when no key is configured so the client can fall back to demo.
 */
export async function POST(req: Request) {
  const client = getAnthropic();
  if (!client) {
    return new Response("No ANTHROPIC_API_KEY configured.", { status: 503 });
  }

  let body: { messages?: InMessage[]; system?: string };
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON.", { status: 400 });
  }

  const messages = (body.messages ?? [])
    .filter((m) => m.content?.trim())
    .map((m) => ({ role: m.role, content: m.content }));

  if (!messages.length) {
    return new Response("No messages.", { status: 400 });
  }

  const system = body.system
    ? `${JARVIS_SYSTEM}\n\n${body.system}`
    : JARVIS_SYSTEM;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const run = client.messages.stream({
          model: JARVIS_MODEL,
          max_tokens: 4096,
          system,
          messages,
        });
        run.on("text", (delta) => controller.enqueue(encoder.encode(delta)));
        await run.finalMessage();
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Unknown error from Claude.";
        controller.enqueue(
          encoder.encode(`\n\n[Jarvis encountered an error: ${msg}]`),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
