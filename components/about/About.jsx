import { about } from "@/content/about";
import Reveal from "@/components/ui/Reveal";
import ScrambleText from "@/components/ui/ScrambleText";
import PortraitReveal from "@/components/about/PortraitReveal";

export default function About() {
  return (
    <section
      id="about"
      className="relative border-t border-white/10 bg-coal px-6 py-20 sm:py-24"
    >
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-16">
        {/* Portrait — monochrome until scrolled into view, then it warps into colour. */}
        <Reveal className="order-1 md:order-none">
          <div className="relative mx-auto w-full max-w-md">
            <PortraitReveal
              src={about.portrait}
              alt={about.portraitAlt}
              className="aspect-[4/5] w-full"
            />
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <ScrambleText
            as="p"
            reserveSpace
            text="About"
            className="block text-sm font-medium uppercase tracking-[0.3em] text-neon-purple"
          />
          <ScrambleText
            as="h2"
            reserveSpace
            text={about.heading}
            className="mt-3 block text-4xl font-bold tracking-tight text-bone sm:text-5xl"
          />
          <div className="mt-6 space-y-4 text-base leading-relaxed text-ash">
            {about.paragraphs.map((p, i) => (
              <ScrambleText key={i} as="p" reserveSpace text={p} className="block" />
            ))}
          </div>

          <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {about.highlights.map((h) => (
              <li
                key={h.label}
                className="rounded-xl border border-white/10 bg-ink/60 p-4"
              >
                <ScrambleText
                  text={h.label}
                  className="block text-sm font-semibold text-bone"
                />
                <ScrambleText
                  text={h.detail}
                  className="mt-1 block text-xs text-ash"
                />
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
