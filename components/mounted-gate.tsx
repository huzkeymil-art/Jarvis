"use client";

import { useEffect, useState, ReactNode } from "react";

/** Avoids SSR/CSR mismatch for components that read the persisted store. */
export function MountedGate({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <span className="loader" />
      </div>
    );
  }
  return <>{children}</>;
}
