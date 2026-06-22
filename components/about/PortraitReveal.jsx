"use client";

import { useEffect, useRef } from "react";
import { motion, animate } from "motion/react";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useScrollTriggerActive } from "@/lib/useScrollTriggerActive";

// Radial mask that "ripples" the colour layer in from the top-right, echoing
// the sweep in Motion's Apple Intelligence example (motion.dev/examples/
// react-apple-intelligence). The ellipse size is fixed; we grow the solid
// black stop outward so the reveal is a clean, interpolatable wipe.
const MASK_HIDDEN =
  "radial-gradient(ellipse 260% 260% at 115% 25%, #000 0%, transparent 0%)";
const MASK_SHOWN =
  "radial-gradient(ellipse 260% 260% at 115% 25%, #000 55%, transparent 100%)";

// The Apple Intelligence shimmer band — a tinted clone sweeps across once.
const SHIMMER_FROM =
  "radial-gradient(ellipse 0% 100% at 120% 30%, transparent 0%, #000 0%, transparent 60%)";
const SHIMMER_TO =
  "radial-gradient(ellipse 320% 100% at 100% 30%, transparent 0%, #000 300%, transparent 300%)";

const EASE = [0.22, 1, 0.36, 1];

/**
 * Portrait that lives in monochrome until it's scrolled into view (reading down
 * the page), then ripples into colour — the same scroll trigger that drives the
 * scramble text, via useScrollTriggerActive. Scrolling back up past it drains
 * the colour again, so a later downward pass replays the reveal.
 *
 * The reveal is adapted from Motion's "Apple Intelligence" example: the colour
 * layer is unmasked via an animated radial sweep, and a tinted, colour-dodge
 * clone flashes across once on enter.
 */
export default function PortraitReveal({ src, alt, className = "" }) {
  const reducedMotion = useReducedMotion();
  const [ref, active] = useScrollTriggerActive({ amount: 0.4 });

  const colorRef = useRef(null);
  const shimmerRef = useRef(null);
  const colorAnimRef = useRef(null);
  // Skip the drain on first mount: the colour layer already starts hidden, so
  // there's nothing to drain until it has actually been revealed once.
  const revealedOnce = useRef(false);

  const revealColor = () => {
    const el = colorRef.current;
    if (!el) return;
    colorAnimRef.current?.stop();
    if (reducedMotion) {
      el.style.maskImage = MASK_SHOWN;
      return;
    }
    colorAnimRef.current = animate(
      el,
      { maskImage: [MASK_HIDDEN, MASK_SHOWN] },
      { duration: 0.7, ease: EASE }
    );
  };

  const drainColor = () => {
    const el = colorRef.current;
    if (!el) return;
    colorAnimRef.current?.stop();
    if (reducedMotion) {
      el.style.maskImage = MASK_HIDDEN;
      return;
    }
    colorAnimRef.current = animate(
      el,
      { maskImage: [MASK_SHOWN, MASK_HIDDEN] },
      { duration: 0.8, ease: EASE }
    );
  };

  // One-shot shimmer sweep — the Apple Intelligence ripple flash.
  const shimmer = () => {
    const el = shimmerRef.current;
    if (!el || reducedMotion) return;
    animate(
      el,
      {
        scaleX: [1.6, 1],
        opacity: [0.9, 0.9, 0],
        maskImage: [SHIMMER_FROM, SHIMMER_TO],
      },
      {
        duration: 1.1,
        ease: "linear",
        scaleX: { duration: 0.6, ease: [0.7, -0.03, 0.17, 1] },
      }
    );
  };

  useEffect(() => {
    if (active) {
      revealedOnce.current = true;
      revealColor();
      shimmer();
    } else if (revealedOnce.current) {
      drainColor();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return (
    <motion.div ref={ref} className={`relative ${className}`}>
      {/* Neon bloom that swells behind the figure on reveal. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-6 rounded-[42%] bg-gradient-to-tr from-neon-magenta/40 via-neon-purple/30 to-neon-cobalt/40 blur-3xl"
        initial={false}
        animate={{ scale: active ? 1.12 : 0.88, opacity: active ? 0.9 : 0.3 }}
        transition={{ duration: 0.6, ease: EASE }}
      />

      {/* Monochrome base — always visible. */}
      <img
        src={src}
        alt={alt}
        draggable={false}
        className="absolute inset-0 h-full w-full select-none object-contain object-bottom [filter:grayscale(1)_contrast(1.03)]"
      />

      {/* Colour layer — ripples in via an animated radial mask while in view. */}
      <img
        ref={colorRef}
        src={src}
        alt=""
        aria-hidden
        draggable={false}
        style={{ maskImage: MASK_HIDDEN }}
        className="pointer-events-none absolute inset-0 h-full w-full select-none object-contain object-bottom"
      />

      {/* Shimmer pass — tinted colour-dodge clone that sweeps once on enter. */}
      <img
        ref={shimmerRef}
        src={src}
        alt=""
        aria-hidden
        draggable={false}
        style={{
          opacity: 0,
          mixBlendMode: "color-dodge",
          filter: "contrast(110%) brightness(120%) hue-rotate(10deg)",
          transformOrigin: "100% 0%",
        }}
        className="pointer-events-none absolute inset-0 h-full w-full select-none object-contain object-bottom"
      />
    </motion.div>
  );
}
