"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  stagger,
  useMotionValue,
  useMotionValueEvent,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { ScrambleText } from "motion-plus/react";
import { projects } from "@/content/projects";
import { useReducedMotion } from "@/lib/useReducedMotion";
import ProjectCard from "@/components/portfolio/ProjectCard";

// Adapted from Motion's "scroll velocity: 3D planes" example (motion.dev/examples/react-scroll-velocity-linked-offset).

const ACCENT = {
  magenta: "#ff2d95",
  purple: "#9d4edd",
  cobalt: "#3a86ff",
  ember: "#ff5e1a",
  lime: "#aaff00",
};

const PLANE_W = 300;
const PLANE_H = 380;
const STEP = 320; // horizontal spacing between plane origins

const scrambleChars = "!@#$%^&*()_+-=[]{}|;:,.<>?/~`░▒▓█▀▄■□▪▫●○◆◇◈◊※†‡";

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

function Plane({ index, project, scrollX, scrollVelocity, reducedMotion, isHovered, onHoverStart, onHoverEnd, onSelect }) {
  const startPosition = index * STEP;
  const hoverOffset = useSpring(0, { stiffness: 400, damping: 25 });
  const waveOffset = useSpring(0, { stiffness: 300, damping: 20, mass: 0.3 });
  const color = ACCENT[project.accent] ?? ACCENT.cobalt;

  useMotionValueEvent(scrollVelocity, "change", (velocity) => {
    if (reducedMotion) return;
    const pos = startPosition + scrollX.get();
    const normalized = pos / (STEP * projects.length);
    const phase = Math.sin(normalized * Math.PI * 2);
    waveOffset.set((velocity / 50) * phase * 5);
  });

  useEffect(() => {
    hoverOffset.set(isHovered ? -28 : 0);
  }, [isHovered, hoverOffset]);

  // pos === 0 means this plane is centred; positive recedes to the right.
  const transform = useTransform(() => {
    const pos = startPosition + scrollX.get();
    const y = pos * -0.3 + waveOffset.get() + hoverOffset.get();
    const z = pos * -1.0;
    return `translate3d(${pos}px, ${y}px, ${z}px) rotateY(-45deg)`;
  });

  return (
    <motion.div
      className="absolute flex cursor-pointer select-none items-center justify-center rounded-xl shadow-2xl outline-none"
      style={{
        width: PLANE_W,
        height: PLANE_H,
        transformStyle: "preserve-3d",
        transform,
        zIndex: isHovered ? 100 : 1,
        filter: isHovered ? "brightness(1.12)" : "brightness(0.92)",
        transition: "filter 0.2s ease",
      }}
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`${project.title} — open details`}
    >
      <span
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px"
        style={{ backgroundColor: color, boxShadow: `0 0 16px ${color}`, opacity: isHovered ? 1 : 0.6 }}
      />
      <div className="absolute inset-0 overflow-hidden rounded-xl border border-white/10 bg-slate2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={project.image}
          alt={project.title}
          draggable={false}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="pointer-events-none absolute -top-6 left-0 font-mono text-[10px] tracking-widest text-ash">
        {String(index + 1).padStart(2, "0")}
      </div>

      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="pointer-events-none absolute left-full top-1/2 ml-3 flex items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <motion.div
              className="h-px w-24 origin-left"
              style={{ backgroundColor: color }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              exit={{ scaleX: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
            <div className="whitespace-nowrap px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-bone">
              <ScrambleText active={isHovered} duration={stagger(0.05)} chars={scrambleChars}>
                {project.title}
              </ScrambleText>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function ProjectCarousel() {
  const reducedMotion = useReducedMotion();
  const maxScroll = (projects.length - 1) * STEP;
  // Centre the group at rest so the perspective ribbon is balanced.
  const initial = -((projects.length - 1) / 2) * STEP;

  const rawScrollX = useMotionValue(initial);
  const scrollX = useSpring(rawScrollX, { stiffness: 100, damping: 30, mass: 0.5 });
  const scrollVelocity = useVelocity(scrollX);

  const containerRef = useRef(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [selected, setSelected] = useState(null);

  const moveBy = (delta) => {
    const next = clamp(rawScrollX.get() + delta, -maxScroll, 0);
    rawScrollX.set(next);
    return next;
  };

  // Wheel surfs the planes; once we hit a bound, stop capturing so the page scrolls normally.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const el = container.closest("section") ?? container;
    const onWheel = (e) => {
      const delta = e.deltaX !== 0 ? e.deltaX : e.deltaY;
      const cur = rawScrollX.get();
      const next = clamp(cur - delta, -maxScroll, 0);
      if (next === cur) return; // at a bound in this direction → let page scroll
      e.preventDefault();
      rawScrollX.set(next);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [rawScrollX, maxScroll]);

  // Esc closes the spotlight.
  useEffect(() => {
    if (selected === null) return;
    const onKey = (e) => e.key === "Escape" && setSelected(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  return (
    <>
      <motion.div
        ref={containerRef}
        className="relative mt-14 h-[480px] w-full overflow-hidden"
        style={{ perspective: 2000, perspectiveOrigin: "15% 20%", touchAction: "pan-y" }}
        onPan={(_, info) => moveBy(info.delta.x * 2.5)}
      >
        <div className="absolute inset-0 flex items-center justify-center [transform-style:preserve-3d]">
          {projects.map((project, i) => (
            <Plane
              key={project.title}
              index={i}
              project={project}
              scrollX={scrollX}
              scrollVelocity={scrollVelocity}
              reducedMotion={reducedMotion}
              isHovered={hoveredIndex === i}
              onHoverStart={() => setHoveredIndex(i)}
              onHoverEnd={() => setHoveredIndex(null)}
              onSelect={() => setSelected(i)}
            />
          ))}
        </div>

        <div className="pointer-events-none absolute bottom-3 right-3 font-mono text-[10px] uppercase tracking-widest text-ash">
          drag or scroll to surf · click to open
        </div>
      </motion.div>

      <AnimatePresence>
        {selected !== null && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-6 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              className="relative w-full max-w-md"
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Close"
                className="absolute -right-3 -top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-coal text-bone transition hover:brightness-125"
              >
                ✕
              </button>
              <ProjectCard project={projects[selected]} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
