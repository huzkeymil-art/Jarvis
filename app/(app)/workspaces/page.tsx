"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, MessageSquarePlus, Trash2, X } from "lucide-react";
import { useJarvis } from "@/lib/store";
import {
  WorkspaceIcon,
  WORKSPACE_ICONS,
} from "@/components/workspaces/workspace-icon";

const COLORS = ["#48d6ff", "#ffcf6e", "#9d8bff", "#5eead4", "#fb7185", "#a3e635"];

export default function WorkspacesPage() {
  const router = useRouter();
  const workspaces = useJarvis((s) => s.workspaces);
  const chats = useJarvis((s) => s.chats);
  const createChat = useJarvis((s) => s.createChat);
  const createWorkspace = useJarvis((s) => s.createWorkspace);
  const deleteWorkspace = useJarvis((s) => s.deleteWorkspace);
  const [creating, setCreating] = useState(false);

  const openInWorkspace = (id: string) => {
    createChat(id);
    router.push("/chats");
  };

  return (
    <div className="scroll-thin h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((ws, i) => {
            const count = chats.filter((c) => c.workspaceId === ws.id).length;
            return (
              <motion.div
                key={ws.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="group relative flex flex-col rounded-2xl glass p-5"
              >
                <div className="flex items-start justify-between">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{
                      background: `${ws.color}1f`,
                      color: ws.color,
                      boxShadow: `0 0 26px -8px ${ws.color}`,
                    }}
                  >
                    <WorkspaceIcon name={ws.icon} />
                  </div>
                  <button
                    onClick={() => deleteWorkspace(ws.id)}
                    className="opacity-0 transition group-hover:opacity-100 hover:text-red-400"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <h3 className="mt-4 text-lg font-semibold tracking-tight">
                  {ws.name}
                </h3>
                <p className="mt-1 flex-1 text-sm leading-relaxed text-white/55">
                  {ws.description}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-white/40">
                    {count} conversation{count === 1 ? "" : "s"}
                  </span>
                  <button
                    onClick={() => openInWorkspace(ws.id)}
                    className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-arc transition hover:bg-arc/10"
                  >
                    <MessageSquarePlus size={15} /> New chat
                  </button>
                </div>
              </motion.div>
            );
          })}

          {/* Add card */}
          <button
            onClick={() => setCreating(true)}
            className="flex min-h-[190px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/12 text-white/45 transition hover:border-arc/40 hover:text-arc"
          >
            <Plus size={24} />
            <span className="text-sm">Create workspace</span>
          </button>
        </div>
      </div>

      {creating && (
        <CreateModal
          onClose={() => setCreating(false)}
          onCreate={(data) => {
            createWorkspace(data);
            setCreating(false);
          }}
        />
      )}
    </div>
  );
}

function CreateModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (data: {
    name: string;
    description: string;
    icon: string;
    color: string;
    systemPrompt?: string;
  }) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [icon, setIcon] = useState(WORKSPACE_ICONS[0]);
  const [color, setColor] = useState(COLORS[0]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl glass-strong p-6"
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-semibold">New workspace</h3>
          <button onClick={onClose} className="text-white/50 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <label className="mb-1 block text-xs text-white/50">Name</label>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Product Strategy"
          className="mb-4 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm focus:border-arc/40 focus:outline-none"
        />

        <label className="mb-1 block text-xs text-white/50">Description</label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What lives here?"
          className="mb-4 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm focus:border-arc/40 focus:outline-none"
        />

        <label className="mb-1 block text-xs text-white/50">
          Custom instructions (optional)
        </label>
        <textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          placeholder="How should Jarvis behave in this workspace?"
          rows={2}
          className="mb-4 w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm focus:border-arc/40 focus:outline-none"
        />

        <label className="mb-2 block text-xs text-white/50">Icon</label>
        <div className="mb-4 flex flex-wrap gap-2">
          {WORKSPACE_ICONS.map((ic) => (
            <button
              key={ic}
              onClick={() => setIcon(ic)}
              className={`flex h-10 w-10 items-center justify-center rounded-xl border transition ${
                icon === ic
                  ? "border-arc/50 bg-arc/10 text-arc"
                  : "border-white/10 text-white/55 hover:text-white"
              }`}
            >
              <WorkspaceIcon name={ic} size={18} />
            </button>
          ))}
        </div>

        <label className="mb-2 block text-xs text-white/50">Colour</label>
        <div className="mb-6 flex gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className="h-8 w-8 rounded-full transition"
              style={{
                background: c,
                outline: color === c ? `2px solid white` : "none",
                outlineOffset: 2,
              }}
            />
          ))}
        </div>

        <button
          disabled={!name.trim()}
          onClick={() =>
            onCreate({
              name: name.trim(),
              description: description.trim() || "A fresh workspace.",
              icon,
              color,
              systemPrompt: systemPrompt.trim() || undefined,
            })
          }
          className="w-full rounded-xl bg-arc py-3 font-medium text-obsidian-950 transition enabled:hover:brightness-110 disabled:opacity-40"
        >
          Create workspace
        </button>
      </motion.div>
    </div>
  );
}
