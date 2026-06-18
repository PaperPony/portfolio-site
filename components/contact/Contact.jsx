import { site } from "@/content/site";
import Reveal from "@/components/ui/Reveal";

export default function Contact() {
  return (
    <section
      id="contact"
      className="relative overflow-hidden border-t border-white/10 bg-ink px-6 py-28 sm:py-40"
    >
      {/* Soft neon glow behind the CTA. */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-neon-magenta/15 blur-[120px]" />

      <Reveal className="relative mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-neon-ember">
          Let's build something
        </p>
        <h2 className="mt-3 text-4xl font-bold tracking-tight text-bone sm:text-6xl">
          Have a project in mind?
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg text-ash">
          I'm taking on a small number of consulting clients. Tell me what you're
          building and let's see if we're a fit.
        </p>

        <a
          href={`mailto:${site.email}`}
          className="mt-10 inline-flex items-center gap-2 rounded-full bg-neon-magenta px-8 py-4 text-base font-semibold text-ink shadow-[0_0_40px_-8px_#ff2d95] transition hover:brightness-110"
        >
          Email me
          <span aria-hidden>→</span>
        </a>

        <p className="mt-6 text-sm text-ash">
          or reach me directly at{" "}
          <a
            href={`mailto:${site.email}`}
            className="text-bone underline decoration-white/30 underline-offset-4 hover:decoration-neon-magenta"
          >
            {site.email}
          </a>
        </p>

        <footer className="mt-20 border-t border-white/10 pt-8 text-xs text-ash">
          © {new Date().getFullYear()} {site.name} · {site.domain}
        </footer>
      </Reveal>
    </section>
  );
}
