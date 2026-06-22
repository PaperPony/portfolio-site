"use client";

import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useTransform,
} from "motion/react";
import { usePointerPosition } from "motion-plus/react";
import { useReducedMotion } from "@/lib/useReducedMotion";

/*
 * Aurora cursor trail. Adapted from Motion's cursor-trail example
 * (motion.dev/examples/react-cursor-trail): instead of dropping images along
 * the pointer path, it drops faint, heavily-blurred neon puffs that bloom in
 * and fade out, cycling the same palette as the hero aurora. Screen blend over
 * the dark page makes them read as soft light rather than solid discs — present
 * enough to notice, quiet enough not to fight the content.
 */

// Neon palette, kept in sync with the aurora shader / Tailwind tokens.
const COLORS = ["#aaff00", "#3a86ff", "#9d4edd", "#ff2d95", "#ff5e1a"];

const BLOB_SIZE = 210; // diameter of each puff before blur (px)
const SPAWN_DISTANCE = 80; // cursor travel between spawns (px)
const FADE_DURATION = 1.5; // seconds a puff lingers before removal
const PEAK_OPACITY = 0.3; // faint, but visible against the dark page

export default function CursorTrail() {
  const reducedMotion = useReducedMotion();

  const colorIndex = useRef(0);
  const idCounter = useRef(0);
  const distance = useRef(0);
  const [blobs, setBlobs] = useState([]);

  const pointer = usePointerPosition();
  const pointerDistance = useTransform(() => {
    const x = pointer.x.get();
    const y = pointer.y.get();
    const dx = x - (pointer.x.getPrevious() ?? x);
    const dy = y - (pointer.y.getPrevious() ?? y);
    return Math.sqrt(dx * dx + dy * dy);
  });

  useMotionValueEvent(pointerDistance, "change", (latest) => {
    if (reducedMotion) return;
    distance.current += latest;
    if (distance.current >= SPAWN_DISTANCE) {
      spawn(pointer.x.get(), pointer.y.get());
      distance.current = 0;
    }
  });

  const spawn = (x, y) => {
    const id = idCounter.current++;
    const color = COLORS[colorIndex.current];
    colorIndex.current = (colorIndex.current + 1) % COLORS.length;

    setBlobs((prev) => [...prev, { id, x, y, color }]);
    // Drop it from state once it has finished fading (matches exit duration).
    setTimeout(() => {
      setBlobs((prev) => prev.filter((b) => b.id !== id));
    }, FADE_DURATION * 1000);
  };

  // No trail for reduced-motion users.
  if (reducedMotion) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-30 overflow-hidden mix-blend-screen"
    >
      <AnimatePresence>
        {blobs.map((b) => (
          <motion.div
            key={b.id}
            className="absolute rounded-full blur-3xl"
            style={{
              left: b.x - BLOB_SIZE / 2,
              top: b.y - BLOB_SIZE / 2,
              width: BLOB_SIZE,
              height: BLOB_SIZE,
              background: `radial-gradient(circle, ${b.color} 0%, transparent 70%)`,
              willChange: "opacity, transform",
            }}
            initial={{ opacity: 0, scale: 0.55 }}
            animate={{ opacity: PEAK_OPACITY, scale: 1 }}
            exit={{ opacity: 0, scale: 1.25 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
