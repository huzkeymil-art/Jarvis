"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { Listener, isSTTSupported } from "@/lib/voice/stt";

/** Press-to-talk mic button. Streams transcripts to the parent. */
export function VoiceButton({
  onPartial,
  onFinal,
  onListening,
}: {
  onPartial: (t: string) => void;
  onFinal: (t: string) => void;
  onListening?: (on: boolean) => void;
}) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const ref = useRef<Listener | null>(null);

  useEffect(() => {
    setSupported(isSTTSupported());
    ref.current = new Listener();
    return () => ref.current?.stop();
  }, []);

  const toggle = () => {
    if (!ref.current) return;
    if (listening) {
      ref.current.stop();
      setListening(false);
      onListening?.(false);
      return;
    }
    setListening(true);
    onListening?.(true);
    ref.current.start({
      onPartial,
      onFinal,
      onError: () => {
        setListening(false);
        onListening?.(false);
      },
      onEnd: () => {
        setListening(false);
        onListening?.(false);
      },
    });
  };

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      title={listening ? "Stop listening" : "Speak to Jarvis"}
      className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition ${
        listening
          ? "border-gold/40 bg-gold/15 text-gold"
          : "border-white/10 bg-white/[0.04] text-white/70 hover:text-white"
      }`}
    >
      {listening && (
        <span className="absolute inset-0 animate-pulse-ring rounded-xl bg-gold/30" />
      )}
      {listening ? <Mic size={18} /> : <MicOff size={18} />}
    </button>
  );
}
