# JARVIS — Voice + Text Agentic AI Superagent

A cinematic, fully-functional **voice and text agentic AI superagent named
"Jarvis"** — in the spirit of Tony Stark's J.A.R.V.I.S. — with a rich British
composure, an interactive 3D manifestation, and three product surfaces:
**Chats**, **Workspaces**, and **Agent**.

Built with Next.js 16 + React 19, Tailwind, framer-motion, Spline, and the
Claude API (`claude-opus-4-8`).

## ▶️ Live preview

**One-click deploy** (free Vercel tier — Demo mode works with zero config):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fhuzkeymil-art%2FJarvis%2Ftree%2Fclaude%2Fjarvis-voice-ai-agent-betxbn&env=ANTHROPIC_API_KEY,ELEVENLABS_API_KEY&envDescription=Both%20optional%20%E2%80%94%20leave%20blank%20for%20Demo%20mode%3B%20add%20a%20Claude%20key%20for%20Live&envLink=https%3A%2F%2Fgithub.com%2Fhuzkeymil-art%2FJarvis%2Fblob%2Fclaude%2Fjarvis-voice-ai-agent-betxbn%2F.env.example&project-name=jarvis)

The deploy flow asks for two **optional** env vars — leave them blank to launch
in Demo mode, or add `ANTHROPIC_API_KEY` (Live brain) and `ELEVENLABS_API_KEY`
(rich British voice). You can also add or change them later in Vercel →
Project → Settings → Environment Variables.

> Prefer to wire up your own Vercel project? Import the repo at
> <https://vercel.com/new>, select the `claude/jarvis-voice-ai-agent-betxbn`
> branch, and deploy — Next.js is auto-detected, no settings needed.

Or run it locally in ~1 minute — see **Getting started** below.

## ✨ Features

- **Cinematic UI** — obsidian + arc-reactor theme, glassmorphism, HUD rings,
  SF Pro typography, smooth motion.
- **Interactive Jarvis orb** — a Spline 3D manifestation that reacts to state
  (idle / listening / thinking / speaking), with a CSS arc-reactor fallback
  when offline.
- **Voice** — speak to Jarvis (Web Speech recognition, en-GB) and hear him
  reply. Rich **ElevenLabs** British voice when a key is present; otherwise the
  browser's built-in en-GB voice.
- **Chats** — streaming conversations, voice in/out, per-message speak & copy,
  persisted locally.
- **Workspaces** — organise conversations, each with its own icon, colour, and
  optional custom instructions.
- **Agent** — hand Jarvis a task and watch a live timeline: thinking, web
  search/browse, code execution, and custom local tools.
- **Demo / Live toggle** — fully explorable with **no API key** (scripted
  cinematic responses); flip to Live for the real Claude.

## 🚀 Getting started

```bash
npm install
cp .env.example .env.local   # optional — add keys to go Live
npm run dev
```

Open <http://localhost:3000>.

Everything works out of the box in **Demo mode**. To go **Live**, add your keys
to `.env.local`:

```bash
ANTHROPIC_API_KEY=sk-ant-...     # the brain (required for Live mode)
ELEVENLABS_API_KEY=...           # optional — the rich British voice
# ELEVENLABS_VOICE_ID=...        # optional — override the default voice
# JARVIS_MODEL=claude-opus-4-8   # optional — override the model
```

Then toggle **Live** in the top bar (or Settings).

## 🧠 How it works

| Piece | Where |
|---|---|
| Streaming chat (Claude) | `app/api/chat/route.ts` |
| Agentic loop + tools (web search/fetch, code execution, local tools) | `app/api/agent/route.ts` |
| ElevenLabs TTS proxy | `app/api/tts/route.ts` |
| Capability flags | `app/api/config/route.ts` |
| Jarvis persona & model | `lib/anthropic.ts` |
| Demo scripts | `lib/demo.ts` |
| Voice (TTS/STT) | `lib/voice/*` |
| State (chats, workspaces, settings) | `lib/store.ts` (Zustand + localStorage) |
| The Spline manifestation | `components/spline-scene.tsx` → `components/jarvis-orb.tsx` |

## 🎙️ A note on voice

- **Browser voice** is the zero-cost default. Quality varies by browser/OS —
  best in Chrome on macOS/Windows.
- **ElevenLabs** gives the truly rich, cinematic British accent. It activates
  automatically the moment `ELEVENLABS_API_KEY` is present — no code changes.
- **Speech recognition** (mic input) uses the Web Speech API and works best in
  Chromium-based browsers.

## 🔤 Fonts

SF Pro is Apple-licensed and not bundled. The app uses a system-first font
stack (true SF Pro on Apple devices) and will pick up self-hosted SF Pro
`.woff2` files if you add them — see `public/fonts/README.md`.

## 📦 Stack

Next.js 15 · React 19 · TypeScript · Tailwind CSS · framer-motion · Zustand ·
@splinetool/react-spline · @anthropic-ai/sdk · lucide-react

---

_Tony Stark would approve. Powered by Claude._
