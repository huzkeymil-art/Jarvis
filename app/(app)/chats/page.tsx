"use client";

import { useJarvis } from "@/lib/store";
import { ChatView } from "@/components/chat/chat-view";
import { Plus, MessageSquare, Trash2 } from "lucide-react";

export default function ChatsPage() {
  const chats = useJarvis((s) => s.chats);
  const activeChatId = useJarvis((s) => s.activeChatId);
  const setActiveChat = useJarvis((s) => s.setActiveChat);
  const createChat = useJarvis((s) => s.createChat);
  const deleteChat = useJarvis((s) => s.deleteChat);
  const workspaces = useJarvis((s) => s.workspaces);

  const active = chats.find((c) => c.id === activeChatId) ?? chats[0];

  return (
    <div className="flex h-full">
      {/* Conversation list */}
      <div className="flex w-[270px] shrink-0 flex-col border-r border-white/[0.06]">
        <div className="p-3">
          <button
            onClick={() => createChat()}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] py-2.5 text-sm text-white/80 transition hover:bg-white/[0.07]"
          >
            <Plus size={16} /> New conversation
          </button>
        </div>
        <div className="scroll-thin flex-1 overflow-y-auto px-2 pb-3">
          {chats.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-white/40">
              No conversations yet.
            </p>
          )}
          {chats.map((c) => {
            const ws = workspaces.find((w) => w.id === c.workspaceId);
            const isActive = c.id === active?.id;
            return (
              <div
                key={c.id}
                onClick={() => setActiveChat(c.id)}
                className={`group mb-1 flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 transition ${
                  isActive
                    ? "bg-white/[0.07]"
                    : "hover:bg-white/[0.04]"
                }`}
              >
                <MessageSquare
                  size={15}
                  className={isActive ? "text-arc" : "text-white/40"}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm text-white/85">{c.title}</div>
                  {ws && (
                    <div
                      className="truncate text-[11px]"
                      style={{ color: ws.color }}
                    >
                      {ws.name}
                    </div>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteChat(c.id);
                  }}
                  className="opacity-0 transition group-hover:opacity-100 hover:text-red-400"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active chat */}
      <div className="min-w-0 flex-1">
        {active ? (
          <ChatView key={active.id} chatId={active.id} />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <p className="max-w-sm text-white/55">
              Begin a conversation with Jarvis. He&apos;s waiting.
            </p>
            <button
              onClick={() => createChat()}
              className="rounded-full bg-arc px-6 py-2.5 font-medium text-obsidian-950 shadow-glow transition hover:brightness-110"
            >
              Start talking
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
