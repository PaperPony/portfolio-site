"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  animate,
  easeIn,
  mix,
  motion,
  progress,
  stagger,
  useMotionValue,
  useTransform,
  wrap,
} from "motion/react";
import { ScrambleText } from "motion-plus/react";
import { projects } from "@/content/projects";
import { useReducedMotion } from "@/lib/useReducedMotion";
import ProjectCard from "@/components/portfolio/ProjectCard";

// Adapted from Motion's "card stack" example (motion.dev/examples/react-card-stack).
// Swipe the top card away and it drops to the back of the stack; tap to open details.

const ACCENT = {
  magenta: "#ff2d95",
  purple: "#9d4edd",
  cobalt: "#3a86ff",
  ember: "#ff5e1a",
  lime: "#aaff00",
};

const MAX_ROTATE = 7;
const MIN_DISTANCE = 140; // px dragged before the card is released
const MIN_SPEED = 50; // px/s flick velocity that releases regardless of distance

const scrambleChars = "!@#$%^&*()_+-=[]{}|;:,.<>?/~`░▒▓█▀▄■□▪▫●○◆◇◈◊※†‡";

export default function ProjectStack() {
  const reducedMotion = useReducedMotion();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);

  // Esc closes the spotlight.
  useEffect(() => {
    if (selected === null) return;
    const onKey = (e) => e.key === "Escape" && setSelected(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  return (
    <div className="mt-14 flex flex-col items-center">
      {/* Sized off the viewport so the larger card still fits on a phone. */}
      <ul className="relative aspect-[3/4] w-[min(80vw,440px)] list-none p-0">
        {projects.map((project, index) => (
          <StackCard
            key={project.title}
            project={project}
            index={index}
            currentIndex={currentIndex}
            total={projects.length}
            maxRotate={reducedMotion ? 0 : MAX_ROTATE}
            reducedMotion={reducedMotion}
            onOpen={() => setSelected(index)}
            setNextProject={() =>
              setCurrentIndex(wrap(0, projects.length, currentIndex + 1))
            }
          />
        ))}
      </ul>

      {/* Keyboard/click route through the stack, so dragging isn't the only way in. */}
      <div className="mt-8 flex items-center gap-3">
        {projects.map((project, index) => (
          <button
            key={project.title}
            type="button"
            onClick={() => setCurrentIndex(index)}
            aria-label={`Show ${project.title}`}
            aria-current={index === currentIndex}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex
                ? "w-6 bg-neon-cobalt"
                : "w-2 bg-white/25 hover:bg-white/50"
            }`}
          />
        ))}
      </div>

      <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-ash">
        drag the top card aside · click to open
      </p>

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
            aria-label={`${projects[selected].title} details`}
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
    </div>
  );
}

/**
 * Sampling sin() at the golden angle gives a deterministic -1..1 sequence that
 * stays well spread for a handful of cards. Plain Math.sin(index), as in the
 * Motion example, only separates once you have a dozen-plus cards: at index
 * 0/1/2 it yields 0, 0.84, 0.91 — two near-identical tilts, never negative.
 */
const GOLDEN_ANGLE = 2.39996;

function StackCard({
  project,
  index,
  currentIndex,
  total,
  maxRotate,
  reducedMotion,
  onOpen,
  setNextProject,
}) {
  const baseRotation = mix(0, maxRotate, Math.sin(index * GOLDEN_ANGLE));
  const x = useMotionValue(0);
  const rotate = useTransform(x, [0, 400], [baseRotation, baseRotation + 10], {
    clamp: false,
  });

  const didDrag = useRef(false);
  const [isHovered, setIsHovered] = useState(false);

  const color = ACCENT[project.accent] ?? ACCENT.cobalt;
  const isTop = index === currentIndex;
  const zIndex = total - wrap(total, 0, index - currentIndex + 1);
  const depth = total - 1 - zIndex; // 0 = front of the stack

  const progressInStack = progress(0, total - 1, zIndex);
  const scale = mix(0.88, 1, easeIn(progressInStack));
  const opacity = mix(0.35, 1, progressInStack);

  const onDragEnd = () => {
    const distance = Math.abs(x.get());
    const speed = Math.abs(x.getVelocity());

    if (distance > MIN_DISTANCE || speed > MIN_SPEED) {
      setNextProject();
      animate(x, 0, { type: "spring", stiffness: 600, damping: 50 });
    } else {
      animate(x, 0, { type: "spring", stiffness: 300, damping: 50 });
    }
  };

  // inset-0 rather than a centring translate: Motion owns `transform` here.
  return (
    <motion.li
      className="absolute inset-0 rounded-xl shadow-2xl outline-none [will-change:transform,opacity]"
      style={{
        zIndex,
        rotate,
        x,
        cursor: isTop ? "grab" : "auto",
        pointerEvents: isTop ? "auto" : "none",
        filter: isHovered ? "brightness(1.12)" : "brightness(0.92)",
        transition: "filter 0.2s ease",
      }}
      initial={{ opacity: 0, scale: 0.3 }}
      animate={{ opacity, scale, y: depth * 14 }}
      whileTap={isTop ? { scale: scale * 0.98 } : {}}
      transition={
        reducedMotion
          ? { duration: 0 }
          : { type: "spring", stiffness: 600, damping: 30 }
      }
      drag={isTop ? "x" : false}
      onDragEnd={onDragEnd}
      onHoverStart={() => isTop && setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      aria-hidden={!isTop}
      /* A tap opens the details; a drag must not. onDragStart only fires once
         the drag threshold is crossed, so the flag cleanly separates the two. */
      onPointerDown={() => {
        didDrag.current = false;
      }}
      onDragStart={() => {
        didDrag.current = true;
      }}
      onClick={() => {
        if (isTop && !didDrag.current) onOpen();
      }}
      onKeyDown={(e) => {
        if (isTop && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onOpen();
        }
      }}
      role={isTop ? "button" : undefined}
      tabIndex={isTop ? 0 : -1}
      aria-label={`${project.title} — open details`}
    >
      <div className="absolute inset-0 overflow-hidden rounded-xl border border-white/10 bg-slate2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={project.image}
          alt={project.title}
          draggable={false}
          className="h-full w-full select-none object-cover"
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
              <ScrambleText
                active={isHovered}
                duration={stagger(0.05)}
                chars={scrambleChars}
              >
                {project.title}
              </ScrambleText>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}
