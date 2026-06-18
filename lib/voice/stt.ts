"use client";

/** Thin wrapper over the Web Speech API SpeechRecognition (en-GB). */

// Minimal typings for the non-standard SpeechRecognition API.
interface SRAlternative {
  transcript: string;
}
interface SRResult {
  0: SRAlternative;
  isFinal: boolean;
}
interface SREvent {
  resultIndex: number;
  results: { length: number; [i: number]: SRResult };
}
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: SREvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
}

function getCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function isSTTSupported(): boolean {
  return getCtor() !== null;
}

export interface STTHandlers {
  onPartial?: (text: string) => void;
  onFinal?: (text: string) => void;
  onError?: (err: string) => void;
  onEnd?: () => void;
}

export class Listener {
  private rec: SpeechRecognitionLike | null = null;
  private active = false;

  start(handlers: STTHandlers) {
    const Ctor = getCtor();
    if (!Ctor) {
      handlers.onError?.("Speech recognition is not supported in this browser.");
      return;
    }
    const rec = new Ctor();
    rec.lang = "en-GB";
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = (e) => {
      let interim = "";
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        const text = r[0].transcript;
        if (r.isFinal) final += text;
        else interim += text;
      }
      if (interim) handlers.onPartial?.(interim);
      if (final) handlers.onFinal?.(final);
    };
    rec.onerror = (e) => handlers.onError?.(e.error);
    rec.onend = () => {
      this.active = false;
      handlers.onEnd?.();
    };

    this.rec = rec;
    this.active = true;
    rec.start();
  }

  stop() {
    if (this.rec && this.active) {
      this.rec.stop();
      this.active = false;
    }
  }

  get listening() {
    return this.active;
  }
}
