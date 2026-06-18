"use client";

import dynamic from "next/dynamic";
import { useReducedMotion } from "@/lib/useReducedMotion";

// The Three.js scene is heavy and browser-only — load it lazily, never on the
// server. The wrapper is absolutely positioned and sized by its parent, so
// there's no layout shift while the bundle loads (just the dark backdrop).
const PaintSplatScene = dynamic(
  () => import("@/components/three/PaintSplatScene"),
  { ssr: false, loading: () => null }
);

export default function PaintSplatCanvas(props) {
  const reducedMotion = useReducedMotion();
  return (
    <div className="pointer-events-none absolute inset-0">
      <PaintSplatScene reducedMotion={reducedMotion} {...props} />
    </div>
  );
}
