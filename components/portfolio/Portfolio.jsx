import { projects } from "@/content/projects";
import Reveal from "@/components/ui/Reveal";
import ProjectCard from "@/components/portfolio/ProjectCard";

export default function Portfolio() {
  return (
    <section
      id="portfolio"
      className="bg-grid relative border-t border-white/10 bg-ink px-6 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-neon-cobalt">
            Recent work
          </p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight text-bone sm:text-5xl">
            Selected projects
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {projects.map((project, i) => (
            <Reveal key={project.title} delay={i * 0.05}>
              <ProjectCard project={project} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
