"use client";

/**
 * Text-to-speech for Jarvis.
 * - If the server reports an ElevenLabs key, stream rich British audio from /api/tts.
 * - Otherwise fall back to the browser's built-in en-GB voice.
 */

let currentAudio: HTMLAudioElement | null = null;
let elevenAvailable: boolean | null = null;

async function checkEleven(): Promise<boolean> {
  if (elevenAvailable !== null) return elevenAvailable;
  try {
    const res = await fetch("/api/config", { cache: "no-store" });
    const data = await res.json();
    elevenAvailable = !!data.elevenlabs;
  } catch {
    elevenAvailable = false;
  }
  return elevenAvailable;
}

export function pickBritishVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const prefer = [
    "Daniel",
    "Google UK English Male",
    "Arthur",
    "Oliver",
    "Google UK English Female",
    "Serena",
  ];
  for (const name of prefer) {
    const v = voices.find((vo) => vo.name === name);
    if (v) return v;
  }
  const gb = voices.find((v) => v.lang === "en-GB");
  return gb || voices.find((v) => v.lang.startsWith("en")) || voices[0];
}

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
}

export async function speak(text: string, opts: SpeakOptions = {}): Promise<void> {
  stopSpeaking();
  const clean = text.replace(/[*_`#>]/g, "").trim();
  if (!clean) return;

  if (await checkEleven()) {
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: clean }),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        currentAudio = audio;
        audio.onplay = () => opts.onStart?.();
        audio.onended = () => {
          opts.onEnd?.();
          URL.revokeObjectURL(url);
        };
        audio.onerror = () => {
          opts.onEnd?.();
          URL.revokeObjectURL(url);
        };
        await audio.play();
        return;
      }
    } catch {
      // fall through to browser voice
    }
  }

  browserSpeak(clean, opts);
}

function browserSpeak(text: string, opts: SpeakOptions) {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    opts.onEnd?.();
    return;
  }
  const utter = new SpeechSynthesisUtterance(text);
  const voice = pickBritishVoice();
  if (voice) utter.voice = voice;
  utter.lang = "en-GB";
  utter.rate = opts.rate ?? 0.98;
  utter.pitch = opts.pitch ?? 0.92;
  utter.onstart = () => opts.onStart?.();
  utter.onend = () => opts.onEnd?.();
  utter.onerror = () => opts.onEnd?.();
  window.speechSynthesis.speak(utter);
}

export function stopSpeaking() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

// Warm up voice list (some browsers populate asynchronously).
if (typeof window !== "undefined" && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {
    /* voices now available */
  };
}
