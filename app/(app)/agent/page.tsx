"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Play, Loader2, Globe, Code2, Wrench, Bot } from "lucide-react";
import { useJarvis } from "@/lib/store";
import { useOrb } from "@/components/orb-context";
import { demoAgentSteps } from "@/lib/demo";
import { TaskTimeline } from "@/components/agent/task-timeline";
import type { AgentStep, AgentTaskStatus } from "@/lib/types";

const uid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const EXAMPLES = [
  "Research the latest on fusion energy breakthroughs and summarise.",
  "Calculate the compound interest on £10,000 at 5% over 8 years.",
  "Run a systems check and give me a status report.",
];

export default function AgentPage() {
  const mode = useJarvis((s) => s.mode);
  const { setOrbState } = useOrb();
  const [prompt, setPrompt] = useState("");
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [status, setStatus] = useState<AgentTaskStatus>("idle");
  const scrollRef = useRef<HTMLDivElement>(null);

  const push = (s: Omit<AgentStep, "id" | "createdAt">) => {
    setSteps((prev) => [...prev, { ...s, id: uid(), createdAt: Date.now() }]);
    requestAnimationFrame(() =>
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      }),
    );
  };

  const run = async (task: string) => {
    if (status === "running" || !task.trim()) return;
    setSteps([]);
    setStatus("running");
    setOrbState("thinking");

    try {
      if (mode === "live") {
        const res = await fetch("/api/agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: task }),
        });
        if (!res.ok || !res.body) {
          await runDemo(task);
        } else {
          await consumeSSE(res.body);
        }
      } else {
        await runDemo(task);
      }
      setStatus("complete");
    } catch {
      push({ kind: "error", content: "The agent run was interrupted." });
      setStatus("error");
    } finally {
      setOrbState("idle");
    }
  };

  const consumeSSE = async (body: ReadableStream<Uint8Array>) => {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\n\n");
      buffer = parts.pop() ?? "";
      for (const part of parts) {
        const line = part.trim();
        if (!line.startsWith("data:")) continue;
        try {
          const evt = JSON.parse(line.slice(5).trim());
          if (evt.kind === "done") continue;
          push({
            kind: evt.kind,
            name: evt.name,
            content: evt.content,
            input: evt.input,
          });
        } catch {
          /* ignore malformed */
        }
      }
    }
  };

  const runDemo = async (task: string) => {
    for (const s of demoAgentSteps(task)) {
      push(s);
      await sleep(700 + Math.random() * 500);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="scroll-thin flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto max-w-3xl">
          {steps.length === 0 ? (
            <Intro onPick={(t) => setPrompt(t)} />
          ) : (
            <TaskTimeline steps={steps} />
          )}
        </div>
      </div>

      <div className="mx-auto w-full max-w-3xl p-4">
        <div className="flex items-end gap-2.5">
          <div className="flex flex-1 items-center rounded-2xl glass px-4 py-1">
            <Bot size={18} className="mr-2 shrink-0 text-arc" />
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  run(prompt);
                  setPrompt("");
                }
              }}
              placeholder="Give Jarvis a task to carry out…"
              className="flex-1 bg-transparent py-3 text-[15px] text-white placeholder:text-white/35 focus:outline-none"
            />
          </div>
          <button
            onClick={() => {
              run(prompt);
              setPrompt("");
            }}
            disabled={status === "running" || !prompt.trim()}
            className="flex h-12 items-center gap-2 rounded-2xl bg-arc px-5 font-medium text-obsidian-950 transition enabled:hover:brightness-110 disabled:opacity-40"
          >
            {status === "running" ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Play size={18} />
            )}
            {status === "running" ? "Working" : "Run"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Intro({ onPick }: { onPick: (t: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto mt-6 max-w-2xl text-center"
    >
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-arc/10 text-arc shadow-glow">
        <Bot size={26} />
      </div>
      <h3 className="text-2xl font-semibold tracking-tight">The Agent</h3>
      <p className="mx-auto mt-2 max-w-md text-white/55">
        Hand Jarvis an objective. He&apos;ll plan it, reach for tools, and report
        every step as he works.
      </p>

      <div className="mx-auto mt-6 flex max-w-md flex-wrap items-center justify-center gap-2 text-xs text-white/55">
        <Cap icon={<Globe size={13} />} label="Web search & browse" />
        <Cap icon={<Code2 size={13} />} label="Code execution" />
        <Cap icon={<Wrench size={13} />} label="Local tools" />
      </div>

      <div className="mt-8 flex flex-col gap-2 text-left">
        {EXAMPLES.map((e) => (
          <button
            key={e}
            onClick={() => onPick(e)}
            className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white/70 transition hover:border-arc/30 hover:text-white"
          >
            {e}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

function Cap({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
      <span className="text-arc">{icon}</span>
      {label}
    </span>
  );
}
