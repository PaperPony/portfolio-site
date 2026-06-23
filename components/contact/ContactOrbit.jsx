"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";

/*
 * Idle glyph orbit flanking the Contact CTA.
 *
 * Two arcs on a circle centred on the section — the right side and the left
 * side, like a pair of parentheses, with the top and bottom left open. Glyphs
 * drift CLOCKWISE along these arcs (down the right, up the left), fading in from
 * one edge and out to the other via a sin(πp) envelope so they vanish exactly at
 * the arc ends, then respawn at the entry edge with a fresh glyph + theme colour.
 *
 * Canvas + one rAF loop, gated to wide screens and paused off-screen.
 */

// Theme palette — same tokens as the statuses / projects / aurora.
const COLORS = ["#aaff00", "#3a86ff", "#9d4edd", "#ff2d95", "#ff5e1a"];

const GLYPHS = "◆◇◈◊●○✦✧▪▫".split("");

const D2R = Math.PI / 180;

// Visible angular windows (radians). 0 = due-east, +90° = due-south (canvas y is
// down), so increasing the angle travels clockwise on screen.
const ARCS = [
  { start: -60 * D2R, end: 60 * D2R }, // right ")"  — top → bottom (clockwise)
  { start: 120 * D2R, end: 240 * D2R }, // left  "("  — bottom → top (clockwise)
];

const PER_ARC = 24; // glyphs riding each arc, staggered along it
const PEAK_OPACITY = 0.5; // mid-arc brightness

const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[(Math.random() * arr.length) | 0];

export default function ContactOrbit() {
  const reduced = useReducedMotion();
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let w = 0;
    let h = 0;
    let cx = 0;
    let cy = 0;
    let radius = 0;
    let glyphs = [];

    const reset = (g) => {
      // Each glyph is its own traveller: its own pace, its own radial "lane",
      // its own entry/exit angles, and its own life window along the path.
      // It fades in somewhere in the first half of the arc and out somewhere in
      // the second half (envelope is keyed to pStart→pEnd).
      g.pStart = rand(0, 0.5); // spawn point
      g.pEnd = rand(0.5, 1); // despawn point
      g.p = g.pStart;
      g.speed = rand(0.03, 0.085); // progress/second → ~12–33s per traversal
      g.rOffset = rand(-40, 40); // radial lane: how far off the central path
      g.aStart = rand(-13, 13) * D2R; // jitter the entry angle
      g.aEnd = rand(-13, 13) * D2R; // and the exit angle, independently
      g.size = rand(22, 38);
      g.char = pick(GLYPHS);
      g.color = pick(COLORS);
      return g;
    };

    const layout = () => {
      const rect = wrap.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = w / 2;
      cy = h / 2;
      // Keep the bright mid-arc clear of the centred text column.
      radius = Math.max(300, Math.min(w * 0.42, h * 0.6, 520));
    };

    const init = () => {
      glyphs = [];
      ARCS.forEach((_, arcIndex) => {
        for (let i = 0; i < PER_ARC; i++) {
          const g = reset({ arc: arcIndex });
          g.p = rand(g.pStart, g.pEnd); // distribute across their lives at start
          glyphs.push(g);
        }
      });
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (const g of glyphs) {
        const life = (g.p - g.pStart) / (g.pEnd - g.pStart);
        const alpha = Math.sin(Math.PI * life) * PEAK_OPACITY;
        if (alpha <= 0.01) continue;
        const arc = ARCS[g.arc];
        const start = arc.start + g.aStart;
        const end = arc.end + g.aEnd;
        const theta = start + g.p * (end - start);
        const r = radius + g.rOffset;
        const x = cx + r * Math.cos(theta);
        const y = cy + r * Math.sin(theta);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = g.color;
        ctx.shadowColor = g.color;
        ctx.shadowBlur = 10 + g.size * 0.3;
        ctx.font = `${g.size}px ui-monospace, SFMono-Regular, Menlo, monospace`;
        ctx.fillText(g.char, x, y);
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    };

    // Reduced motion: lay out and paint a single settled frame, no loop.
    if (reduced) {
      layout();
      init();
      glyphs.forEach((g) => (g.p = (g.pStart + g.pEnd) / 2)); // hold mid-life (brightest)
      draw();
      return;
    }

    layout();
    init();

    let raf;
    let last = performance.now();
    let visible = true;

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!visible) return;
      for (const g of glyphs) {
        g.p += g.speed * dt;
        if (g.p >= g.pEnd) reset(g);
      }
      draw();
    };

    const ro = new ResizeObserver(layout);
    ro.observe(wrap);

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) last = performance.now(); // avoid a dt jump on re-entry
      },
      { threshold: 0 }
    );
    io.observe(wrap);

    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [reduced]);

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 hidden lg:block"
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
