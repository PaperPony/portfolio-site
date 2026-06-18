"use client";

import { motion } from "framer-motion";
import PaintSplatCanvas from "@/components/three/PaintSplatCanvas";
import { site } from "@/content/site";

// Text reveals just after the first paint bucket lands (~1s delay in the scene).
const container = {
  hidden: {},
  show: {
    transition: { delayChildren: 1.1, staggerChildren: 0.12 },
  },
};
const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function Hero() {
  return (
    <section className="relative flex h-screen min-h-[640px] w-full items-center justify-center overflow-hidden bg-ink">
      {/* GPU paint-splatter backdrop. */}
      <PaintSplatCanvas />

      {/* Vignette so text stays legible over bright splatter. */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/40 via-transparent to-ink" />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 mx-auto max-w-4xl px-6 text-center"
      >
        <motion.p
          variants={item}
          className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-ash"
        >
          {site.role}
        </motion.p>
        <motion.h1
          variants={item}
          className="text-5xl font-bold leading-[1.05] tracking-tight text-bone sm:text-7xl md:text-8xl"
        >
          {site.name}
        </motion.h1>
        <motion.p
          variants={item}
          className="mx-auto mt-6 max-w-2xl text-lg text-ash sm:text-xl"
        >
          {site.tagline}
        </motion.p>
        <motion.div variants={item} className="mt-10 flex justify-center gap-4">
          <a
            href="#portfolio"
            className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-bone backdrop-blur transition hover:border-neon-cobalt hover:text-neon-cobalt"
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
