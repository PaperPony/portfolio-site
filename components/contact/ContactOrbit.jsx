"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";

/*
 * Idle glyph orbit flanking the Contact CTA.
 *
 * Two arcs on a circle centred on the CTA — the right side and the left side,
 * like a pair of parentheses, with the top and bottom left open. Glyphs drift
 * CLOCKWISE along these arcs (down the right, up the left), fading in from one
 * edge and out to the other via a sin(πp) envelope so they vanish exactly at the
 * arc ends, then respawn at the entry edge with a fresh glyph + theme colour.
 *
 * Geometry is measured, not guessed: the circle centres on [data-orbit-center]
 * (the CTA) and its radius clears [data-orbit-column] (the text column), so
 * glyphs never land on the copy. Where there isn't vertical room for the full
 * ±60° sweep, the arcs SHORTEN rather than the radius shrinking — shrinking it
 * would pull the glyphs inward over the text, which is what used to happen on
 * short/narrow viewports.
 *
 * Wide screens get the big parentheses. Narrow ones have no side gutters to
 * bracket, so they instead get a very large radius, which flattens each arc into
 * a near-vertical lane running the height of the section down either edge —
 * apexing beside the CTA and bowing gently inward toward its faded ends.
 *
 * Canvas + one rAF loop, paused off-screen.
 */

// Theme palette — same tokens as the statuses / projects / aurora.
const COLORS = ["#aaff00", "#3a86ff", "#9d4edd", "#ff2d95", "#ff5e1a"];

const GLYPHS = "◆◇◈◊●○✦✧▪▫".split("");

const D2R = Math.PI / 180;

// Arc centre angles (radians). 0 = due-east, +90° = due-south (canvas y is
// down), so increasing the angle travels clockwise on screen. Each arc sweeps
// its centre ±`arcHalf`, a half-window resolved per layout.
const ARC_CENTERS = [0, Math.PI]; // right ")" (top → bottom), left "(" (bottom → top)

const ARC_HALF_MAX = 60 * D2R; // the full parentheses on a roomy screen
const ARC_HALF_MIN = 8 * D2R; // never collapse to a dot

// Glyphs riding each arc, staggered along it. Glyph SIZE is the same at every
// width — shrinking them on phones made the orbit read as fine clutter rather
// than the same motif. Narrow screens thin out the count instead, so the field
// stays airy in the slim gutters beside the copy.
const PER_ARC = 24;
const PER_ARC_COMPACT = 10;

// How far a compact lane may bow inward at its ends, as a fraction of its
// distance from the CTA. Higher = taller reach, but the (already faded) ends
// drift further over the copy.
const COMPACT_BOW = 0.6;

// Entry/exit angle jitter, as a fraction of the sweep and capped absolutely. It
// has to be paid for out of the vertical room, so the compact lanes — which want
// every pixel of height they can get — take less of it.
const JITTER_FRAC = 0.3;
const JITTER_FRAC_COMPACT = 0.15;
const JITTER_MAX = 13 * D2R;
const PEAK_OPACITY = 0.5; // mid-arc brightness

// Below this wrapper width the orbit switches to its condensed variant. Above
// it, a max-w-2xl (672px) column plus glyph margins still fits in the gutters.
const COMPACT_W = 1024;

const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[(Math.random() * arr.length) | 0];
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

/*
 * Offset of `el`'s centre within `root`, walking the offsetParent chain.
 *
 * Deliberately not getBoundingClientRect(): the CTA sits inside <Reveal>, which
 * animates a transform on entry, and rects include transforms — measuring one
 * mid-reveal would centre the orbit 24px off. Offsets are layout-only.
 */
const centerWithin = (el, root) => {
  let x = el.offsetWidth / 2;
  let y = el.offsetHeight / 2;
  let node = el;
  while (node && node !== root) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent;
  }
  return node === root ? { x, y } : null;
};

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

    // The section is the wrapper's offsetParent and holds the measured anchors.
    const root = wrap.offsetParent ?? wrap.parentElement;
    const anchor = root?.querySelector("[data-orbit-center]");
    const column = root?.querySelector("[data-orbit-column]");

    let w = 0;
    let h = 0;
    let cx = 0;
    let cy = 0;
    let radius = 0; // circle radius of an arc
    let lane = 0; // horizontal distance from the CTA to the arc's apex
    let arcHalf = ARC_HALF_MAX;
    let jitterFrac = JITTER_FRAC;
    let glyphs = [];
    // Glyph size is width-independent. layout() sets the radial spread and the
    // glyph count, both of which the condensed variant tightens.
    const sizeMin = 22;
    const sizeMax = 38;
    let rSpread = 40;
    let perArc = PER_ARC;

    const reset = (g) => {
      // Each glyph is its own traveller: its own pace, its own radial "lane",
      // its own entry/exit angles, and its own life window along the path.
      // It fades in somewhere in the first half of the arc and out somewhere in
      // the second half (envelope is keyed to pStart→pEnd).
      g.pStart = rand(0, 0.5); // spawn point
      g.pEnd = rand(0.5, 1); // despawn point
      g.p = g.pStart;
      g.speed = rand(0.03, 0.085); // progress/second → ~12–33s per traversal
      g.rOffset = rand(-rSpread, rSpread); // radial lane: how far off the central path
      // Entry/exit angle jitter, stored as a -1..1 fraction and scaled to the
      // sweep at draw time. Storing absolute angles would mean a re-layout that
      // changes the sweep invalidates every glyph, forcing a respawn — which
      // reads as the whole field flickering out and back in.
      g.jStart = rand(-1, 1);
      g.jEnd = rand(-1, 1);
      g.size = rand(sizeMin, sizeMax);
      g.char = pick(GLYPHS);
      g.color = pick(COLORS);
      return g;
    };

    const layout = () => {
      const rect = wrap.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      // Only touch the backing store when the size really changed: assigning
      // canvas.width wipes the canvas, and layout() runs on every observer tick
      // (the scramble text reflows the column constantly), which would blank the
      // orbit between frames.
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      const compact = w < COMPACT_W;
      // Full-size glyphs in a narrow gutter can't also fan out radially — the
      // spread would push them over the copy — so the compact lanes are thin.
      rSpread = compact ? 12 : 40;
      perArc = compact ? PER_ARC_COMPACT : PER_ARC;
      jitterFrac = compact ? JITTER_FRAC_COMPACT : JITTER_FRAC;

      // Clearance a glyph needs beyond the path: its own half-width, its radial
      // lane, and the glow.
      const margin = sizeMax * 0.8 + rSpread + (compact ? 8 : 12);

      // Centre on the CTA so the parentheses bracket the button, not the section
      // box (which includes the footer and dragged the ring far below the CTA).
      const center = anchor ? centerWithin(anchor, root) : null;
      cx = center ? center.x : w / 2;
      cy = center ? center.y : h / 2;

      // Widest the glyphs may sit without being clipped by the overflow-hidden
      // section.
      const fitH = Math.min(cx, w - cx) - margin;

      const columnHalf = (column ? column.offsetWidth : w * 0.55) / 2;

      // Vertical room either side of the CTA, i.e. how tall the arcs may run.
      const fitV = Math.min(cy, h - cy) - margin * 0.5;

      if (compact) {
        // Narrow viewports have no side gutters — the column fills the width —
        // so a circle big enough to clear it can't fit, and one small enough to
        // fit only brackets the button. Instead: a very large radius, so each arc
        // flattens into a near-vertical LANE down the edge of the section. It
        // apexes beside the CTA (`lane` out from centre) and bows gently inward
        // toward its ends, where the sin(πp) envelope has already faded the
        // glyphs out — so the field spans the full section height while the
        // bright, opaque part stays in the copy-free slivers beside the button.
        lane = Math.max(48, fitH);
        // Inward bow allowed at the arc ends. Geometry: for a sweep half-angle a,
        // bow = R(1-cos a) and reach = R sin a, and (1-cos a)/sin a = tan(a/2) —
        // so the bow/reach ratio picks the sweep, and the reach then picks R.
        const bow = lane * COMPACT_BOW;
        const reach = Math.max(bow, fitV);
        arcHalf = clamp(2 * Math.atan(bow / reach), ARC_HALF_MIN, ARC_HALF_MAX);
        radius = reach / Math.sin(arcHalf);
      } else {
        // The big two-arc parentheses, sitting outside the centred text column.
        radius = clamp(columnHalf + margin, 300, Math.max(300, fitH));
        lane = radius; // circle centred on the CTA
        // Shorten the sweep to the vertical room, keeping the radius (and so the
        // horizontal clearance from the copy) intact. Shrinking the radius
        // instead would pull the glyphs inward over the text.
        arcHalf = clamp(
          Math.asin(clamp(fitV / radius, 0, 1)),
          ARC_HALF_MIN,
          ARC_HALF_MAX
        );
      }

      // Trim the sweep so even the outermost glyph — furthest radial lane, widest
      // angle jitter, own half-height — stays inside the section rather than being
      // cut off by its overflow-hidden edge.
      const reachMax = radius + rSpread + sizeMax * 0.5;
      const jitter = Math.min(JITTER_MAX, arcHalf * jitterFrac);
      const roomHalf = Math.asin(clamp(fitV / reachMax, 0, 1)) - jitter;
      arcHalf = clamp(Math.min(arcHalf, roomHalf), ARC_HALF_MIN, ARC_HALF_MAX);
    };

    const init = () => {
      glyphs = [];
      ARC_CENTERS.forEach((_, arcIndex) => {
        for (let i = 0; i < perArc; i++) {
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
        const center = ARC_CENTERS[g.arc];
        const jitter = Math.min(JITTER_MAX, arcHalf * jitterFrac);
        const start = center - arcHalf + jitter * g.jStart;
        const end = center + arcHalf + jitter * g.jEnd;
        const theta = start + g.p * (end - start);
        const r = radius + g.rOffset;
        // The arc's circle sits `radius - lane` behind its apex, so the apex lands
        // `lane` out from the CTA whatever the radius. Wide mode has lane ===
        // radius, which collapses this to a circle centred on the CTA.
        const arcCX = cx - Math.cos(center) * (radius - lane);
        const x = arcCX + r * Math.cos(theta);
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

    // Only crossing the compact breakpoint (which changes the glyph budget)
    // respawns the field. Everything else just re-measures: the observers below
    // fire constantly while the scramble text reflows the column, and respawning
    // on those would flicker the whole orbit in and out on every scramble.
    const relayout = () => {
      const before = perArc;
      layout();
      if (perArc !== before) init();
    };

    const ro = new ResizeObserver(relayout);
    ro.observe(wrap);
    // The CTA and column drive the geometry; watch them too (font loads and text
    // reflow change their size without changing the wrapper's).
    if (anchor) ro.observe(anchor);
    if (column) ro.observe(column);

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
      className="pointer-events-none absolute inset-0 block"
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
