"use client";

import { usePathname } from "next/navigation";
import { ModeToggle } from "./mode-toggle";

const TITLES: Record<string, { title: string; sub: string }> = {
  chats: { title: "Chats", sub: "Converse with Jarvis by voice or text" },
  workspaces: { title: "Workspaces", sub: "Organise your conversations" },
  agent: { title: "Agent", sub: "Hand Jarvis a task and watch him work" },
  settings: { title: "Settings", sub: "Tune Jarvis to your liking" },
};

export function TopBar() {
  const pathname = usePathname();
  const seg = pathname.split("/")[1] || "chats";
  const meta = TITLES[seg] ?? TITLES.chats;

  return (
    <header className="flex items-center justify-between border-b border-white/[0.06] px-6 py-3.5">
      <div>
        <h2 className="text-[15px] font-semibold tracking-tight">{meta.title}</h2>
        <p className="text-xs text-white/45">{meta.sub}</p>
      </div>
      <ModeToggle />
    </header>
  );
}
