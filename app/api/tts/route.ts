export const runtime = "nodejs";
export const maxDuration = 30;

/** Default: a deep, articulate British male voice ("George"). */
const DEFAULT_VOICE = process.env.ELEVENLABS_VOICE_ID || "JBFqnCBsd6RMkjVDRZzb";

/**
 * Proxies text to ElevenLabs and returns audio/mpeg.
 * Returns 503 when no key is set so the client uses the browser voice.
 */
export async function POST(req: Request) {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) {
    return new Response("No ELEVENLABS_API_KEY configured.", { status: 503 });
  }

  let body: { text?: string };
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON.", { status: 400 });
  }
  const text = (body.text ?? "").slice(0, 2500).trim();
  if (!text) return new Response("No text.", { status: 400 });

  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${DEFAULT_VOICE}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": key,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_turbo_v2_5",
          voice_settings: {
            stability: 0.45,
            similarity_boost: 0.8,
            style: 0.25,
            use_speaker_boost: true,
          },
        }),
      },
    );

    if (!res.ok) {
      const detail = await res.text();
      return new Response(`ElevenLabs error: ${detail}`, { status: 502 });
    }

    return new Response(res.body, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "TTS request failed.";
    return new Response(msg, { status: 502 });
  }
}
