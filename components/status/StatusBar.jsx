"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { getCurrentStatus } from "@/lib/status";

// Map accent keys to the neon palette (Tailwind can't build dynamic class names).
const ACCENT = {
  magenta: "#ff2d95",
  purple: "#9d4edd",
  cobalt: "#3a86ff",
  ember: "#ff5e1a",
  lime: "#aaff00",
};

export default function StatusBar() {
  // Start null so server and first client render match (avoids hydration
  // mismatch from time-dependent content), then fill in on mount.
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const update = () => setStatus(getCurrentStatus(new Date()));
    update();
    const id = setInterval(update, 60 * 1000); // re-check every minute
    return () => clearInterval(id);
  }, []);

  const color = status ? ACCENT[status.accent] ?? ACCENT.cobalt : ACCENT.cobalt;

  return (
    <div className="fixed right-4 top-4 z-50 sm:right-6 sm:top-6">
      <div className="flex items-center gap-3 rounded-full border border-white/10 bg-coal/70 py-2 pl-3 pr-4 backdrop-blur-md">
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
            style={{ backgroundColor: color }}
          />
          <span
            className="relative inline-flex h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: color }}
          />
        </span>
        <AnimatePresence mode="wait">
          <motion.div
            key={status ? status.label + status.detail : "loading"}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
            className="leading-tight"
          >
            <div className="text-xs font-semibold text-bone">
              {status ? status.label : " "}
            </div>
            <div className="text-[10px] text-ash">
              {status ? status.detail : " "}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
