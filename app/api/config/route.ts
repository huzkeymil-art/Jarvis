import { NextResponse } from "next/server";

export const runtime = "nodejs";

/** Reports which capabilities are wired (without ever exposing the keys). */
export async function GET() {
  return NextResponse.json({
    anthropic: !!process.env.ANTHROPIC_API_KEY,
    elevenlabs: !!process.env.ELEVENLABS_API_KEY,
  });
}
