import { about } from "@/content/about";
import Reveal from "@/components/ui/Reveal";

export default function About() {
  return (
    <section
      id="about"
      className="relative border-t border-white/10 bg-coal px-6 py-24 sm:py-32"
    >
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-16">
        {/* Portrait (placeholder — swap /public/portrait.svg later). */}
        <Reveal className="order-1 md:order-none">
          <div className="relative mx-auto w-full max-w-sm">
            <div className="absolute -inset-3 rounded-3xl bg-gradient-to-tr from-neon-magenta/30 via-neon-purple/20 to-neon-cobalt/30 blur-2xl" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={about.portrait}
              alt={about.portraitAlt}
              className="relative aspect-[4/5] w-full rounded-3xl border border-white/10 object-cover"
            />
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-neon-purple">
            About
          </p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight text-bone sm:text-5xl">
            {about.heading}
          </h2>
          <div className="mt-6 space-y-4 text-base leading-relaxed text-ash">
            {about.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {about.highlights.map((h) => (
              <li
                key={h.label}
                className="rounded-xl border border-white/10 bg-ink/60 p-4"
              >
                <div className="text-sm font-semibold text-bone">{h.label}</div>
                <div className="mt-1 text-xs text-ash">{h.detail}</div>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
