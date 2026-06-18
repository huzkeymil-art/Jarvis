"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import type { OrbState } from "@/lib/types";

interface OrbCtx {
  orbState: OrbState;
  setOrbState: (s: OrbState) => void;
}

const Ctx = createContext<OrbCtx>({ orbState: "idle", setOrbState: () => {} });

export function OrbProvider({ children }: { children: ReactNode }) {
  const [orbState, setOrbState] = useState<OrbState>("idle");
  return <Ctx.Provider value={{ orbState, setOrbState }}>{children}</Ctx.Provider>;
}

export const useOrb = () => useContext(Ctx);
