/**
 * Demo mode — scripted, cinematic Jarvis responses so the entire app is
 * explorable with no API key. Streamed token-by-token on the client to mimic
 * the live experience.
 */

const OPENERS = [
  "Of course.",
  "Right away.",
  "Consider it handled.",
  "A fine question.",
  "At your service.",
  "Naturally.",
];

function opener() {
  return OPENERS[Math.floor(Math.random() * OPENERS.length)];
}

export function demoReply(userText: string): string {
  const t = userText.trim().toLowerCase();

  if (/\b(hi|hello|hey|good (morning|evening|afternoon))\b/.test(t)) {
    return `${opener()} Good to see you. Jarvis online and standing by — voice, text, and the full agent suite are at your disposal. How shall we begin?`;
  }
  if (/\b(who are you|what are you|your name)\b/.test(t)) {
    return `I am Jarvis — your personal artificial intelligence, in the spirit of a certain Mr. Stark's assistant. I converse, I research, I run analyses, and I coordinate multi-step work on your behalf. Think of me as the calm voice in the room that has already read the manual.`;
  }
  if (/\b(status|systems? check|how are you)\b/.test(t)) {
    return `Systems nominal, sir. All subsystems online, latency negligible, and my disposition as agreeable as ever. Currently running in demonstration mode — provide an Anthropic API key and switch to Live, and I shall think with my full faculties.`;
  }
  if (/\b(voice|accent|british|speak|talk)\b/.test(t)) {
    return `You'll find my diction rather more polished than the average assistant. By default I speak through your browser's en-GB voice; supply an ElevenLabs key and I'll upgrade to something altogether richer. Tap the speaker on any of my replies to hear me.`;
  }
  if (/\b(agent|task|tool|research|search|code)\b/.test(t)) {
    return `The Agent console is where I roll up my sleeves. Hand me an objective and I'll plan it, reach for tools — web search, page fetching, code execution, and a few local utilities — and report each step as I go. You'll see the whole chain of work unfold in the timeline.`;
  }
  if (/\b(thanks|thank you|cheers)\b/.test(t)) {
    return `A pleasure, as always. Do let me know if there's anything further — I'm rarely busy and never bored.`;
  }

  return `${opener()} ${capitalize(
    userText.trim(),
  )} — an excellent place to begin. In demonstration mode I'm working from a rehearsed script, so do connect a live key when you'd like my full reasoning. In the meantime: I'd approach this by first clarifying the objective, then gathering what's known, and finally proposing a clean course of action. Shall I elaborate on any of those?`;
}

function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Scripted agent run for demo mode — a believable multi-step trace. */
export function demoAgentSteps(prompt: string): {
  kind: "thinking" | "tool_use" | "tool_result" | "text";
  name?: string;
  content: string;
  input?: unknown;
}[] {
  return [
    {
      kind: "thinking",
      content: `Understood. Breaking "${prompt}" into objectives, then selecting the right tools for each.`,
    },
    {
      kind: "tool_use",
      name: "web_search",
      content: `Searching the web for current information.`,
      input: { query: prompt },
    },
    {
      kind: "tool_result",
      name: "web_search",
      content: `Returned 5 promising sources. Cross-referencing the two most reputable.`,
    },
    {
      kind: "tool_use",
      name: "code_execution",
      content: `Running a short analysis to verify the figures.`,
      input: { language: "python" },
    },
    {
      kind: "tool_result",
      name: "code_execution",
      content: `Computation complete. Numbers reconcile with the sources.`,
    },
    {
      kind: "text",
      content: `Here is my summary, ${"sir"}. In Live mode this would be grounded in real, current results; in demonstration mode it's a rehearsal of the workflow. The objective — "${prompt}" — decomposes cleanly, the research corroborates the key facts, and the analysis holds. I'd suggest we proceed with the recommended course. Connect a live key whenever you'd like me to do this for real.`,
    },
  ];
}
