"use client";

import { Component, ReactNode, useMemo } from "react";
import { SplineScene } from "./spline-scene";
import type { OrbState } from "@/lib/types";

/** The interactive Jarvis manifestation — a Spline robot, or a CSS arc-reactor
 *  fallback when the 3D scene can't be reached (e.g. offline). */

const SCENE_URL = "https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode";

class SceneBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

const stateColor: Record<OrbState, string> = {
  idle: "72, 214, 255",
  listening: "255, 207, 110",
  thinking: "126, 227, 255",
  speaking: "72, 214, 255",
};

export function JarvisOrb({
  state = "idle",
  use3D = true,
}: {
  state?: OrbState;
  use3D?: boolean;
}) {
  const color = stateColor[state];
  const active = state !== "idle";

  const reactor = useMemo(
    () => <ReactorFallback color={color} active={active} />,
    [color, active],
  );

  return (
    <div className="relative h-full w-full">
      {/* ambient glow that shifts with state */}
      <div
        className="pointer-events-none absolute inset-0 transition-all duration-700"
        style={{
          background: `radial-gradient(circle at 50% 45%, rgba(${color}, ${
            active ? 0.22 : 0.12
          }), transparent 62%)`,
        }}
      />
      {use3D ? (
        <SceneBoundary fallback={reactor}>
          <SplineScene scene={SCENE_URL} className="h-full w-full" />
        </SceneBoundary>
      ) : (
        reactor
      )}

      {/* HUD rings */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div
          className="hud-ring h-[58%] w-[58%]"
          style={{ borderColor: `rgba(${color}, 0.16)` }}
        />
        <div
          className={`hud-ring h-[74%] w-[74%] ${active ? "animate-[spin_18s_linear_infinite]" : ""}`}
          style={{ borderColor: `rgba(${color}, 0.1)`, borderStyle: "dashed" }}
        />
      </div>
    </div>
  );
}

function ReactorFallback({ color, active }: { color: string; active: boolean }) {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="relative h-44 w-44">
        {active && (
          <span
            className="absolute inset-0 animate-pulse-ring rounded-full"
            style={{ boxShadow: `0 0 60px 10px rgba(${color}, 0.5)` }}
          />
        )}
        <div
          className="absolute inset-2 rounded-full"
          style={{
            background: `conic-gradient(from 0deg, rgba(${color},0.05), rgba(${color},0.55), rgba(${color},0.05))`,
            animation: "spin 6s linear infinite",
          }}
        />
        <div className="absolute inset-6 rounded-full bg-obsidian-950/90 backdrop-blur" />
        <div
          className="absolute inset-[42%] rounded-full"
          style={{
            background: `rgba(${color}, 1)`,
            boxShadow: `0 0 30px 6px rgba(${color}, 0.8)`,
            animation: active ? "float 2.5s ease-in-out infinite" : undefined,
          }}
        />
        <div
          className="absolute inset-12 animate-float rounded-full border"
          style={{ borderColor: `rgba(${color}, 0.4)` }}
        />
      </div>
    </div>
  );
}
