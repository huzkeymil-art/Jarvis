"use client";

import { useEffect, useState } from "react";
import { Zap, FlaskConical } from "lucide-react";
import { useJarvis } from "@/lib/store";
import type { Capabilities } from "@/lib/types";

export function ModeToggle() {
  const mode = useJarvis((s) => s.mode);
  const setMode = useJarvis((s) => s.setMode);
  const [caps, setCaps] = useState<Capabilities | null>(null);

  useEffect(() => {
    fetch("/api/config", { cache: "no-store" })
      .then((r) => r.json())
      .then(setCaps)
      .catch(() => setCaps({ anthropic: false, elevenlabs: false }));
  }, []);

  const liveUnavailable = mode === "live" && caps && !caps.anthropic;

  return (
    <div className="flex items-center gap-3">
      {liveUnavailable && (
        <span className="hidden text-xs text-gold sm:inline">
          No API key — running in demo
        </span>
      )}
      <div className="flex items-center rounded-full border border-white/10 bg-white/[0.04] p-1 text-sm">
        <button
          onClick={() => setMode("demo")}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 transition ${
            mode === "demo"
              ? "bg-white/10 text-white"
              : "text-white/55 hover:text-white"
          }`}
        >
          <FlaskConical size={14} /> Demo
        </button>
        <button
          onClick={() => setMode("live")}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 transition ${
            mode === "live"
              ? "bg-arc text-obsidian-950"
              : "text-white/55 hover:text-white"
          }`}
        >
          <Zap size={14} /> Live
        </button>
      </div>
    </div>
  );
}
