"use client";

import { useEffect, useState } from "react";
import { Volume2, KeyRound, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { useJarvis } from "@/lib/store";
import { speak } from "@/lib/voice/tts";
import type { Capabilities } from "@/lib/types";

export default function SettingsPage() {
  const voice = useJarvis((s) => s.voice);
  const setVoice = useJarvis((s) => s.setVoice);
  const mode = useJarvis((s) => s.mode);
  const setMode = useJarvis((s) => s.setMode);
  const [caps, setCaps] = useState<Capabilities | null>(null);

  useEffect(() => {
    fetch("/api/config", { cache: "no-store" })
      .then((r) => r.json())
      .then(setCaps)
      .catch(() => setCaps({ anthropic: false, elevenlabs: false }));
  }, []);

  return (
    <div className="scroll-thin h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Mode */}
        <Section title="Mode" desc="Demo runs on a rehearsed script. Live uses Claude.">
          <div className="flex gap-2">
            {(["demo", "live"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 rounded-xl border px-4 py-3 text-sm capitalize transition ${
                  mode === m
                    ? "border-arc/50 bg-arc/10 text-arc"
                    : "border-white/10 text-white/60 hover:text-white"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </Section>

        {/* Voice */}
        <Section title="Voice" desc="How Jarvis speaks aloud.">
          <Toggle
            label="Speak replies automatically"
            on={voice.autoSpeak}
            onChange={(v) => setVoice({ autoSpeak: v })}
          />
          <Slider
            label="Rate"
            value={voice.rate}
            min={0.6}
            max={1.4}
            step={0.02}
            onChange={(v) => setVoice({ rate: v })}
          />
          <Slider
            label="Pitch"
            value={voice.pitch}
            min={0.6}
            max={1.4}
            step={0.02}
            onChange={(v) => setVoice({ pitch: v })}
          />
          <button
            onClick={() =>
              speak(
                "Good evening. Jarvis here, online and at your service. Shall we begin?",
                { rate: voice.rate, pitch: voice.pitch },
              )
            }
            className="mt-1 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/80 transition hover:bg-white/[0.07]"
          >
            <Volume2 size={16} /> Test voice
          </button>
        </Section>

        {/* Capabilities */}
        <Section title="Connections" desc="Drop keys into .env.local to unlock these.">
          <CapRow
            icon={<Sparkles size={16} />}
            label="Claude (the brain)"
            hint="ANTHROPIC_API_KEY — enables Live mode"
            ok={caps?.anthropic}
          />
          <CapRow
            icon={<KeyRound size={16} />}
            label="ElevenLabs (rich British voice)"
            hint="ELEVENLABS_API_KEY — upgrades the spoken voice"
            ok={caps?.elevenlabs}
          />
          <p className="mt-2 text-xs leading-relaxed text-white/40">
            Without a Claude key, Jarvis runs in demo mode. Without an ElevenLabs
            key, he speaks through your browser&apos;s built-in British voice.
          </p>
        </Section>
      </div>
    </div>
  );
}

function Section({
  title,
  desc,
  children,
}: {
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl glass p-5">
      <h3 className="text-base font-semibold tracking-tight">{title}</h3>
      <p className="mb-4 mt-0.5 text-sm text-white/50">{desc}</p>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Toggle({
  label,
  on,
  onChange,
}: {
  label: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-white/80">{label}</span>
      <button
        onClick={() => onChange(!on)}
        className={`relative h-6 w-11 rounded-full transition ${
          on ? "bg-arc" : "bg-white/15"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
            on ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-sm">
        <span className="text-white/80">{label}</span>
        <span className="text-white/45">{value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-arc"
      />
    </div>
  );
}

function CapRow({
  icon,
  label,
  hint,
  ok,
}: {
  icon: React.ReactNode;
  label: string;
  hint: string;
  ok?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-white/60">{icon}</span>
      <div className="flex-1">
        <div className="text-sm text-white/85">{label}</div>
        <div className="font-mono text-[11px] text-white/40">{hint}</div>
      </div>
      {ok === undefined ? (
        <span className="text-xs text-white/40">checking…</span>
      ) : ok ? (
        <span className="flex items-center gap-1 text-xs text-emerald-400">
          <CheckCircle2 size={15} /> connected
        </span>
      ) : (
        <span className="flex items-center gap-1 text-xs text-white/40">
          <XCircle size={15} /> not set
        </span>
      )}
    </div>
  );
}
