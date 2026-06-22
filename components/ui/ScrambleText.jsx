"use client";

import { stagger } from "motion/react";
import { ScrambleText as MotionScrambleText } from "motion-plus/react";
import { useScrollTriggerActive } from "@/lib/useScrollTriggerActive";

// Same glyph set the Motion scramble examples use, so the noise reads the same.
const SCRAMBLE_CHARS = "!@#$%^&*()_+-=[]{}|;:,.<>?/~`░▒▓█▀▄■□▪▫●○◆◇◈◊※†‡";

// How long each character scrambles before settling. Kept short so the correct
// text starts resolving almost immediately rather than after a long noise hold.
const CHAR_DURATION = 0.35;

// Total span of the left-to-right reveal wave. Normalised by character count
// below so a short heading and a long paragraph both sweep over the same window
// instead of the paragraph dragging on. The wave (not the per-char scramble) is
// what fills most of the timeline.
const SWEEP_SPAN = 1.15;

/*
 * Scroll-triggered scramble text, built on motion's ScrambleText (motion-plus).
 *
 * The scramble fires only when the text is reached by scrolling DOWN. Scrolling
 * back up past it resets it (so a later downward pass re-triggers), and entering
 * it from above (while scrolling up) leaves it plainly revealed — no scramble.
 * That direction logic lives in useScrollTriggerActive, shared with the portrait
 * reveal. `active` true = scramble→reveal, false = revealed/reset.
 */
export default function ScrambleText({
  text,
  as = "span",
  className = "",
  amount = 0.3, // fraction visible before it triggers
  duration = CHAR_DURATION, // seconds each character stays scrambled
  delay, // per-character start offset; defaults to a length-normalised LTR sweep
  chars = SCRAMBLE_CHARS,
  reserveSpace = false, // hold a stable box so scramble re-wrapping can't shift layout
  ...motionProps
}) {
  const [ref, active] = useScrollTriggerActive({ amount });

  // Left-to-right wave: stagger each character's start so the leftmost settles
  // first and the rightmost last, the sweep spread over SWEEP_SPAN regardless of
  // text length. `from` defaults to "first", i.e. left-to-right.
  const resolvedDelay =
    delay ?? stagger(SWEEP_SPAN / Math.max(text.length, 1));

  // Reserve-space mode: a proportional font means scrambled glyphs have varying
  // widths, so the text can re-wrap mid-animation and change height — which
  // jitters anything sized by it (section dividers, centred siblings). Here the
  // real text sits invisibly *in flow* to pin the final, resize-correct box,
  // while the scramble overlays it *absolutely* so its transient re-wrapping
  // never moves surrounding layout. Used for block text; inline usages keep the
  // plain render so they still wrap inside a sentence.
  if (reserveSpace) {
    const Tag = as;
    return (
      <Tag ref={ref} className={`relative ${className}`}>
        {/* In-flow copy: transparent (not `invisible`, so it stays in the
            accessibility tree and is what screen readers announce), reserving
            the real layout box. The scramble overlay is aria-hidden. */}
        <span className="opacity-0">{text}</span>
        <MotionScrambleText
          as="span"
          aria-hidden
          className="absolute inset-0"
          active={active}
          duration={duration}
          delay={resolvedDelay}
          chars={chars}
          {...motionProps}
        >
          {text}
        </MotionScrambleText>
      </Tag>
    );
  }

  return (
    <MotionScrambleText
      ref={ref}
      as={as}
      className={className}
      active={active}
      duration={duration}
      delay={resolvedDelay}
      chars={chars}
      {...motionProps}
    >
      {text}
    </MotionScrambleText>
  );
}
