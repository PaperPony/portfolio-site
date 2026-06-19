"use client";

import { useEffect, useRef, useState } from "react";
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
  const ref = useRef(null);
  // Whether the hero is on-screen. While it's scrolled away, the shader stops
  // rendering entirely (see AuroraScene's demand-mode driver), so scrolling the
  // rest of the page doesn't fight the GPU.
  const [active, setActive] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { rootMargin: "100px" } // resume just before it scrolls back into view
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="pointer-events-none absolute inset-0">
      <AuroraScene reducedMotion={reducedMotion} active={active} {...props} />
    </div>
  );
}
