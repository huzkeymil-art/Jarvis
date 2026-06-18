"use client";

import { useEffect, useRef } from "react";
import { useJarvis } from "@/lib/store";
import { useOrb } from "@/components/orb-context";
import { demoReply } from "@/lib/demo";
import { speak, stopSpeaking } from "@/lib/voice/tts";
import { MessageBubble } from "./message-bubble";
import { Composer } from "./composer";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function ChatView({ chatId }: { chatId: string }) {
  const chat = useJarvis((s) => s.chats.find((c) => c.id === chatId));
  const workspaces = useJarvis((s) => s.workspaces);
  const addMessage = useJarvis((s) => s.addMessage);
  const appendToMessage = useJarvis((s) => s.appendToMessage);
  const endStreaming = useJarvis((s) => s.endStreaming);
  const { setOrbState } = useOrb();
  const scrollRef = useRef<HTMLDivElement>(null);
  const busyRef = useRef(false);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [chat?.messages]);

  useEffect(() => () => stopSpeaking(), []);

  if (!chat) return null;

  const workspace = workspaces.find((w) => w.id === chat.workspaceId);

  const afterReply = (assistantId: string) => {
    endStreaming(chatId, assistantId);
    const voice = useJarvis.getState().voice;
    const fresh = useJarvis
      .getState()
      .chats.find((c) => c.id === chatId)
      ?.messages.find((m) => m.id === assistantId);
    if (voice.autoSpeak && fresh?.content) {
      setOrbState("speaking");
      speak(fresh.content, {
        rate: voice.rate,
        pitch: voice.pitch,
        onEnd: () => setOrbState("idle"),
      });
    } else {
      setOrbState("idle");
    }
  };

  const send = async (text: string) => {
    if (busyRef.current) return;
    busyRef.current = true;

    addMessage(chatId, { role: "user", content: text });
    const assistantId = addMessage(chatId, {
      role: "assistant",
      content: "",
      streaming: true,
    });
    setOrbState("thinking");

    const history = (
      useJarvis.getState().chats.find((c) => c.id === chatId)?.messages ?? []
    )
      .filter((m) => m.id !== assistantId && m.content.trim())
      .map((m) => ({ role: m.role, content: m.content }));

    const mode = useJarvis.getState().mode;

    try {
      if (mode === "live") {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: history,
            system: workspace?.systemPrompt,
          }),
        });

        if (!res.ok || !res.body) {
          // 503 (no key) or error → graceful demo fallback
          await streamDemo(text, assistantId);
        } else {
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            appendToMessage(chatId, assistantId, decoder.decode(value));
          }
        }
      } else {
        await streamDemo(text, assistantId);
      }
    } catch {
      appendToMessage(
        chatId,
        assistantId,
        "\n\n[Connection to Jarvis was interrupted.]",
      );
    } finally {
      busyRef.current = false;
      afterReply(assistantId);
    }
  };

  const streamDemo = async (text: string, assistantId: string) => {
    const reply = demoReply(text);
    const words = reply.split(/(\s+)/);
    for (const w of words) {
      appendToMessage(chatId, assistantId, w);
      await sleep(18 + Math.random() * 30);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="scroll-thin flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-5">
          {chat.messages.length === 0 && <EmptyState />}
          {chat.messages.map((m) => (
            <MessageBubble
              key={m.id}
              message={m}
              onSpeakState={(sp) => setOrbState(sp ? "speaking" : "idle")}
            />
          ))}
        </div>
      </div>
      <div className="mx-auto w-full max-w-3xl">
        <Composer
          onSend={send}
          onListening={(on) => setOrbState(on ? "listening" : "idle")}
        />
      </div>
    </div>
  );
}

function EmptyState() {
  const suggestions = [
    "Good evening, Jarvis. Introduce yourself.",
    "Give me a systems status report.",
    "What can the Agent do for me?",
  ];
  const createNothing = () => {};
  return (
    <div className="mx-auto mt-10 max-w-xl text-center">
      <h3 className="text-2xl font-semibold tracking-tight">
        At your service.
      </h3>
      <p className="mt-2 text-white/55">
        Speak or type. I&apos;ll respond in kind — and aloud, if you wish.
      </p>
      <div className="mt-6 flex flex-col gap-2">
        {suggestions.map((s) => (
          <SuggestionPill key={s} text={s} onUse={createNothing} />
        ))}
      </div>
    </div>
  );
}

function SuggestionPill({ text }: { text: string; onUse: () => void }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-2.5 text-sm text-white/65">
      &ldquo;{text}&rdquo;
    </div>
  );
}
