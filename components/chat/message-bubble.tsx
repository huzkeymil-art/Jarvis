"use client";

import { useState } from "react";
import { Volume2, Square, Copy, Check } from "lucide-react";
import { motion } from "framer-motion";
import type { Message } from "@/lib/types";
import { speak, stopSpeaking } from "@/lib/voice/tts";
import { useJarvis } from "@/lib/store";

export function MessageBubble({
  message,
  onSpeakState,
}: {
  message: Message;
  onSpeakState?: (speaking: boolean) => void;
}) {
  const isUser = message.role === "user";
  const [speaking, setSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);
  const voice = useJarvis((s) => s.voice);

  const toggleSpeak = () => {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      onSpeakState?.(false);
      return;
    }
    setSpeaking(true);
    onSpeakState?.(true);
    speak(message.content, {
      rate: voice.rate,
      pitch: voice.pitch,
      onEnd: () => {
        setSpeaking(false);
        onSpeakState?.(false);
      },
    });
  };

  const copy = () => {
    navigator.clipboard?.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div className={`group max-w-[75%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`whitespace-pre-wrap rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${
            isUser
              ? "bg-arc/15 text-white"
              : "glass text-white/90"
          } ${message.streaming ? "caret" : ""}`}
        >
          {message.content ||
            (message.streaming ? "" : <span className="opacity-50">…</span>)}
        </div>

        {!isUser && message.content && (
          <div className="mt-1.5 flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
            <button
              onClick={toggleSpeak}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-white/55 hover:bg-white/5 hover:text-arc"
            >
              {speaking ? <Square size={13} /> : <Volume2 size={13} />}
              {speaking ? "Stop" : "Speak"}
            </button>
            <button
              onClick={copy}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-white/55 hover:bg-white/5 hover:text-white"
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
