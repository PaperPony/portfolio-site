import Reveal from "@/components/ui/Reveal";
import ScrambleText from "@/components/ui/ScrambleText";
import ProjectStack from "@/components/portfolio/ProjectStack";

export default function Portfolio() {
  return (
    <section
      id="portfolio"
      className="bg-grid relative border-t border-white/10 bg-ink px-6 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <ScrambleText
            as="p"
            text="Recent work"
            className="block text-sm font-medium uppercase tracking-[0.3em] text-neon-cobalt"
          />
          <ScrambleText
            as="h2"
            text="Selected projects"
            className="mt-3 block text-4xl font-bold tracking-tight text-bone sm:text-5xl"
          />
        </Reveal>

        <ProjectStack />
      </div>
    </section>
  );
}
