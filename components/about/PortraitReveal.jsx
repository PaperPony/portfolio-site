"use client";

import { useEffect, useRef, useState } from "react";
import { motion, animate } from "motion/react";
import { useReducedMotion } from "@/lib/useReducedMotion";

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

// Downscaled resolution for cursor alpha hit-testing — enough to tell the
// figure from its transparent cut-out, cheap to sample on every move.
const SAMPLE_W = 220;
const ALPHA_THRESHOLD = 12;

const EASE = [0.22, 1, 0.36, 1];

/**
 * Portrait that lives in monochrome until the cursor crosses the *visible*
 * figure (not the transparent cut-out around it), then ripples into colour.
 *
 * The reveal is adapted from Motion's "Apple Intelligence" example: the colour
 * layer is unmasked via an animated radial sweep, and a tinted, colour-dodge
 * clone flashes across once on enter. Cursor hit-testing samples a downscaled
 * alpha map of the PNG so transparent pixels never trigger the effect.
 */
export default function PortraitReveal({ src, alt, className = "" }) {
  const reducedMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);

  const containerRef = useRef(null);
  const colorRef = useRef(null);
  const shimmerRef = useRef(null);

  // Alpha map for hit-testing: { data, w, h, naturalW, naturalH }.
  const alphaRef = useRef(null);
  const overRef = useRef(false);
  const colorAnimRef = useRef(null);

  // Build a small alpha map once the image has decoded.
  useEffect(() => {
    let cancelled = false;
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => {
      if (cancelled || !img.naturalWidth) return;
      const w = Math.min(SAMPLE_W, img.naturalWidth);
      const h = Math.max(1, Math.round((w * img.naturalHeight) / img.naturalWidth));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);
      try {
        const { data } = ctx.getImageData(0, 0, w, h);
        alphaRef.current = { data, w, h, naturalW: img.naturalWidth, naturalH: img.naturalHeight };
      } catch {
        alphaRef.current = null; // tainted canvas — fall back to box hover
      }
    };
    return () => {
      cancelled = true;
    };
  }, [src]);

  // Is the cursor over a non-transparent pixel of the figure? Mirrors the
  // image's `object-contain object-bottom` layout to map screen -> source px.
  const isOverFigure = (clientX, clientY) => {
    const el = containerRef.current;
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    const map = alphaRef.current;
    if (!map) {
      return (
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom
      );
    }
    const scale = Math.min(rect.width / map.naturalW, rect.height / map.naturalH);
    const dW = map.naturalW * scale;
    const dH = map.naturalH * scale;
    const px = clientX - rect.left - (rect.width - dW) / 2; // object-position x: 50%
    const py = clientY - rect.top - (rect.height - dH); // object-bottom: y 100%
    if (px < 0 || py < 0 || px > dW || py > dH) return false;
    const sx = Math.min(map.w - 1, Math.floor((px / dW) * map.w));
    const sy = Math.min(map.h - 1, Math.floor((py / dH) * map.h));
    return map.data[(sy * map.w + sx) * 4 + 3] > ALPHA_THRESHOLD;
  };

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

  const setOver = (over) => {
    if (over === overRef.current) return;
    overRef.current = over;
    setHovered(over);
    if (over) {
      revealColor();
      shimmer();
    } else {
      drainColor();
    }
  };

  const onMove = (e) => setOver(isOverFigure(e.clientX, e.clientY));
  const onLeave = () => setOver(false);

  return (
    <div
      ref={containerRef}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`relative ${className}`}
    >
      {/* Neon bloom that swells behind the figure on hover. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-6 rounded-[42%] bg-gradient-to-tr from-neon-magenta/40 via-neon-purple/30 to-neon-cobalt/40 blur-3xl"
        initial={false}
        animate={{ scale: hovered ? 1.12 : 0.88, opacity: hovered ? 0.9 : 0.3 }}
        transition={{ duration: 0.6, ease: EASE }}
      />

      {/* Monochrome base — always visible. */}
      <img
        src={src}
        alt={alt}
        draggable={false}
        className="absolute inset-0 h-full w-full select-none object-contain object-bottom [filter:grayscale(1)_contrast(1.03)]"
      />

      {/* Colour layer — ripples in via an animated radial mask while hovered. */}
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
    </div>
  );
}
