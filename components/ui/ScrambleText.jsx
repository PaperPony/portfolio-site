"use client";

import { useMemo } from "react";
import { stagger } from "motion/react";
import { ScrambleText as MotionScrambleText } from "motion-plus/react";
import { useScrollTriggerActive } from "@/lib/useScrollTriggerActive";

const SCRAMBLE_CHARS = "!@#$%^&*()_+-=[]{}|;:,.<>?/~`░▒▓█▀▄■□▪▫●○◆◇◈◊※†‡";
const CHAR_DURATION = 0.35;
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
  duration = CHAR_DURATION,
  delay, // per-character start offset
  chars = SCRAMBLE_CHARS,
  reserveSpace = false, // hold a stable box so scramble re-wrapping can't shift layout
  playOnMount = false, // scramble as soon as it mounts, ignoring the scroll gate
  ...motionProps
}) {
  const [ref, scrolledInto] = useScrollTriggerActive({ amount });
  // Text that only appears on interaction (an opening FAQ answer) is never
  // "scrolled into" — it arrives already in view, so it plays on mount instead.
  const active = playOnMount || scrolledInto;

  // Left-to-right wave. Memoised because motion-plus keys its animation effect on
  // `delay` by identity — a fresh stagger() each render would replay the scramble
  // on every unrelated parent re-render (e.g. opening an FAQ accordion).
  const resolvedDelay = useMemo(
    () => delay ?? stagger(SWEEP_SPAN / Math.max(text.length, 1)),
    [delay, text.length]
  );

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
