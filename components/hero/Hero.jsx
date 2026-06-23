"use client";

import { motion } from "motion/react";
import AuroraCanvas from "@/components/three/AuroraCanvas";
import { site } from "@/content/site";

// Text settles in shortly after the aurora fades up.
const container = {
  hidden: {},
  show: {
    transition: { delayChildren: 0.4, staggerChildren: 0.12 },
  },
};
const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function Hero() {
  return (
    <section className="relative flex h-screen min-h-[640px] w-full items-center justify-center overflow-hidden bg-ink">
      {/* Shifting aurora backdrop. */}
      <AuroraCanvas />

      {/* Full-screen liquid glass: the entire aurora is viewed through it. */}
      <div className="liquid-glass pointer-events-none absolute inset-0" />

      {/* Soft vignette to anchor the aurora into the dark page edges. */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/30 via-transparent to-ink" />

      {/* Gentle central darkening for text legibility. */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(10,10,10,0.55),transparent_75%)]" />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 mx-auto max-w-2xl px-6 text-center"
      >
        <motion.p
          variants={item}
          className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-ash"
        >
          {site.role}
        </motion.p>
        <motion.h1
          variants={item}
          className="text-5xl font-bold leading-[1.05] tracking-tight text-bone drop-shadow-[0_2px_24px_rgba(0,0,0,0.55)] sm:text-7xl"
        >
          {site.name}
        </motion.h1>
        <motion.p
          variants={item}
          className="mx-auto mt-6 max-w-xl text-lg text-bone/85 drop-shadow-[0_1px_12px_rgba(0,0,0,0.5)] sm:text-xl"
        >
          {site.tagline}
        </motion.p>
        <motion.div variants={item} className="mt-10 flex justify-center gap-4">
          <a
            href="#portfolio"
            className="rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-medium text-bone backdrop-blur transition hover:border-neon-cobalt hover:text-neon-cobalt"
          >
            See my work
          </a>
          <a
            href="#contact"
            className="rounded-full bg-neon-magenta px-6 py-3 text-sm font-semibold text-ink transition hover:brightness-110"
          >
            Get in touch
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll cue. */}
      <div className="pointer-events-none absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-xs uppercase tracking-widest text-ash animate-pulse-soft">
        Scroll
      </div>
    </section>
  );
}
