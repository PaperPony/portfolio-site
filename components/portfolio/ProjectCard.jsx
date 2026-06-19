"use client";

import { motion } from "motion/react";
import ScrambleText from "@/components/ui/ScrambleText";

const ACCENT = {
  magenta: "#ff2d95",
  purple: "#9d4edd",
  cobalt: "#3a86ff",
  ember: "#ff5e1a",
  lime: "#aaff00",
};

export default function ProjectCard({ project }) {
  const color = ACCENT[project.accent] ?? ACCENT.cobalt;

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-coal"
    >
      {/* Accent glow line on top. */}
      <span
        className="absolute inset-x-0 top-0 h-px opacity-60 transition-opacity group-hover:opacity-100"
        style={{ backgroundColor: color, boxShadow: `0 0 16px ${color}` }}
      />

      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={project.image}
          alt={project.title}
          className="h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col p-6">
        <ScrambleText
          as="h3"
          text={project.title}
          className="block text-xl font-semibold text-bone"
        />
        <ScrambleText
          as="p"
          text={project.blurb}
          className="mt-2 block flex-1 text-sm leading-relaxed text-ash"
        />

        <div className="mt-4 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <ScrambleText
              key={tag}
              text={tag}
              className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] font-medium text-ash"
            />
          ))}
        </div>

        {project.links?.length > 0 && (
          <div className="mt-5 flex gap-4">
            {project.links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium transition hover:brightness-125"
                style={{ color }}
              >
                <ScrambleText text={link.label} /> →
              </a>
            ))}
          </div>
        )}
      </div>
    </motion.article>
  );
}
