"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Chat, Message, Workspace, AppMode } from "./types";

const uid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const now = () => Date.now();

// SSR-safe storage: no-ops on the server, real localStorage in the browser.
const safeStorage = createJSONStorage(() => {
  if (typeof window === "undefined") {
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
  }
  return window.localStorage;
});

interface VoiceSettings {
  /** auto-speak Jarvis replies aloud */
  autoSpeak: boolean;
  rate: number;
  pitch: number;
}

interface JarvisState {
  // ── settings ──
  mode: AppMode;
  voice: VoiceSettings;
  personaName: string;
  setMode: (m: AppMode) => void;
  setVoice: (v: Partial<VoiceSettings>) => void;

  // ── chats ──
  chats: Chat[];
  activeChatId: string | null;
  createChat: (workspaceId?: string | null) => string;
  deleteChat: (id: string) => void;
  setActiveChat: (id: string | null) => void;
  renameChat: (id: string, title: string) => void;
  addMessage: (chatId: string, msg: Omit<Message, "id" | "createdAt">) => string;
  appendToMessage: (chatId: string, msgId: string, delta: string) => void;
  endStreaming: (chatId: string, msgId: string) => void;

  // ── workspaces ──
  workspaces: Workspace[];
  createWorkspace: (w: Omit<Workspace, "id" | "createdAt">) => string;
  updateWorkspace: (id: string, patch: Partial<Workspace>) => void;
  deleteWorkspace: (id: string) => void;
}

const seedWorkspaces: Workspace[] = [
  {
    id: "ws-personal",
    name: "Personal",
    description: "Everyday conversations and quick questions.",
    icon: "User",
    color: "#48d6ff",
    createdAt: now(),
  },
  {
    id: "ws-research",
    name: "Research Lab",
    description: "Deep dives, sources, and analysis.",
    icon: "FlaskConical",
    color: "#ffcf6e",
    createdAt: now(),
  },
];

export const useJarvis = create<JarvisState>()(
  persist(
    (set, get) => ({
      mode: "demo",
      voice: { autoSpeak: false, rate: 0.98, pitch: 0.92 },
      personaName: "Jarvis",
      setMode: (mode) => set({ mode }),
      setVoice: (v) => set({ voice: { ...get().voice, ...v } }),

      chats: [],
      activeChatId: null,
      createChat: (workspaceId = null) => {
        const id = uid();
        const chat: Chat = {
          id,
          title: "New conversation",
          messages: [],
          workspaceId,
          createdAt: now(),
          updatedAt: now(),
        };
        set({ chats: [chat, ...get().chats], activeChatId: id });
        return id;
      },
      deleteChat: (id) =>
        set({
          chats: get().chats.filter((c) => c.id !== id),
          activeChatId: get().activeChatId === id ? null : get().activeChatId,
        }),
      setActiveChat: (id) => set({ activeChatId: id }),
      renameChat: (id, title) =>
        set({
          chats: get().chats.map((c) =>
            c.id === id ? { ...c, title, updatedAt: now() } : c,
          ),
        }),
      addMessage: (chatId, msg) => {
        const id = uid();
        const full: Message = { ...msg, id, createdAt: now() };
        set({
          chats: get().chats.map((c) => {
            if (c.id !== chatId) return c;
            const isFirstUser =
              msg.role === "user" && c.messages.length === 0;
            return {
              ...c,
              title: isFirstUser ? deriveTitle(msg.content) : c.title,
              messages: [...c.messages, full],
              updatedAt: now(),
            };
          }),
        });
        return id;
      },
      appendToMessage: (chatId, msgId, delta) =>
        set({
          chats: get().chats.map((c) =>
            c.id === chatId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === msgId ? { ...m, content: m.content + delta } : m,
                  ),
                  updatedAt: now(),
                }
              : c,
          ),
        }),
      endStreaming: (chatId, msgId) =>
        set({
          chats: get().chats.map((c) =>
            c.id === chatId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === msgId ? { ...m, streaming: false } : m,
                  ),
                }
              : c,
          ),
        }),

      workspaces: seedWorkspaces,
      createWorkspace: (w) => {
        const id = uid();
        set({ workspaces: [...get().workspaces, { ...w, id, createdAt: now() }] });
        return id;
      },
      updateWorkspace: (id, patch) =>
        set({
          workspaces: get().workspaces.map((w) =>
            w.id === id ? { ...w, ...patch } : w,
          ),
        }),
      deleteWorkspace: (id) =>
        set({
          workspaces: get().workspaces.filter((w) => w.id !== id),
          chats: get().chats.map((c) =>
            c.workspaceId === id ? { ...c, workspaceId: null } : c,
          ),
        }),
    }),
    {
      name: "jarvis-store",
      storage: safeStorage,
      partialize: (s) => ({
        mode: s.mode,
        voice: s.voice,
        personaName: s.personaName,
        chats: s.chats,
        workspaces: s.workspaces,
        activeChatId: s.activeChatId,
      }),
    },
  ),
);

function deriveTitle(text: string): string {
  const clean = text.trim().replace(/\s+/g, " ");
  return clean.length > 42 ? clean.slice(0, 42) + "…" : clean || "New conversation";
}
