"use client";

import { useRef, useState } from "react";
import { SendHorizonal } from "lucide-react";
import { VoiceButton } from "./voice-button";

export function Composer({
  onSend,
  onListening,
  disabled,
}: {
  onSend: (text: string) => void;
  onListening?: (on: boolean) => void;
  disabled?: boolean;
}) {
  const [value, setValue] = useState("");
  const baseRef = useRef("");
  const taRef = useRef<HTMLTextAreaElement>(null);

  const submit = () => {
    const text = value.trim();
    if (!text || disabled) return;
    onSend(text);
    setValue("");
    baseRef.current = "";
    if (taRef.current) taRef.current.style.height = "auto";
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const grow = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  };

  return (
    <div className="flex items-end gap-2.5 p-4">
      <VoiceButton
        onListening={onListening}
        onPartial={(t) => setValue((baseRef.current + " " + t).trim())}
        onFinal={(t) => {
          baseRef.current = (baseRef.current + " " + t).trim();
          setValue(baseRef.current);
        }}
      />
      <div className="flex flex-1 items-end rounded-2xl glass px-4 py-2.5">
        <textarea
          ref={taRef}
          value={value}
          rows={1}
          onChange={(e) => {
            baseRef.current = e.target.value;
            setValue(e.target.value);
            grow(e.target);
          }}
          onKeyDown={onKeyDown}
          placeholder="Ask Jarvis anything… (Enter to send, Shift+Enter for a new line)"
          className="max-h-40 flex-1 resize-none bg-transparent text-[15px] leading-relaxed text-white placeholder:text-white/35 focus:outline-none"
        />
      </div>
      <button
        onClick={submit}
        disabled={disabled || !value.trim()}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-arc text-obsidian-950 transition enabled:hover:brightness-110 disabled:opacity-40"
      >
        <SendHorizonal size={18} />
      </button>
    </div>
  );
}
