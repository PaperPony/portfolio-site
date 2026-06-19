"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";
import { ScrambleText as MotionScrambleText } from "motion-plus/react";

// Shared scroll-direction tracker — one window listener for every instance on
// the page (there can be many), rather than one listener each.
let scrollDir = "down";
let scrollLastY = 0;
let scrollListening = false;

function ensureScrollListener() {
  if (scrollListening || typeof window === "undefined") return;
  scrollListening = true;
  scrollLastY = window.scrollY;
  window.addEventListener(
    "scroll",
    () => {
      const y = window.scrollY;
      if (y > scrollLastY) scrollDir = "down";
      else if (y < scrollLastY) scrollDir = "up";
      scrollLastY = y;
    },
    { passive: true }
  );
}

/*
 * Scroll-triggered scramble text, built on motion's ScrambleText (motion-plus).
 *
 * The scramble fires only when the text is reached by scrolling DOWN. Scrolling
 * back up past it resets it (so a later downward pass re-triggers), and entering
 * it from above (while scrolling up) leaves it plainly revealed — no scramble.
 *
 * We watch our element with `useInView({ once: false })` and gate motion's
 * `active` prop on the current scroll direction. `active` true = scramble→reveal,
 * false = revealed/reset.
 */
export default function ScrambleText({
  text,
  as = "span",
  className = "",
  amount = 0.3, // fraction visible before it triggers
  duration = 1.5, // seconds each character stays scrambled (motion default is 1)
  ...motionProps
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { amount });
  const [active, setActive] = useState(false);

  useEffect(() => ensureScrollListener(), []);

  useEffect(() => {
    // Enter while scrolling down → scramble. Leaving resets (so the next
    // downward entry re-triggers). Enter while scrolling up → stay revealed.
    setActive(inView && scrollDir === "down");
  }, [inView]);

  return (
    <MotionScrambleText
      ref={ref}
      as={as}
      className={className}
      active={active}
      duration={duration}
      {...motionProps}
    >
      {text}
    </MotionScrambleText>
  );
}
