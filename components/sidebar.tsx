"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessagesSquare,
  Boxes,
  Bot,
  Settings,
  Plus,
} from "lucide-react";
import { JarvisOrb } from "./jarvis-orb";
import { useOrb } from "./orb-context";
import { useJarvis } from "@/lib/store";

const NAV = [
  { href: "/chats", label: "Chats", icon: MessagesSquare },
  { href: "/workspaces", label: "Workspaces", icon: Boxes },
  { href: "/agent", label: "Agent", icon: Bot },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { orbState } = useOrb();
  const createChat = useJarvis((s) => s.createChat);

  return (
    <aside className="flex w-[248px] shrink-0 flex-col border-r border-white/[0.06] glass-strong">
      {/* Persistent orb */}
      <div className="relative h-[180px] shrink-0 overflow-hidden border-b border-white/[0.06]">
        <JarvisOrb state={orbState} />
        <div className="pointer-events-none absolute bottom-3 left-4">
          <div className="text-[11px] uppercase tracking-[0.2em] text-white/40">
            Jarvis
          </div>
          <div className="text-xs capitalize text-arc/90">{orbState}</div>
        </div>
      </div>

      <div className="px-3 pt-4">
        <Link
          href="/chats"
          onClick={() => createChat()}
          className="flex items-center justify-center gap-2 rounded-xl bg-arc/90 py-2.5 text-sm font-medium text-obsidian-950 transition hover:brightness-110"
        >
          <Plus size={16} /> New conversation
        </Link>
      </div>

      <nav className="mt-4 flex flex-col gap-1 px-3">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                active
                  ? "bg-white/[0.07] text-white shadow-glow"
                  : "text-white/60 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              <Icon
                size={18}
                className={active ? "text-arc" : "text-white/50"}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-4 py-4 text-[11px] leading-relaxed text-white/30">
        Tony Stark would approve.
        <br />
        Powered by Claude.
      </div>
    </aside>
  );
}
