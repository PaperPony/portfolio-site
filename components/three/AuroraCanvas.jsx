"use client";

import dynamic from "next/dynamic";
import { useReducedMotion } from "@/lib/useReducedMotion";

// The aurora shader is browser-only — load it lazily, never on the server. The
// wrapper is absolutely positioned and sized by its parent, so there's no
// layout shift while the bundle loads (just the dark backdrop showing through).
const AuroraScene = dynamic(() => import("@/components/three/AuroraScene"), {
  ssr: false,
  loading: () => null,
});

export default function AuroraCanvas(props) {
  const reducedMotion = useReducedMotion();
  return (
    <div className="pointer-events-none absolute inset-0">
      <AuroraScene reducedMotion={reducedMotion} {...props} />
    </div>
  );
}
