"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";

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
 * Scroll-direction–gated in-view trigger.
 *
 * Returns `[ref, active]`. `active` flips true when the watched element is
 * reached by scrolling DOWN, and resets when it leaves view (so a later
 * downward pass re-triggers). Entering it from above while scrolling UP leaves
 * it inactive — i.e. it only "plays" on the forward read of the page.
 *
 * Used by both the scramble text and the portrait colour reveal so they share
 * one behaviour.
 */
export function useScrollTriggerActive({ amount = 0.3 } = {}) {
  const ref = useRef(null);
  const inView = useInView(ref, { amount });
  const [active, setActive] = useState(false);

  useEffect(() => ensureScrollListener(), []);

  useEffect(() => {
    setActive(inView && scrollDir === "down");
  }, [inView]);

  return [ref, active];
}

export default useScrollTriggerActive;
