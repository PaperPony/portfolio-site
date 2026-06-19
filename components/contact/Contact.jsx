import { site } from "@/content/site";
import Reveal from "@/components/ui/Reveal";
import ScrambleText from "@/components/ui/ScrambleText";

export default function Contact() {
  return (
    <section
      id="contact"
      className="relative overflow-hidden border-t border-white/10 bg-ink px-6 py-28 sm:py-40"
    >
      {/* Soft neon glow behind the CTA. */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-neon-magenta/15 blur-[120px]" />

      <Reveal className="relative mx-auto max-w-2xl text-center">
        <ScrambleText
          as="h2"
          text="Need a software solution?"
          className="mt-3 block text-4xl font-bold tracking-tight text-bone sm:text-6xl"
        />
        <ScrambleText
          as="p"
          text="I'm taking on a small number of consulting clients. Tell me what you're building and let's see if we're a fit."
          className="mx-auto mt-5 block max-w-xl text-lg text-ash"
        />

        <a
          href={`mailto:${site.email}`}
          className="mt-10 inline-flex items-center gap-2 rounded-full bg-neon-magenta px-8 py-4 text-base font-semibold text-ink shadow-[0_0_40px_-8px_#ff2d95] transition hover:brightness-110"
        >
          <ScrambleText text="Email me" />
          <span aria-hidden>→</span>
        </a>

        <p className="mt-6 text-sm text-ash">
          <ScrambleText text="or reach me directly at" />{" "}
          <a
            href={`mailto:${site.email}`}
            className="text-bone underline decoration-white/30 underline-offset-4 hover:decoration-neon-magenta"
          >
            <ScrambleText text={site.email} />
          </a>
        </p>

        <footer className="mt-20 border-t border-white/10 pt-8 text-xs text-ash">
          <ScrambleText text={`© ${new Date().getFullYear()} ${site.name} · ${site.domain}`} />
        </footer>
      </Reveal>
    </section>
  );
}
