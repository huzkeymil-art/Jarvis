"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Mic, Sparkles, Boxes } from "lucide-react";
import { JarvisOrb } from "@/components/jarvis-orb";

export default function Landing() {
  return (
    <main className="relative grid h-screen w-screen grid-cols-1 overflow-hidden lg:grid-cols-2">
      {/* Left: copy */}
      <div className="z-10 flex flex-col justify-center px-8 py-16 sm:px-16 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs tracking-wide text-arc">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-arc" />
            ONLINE · STANDING BY
          </div>
          <h1 className="text-6xl font-semibold leading-[0.95] tracking-tight sm:text-7xl">
            <span className="text-arc-gradient">JARVIS</span>
          </h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-white/70">
            Your personal AI superagent — voice and text, with a rich British
            composure. He converses, researches, runs analyses, and orchestrates
            multi-step work on your behalf.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Feature icon={<Mic size={15} />} label="Voice & text" />
            <Feature icon={<Sparkles size={15} />} label="Agentic tools" />
            <Feature icon={<Boxes size={15} />} label="Workspaces" />
          </div>

          <div className="mt-10 flex items-center gap-4">
            <Link
              href="/chats"
              className="group inline-flex items-center gap-2 rounded-full bg-arc px-6 py-3 font-medium text-obsidian-950 shadow-glow transition hover:brightness-110"
            >
              Enter the console
              <ArrowRight
                size={18}
                className="transition group-hover:translate-x-0.5"
              />
            </Link>
            <Link
              href="/agent"
              className="rounded-full border border-white/12 px-6 py-3 font-medium text-white/80 transition hover:bg-white/5"
            >
              Meet the Agent
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Right: the manifestation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="relative hidden lg:block"
      >
        <JarvisOrb state="idle" />
      </motion.div>

      {/* Mobile orb behind copy */}
      <div className="pointer-events-none absolute inset-0 -z-0 opacity-40 lg:hidden">
        <JarvisOrb state="idle" use3D={false} />
      </div>
    </main>
  );
}

function Feature({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-sm text-white/75">
      <span className="text-arc">{icon}</span>
      {label}
    </span>
  );
}
