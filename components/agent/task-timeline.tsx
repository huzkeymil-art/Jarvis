"use client";

import { motion } from "framer-motion";
import {
  Brain,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Globe,
  Code2,
  Cpu,
} from "lucide-react";
import type { AgentStep } from "@/lib/types";

function iconFor(step: AgentStep) {
  if (step.kind === "thinking") return Brain;
  if (step.kind === "text") return Sparkles;
  if (step.kind === "error") return AlertTriangle;
  if (step.kind === "tool_result") return CheckCircle2;
  if (step.kind === "tool_use") {
    if (step.name?.includes("web")) return Globe;
    if (step.name?.includes("code")) return Code2;
    return Wrench;
  }
  return Cpu;
}

function colorFor(step: AgentStep) {
  switch (step.kind) {
    case "thinking":
      return "#9d8bff";
    case "tool_use":
      return "#48d6ff";
    case "tool_result":
      return "#5eead4";
    case "text":
      return "#ffcf6e";
    case "error":
      return "#fb7185";
    default:
      return "#7fe3ff";
  }
}

export function TaskTimeline({ steps }: { steps: AgentStep[] }) {
  return (
    <div className="relative flex flex-col gap-3 pl-6">
      <div className="absolute bottom-2 left-[10px] top-2 w-px bg-white/10" />
      {steps.map((step) => {
        const Icon = iconFor(step);
        const color = colorFor(step);
        return (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative"
          >
            <span
              className="absolute -left-[22px] top-1 flex h-5 w-5 items-center justify-center rounded-full"
              style={{ background: `${color}22`, color }}
            >
              <Icon size={12} />
            </span>

            {step.kind === "text" ? (
              <div className="rounded-xl glass px-4 py-3 text-[15px] leading-relaxed text-white/90">
                {step.content}
              </div>
            ) : step.kind === "tool_use" || step.kind === "tool_result" ? (
              <div className="rounded-xl border border-white/8 bg-white/[0.03] px-3.5 py-2.5">
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-medium uppercase tracking-wide"
                    style={{ color }}
                  >
                    {step.kind === "tool_use" ? "Calling" : "Result"}
                  </span>
                  <span className="font-mono text-xs text-white/70">
                    {step.name}
                  </span>
                </div>
                <p className="mt-1 text-sm text-white/65">{step.content}</p>
                {step.input != null && (
                  <pre className="scroll-thin mt-1.5 max-h-24 overflow-auto rounded-lg bg-black/30 p-2 font-mono text-[11px] text-white/55">
                    {JSON.stringify(step.input, null, 2)}
                  </pre>
                )}
              </div>
            ) : step.kind === "error" ? (
              <div className="rounded-xl border border-red-400/20 bg-red-400/5 px-3.5 py-2.5 text-sm text-red-300">
                {step.content}
              </div>
            ) : (
              <div className="px-1 py-0.5 text-sm italic text-white/55">
                {step.content}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
