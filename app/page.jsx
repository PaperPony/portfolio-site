import { Hero, StatusBar, Portfolio, About, Contact } from "@/components";

export default function Home() {
  return (
    <main className="relative">
      {/* Persistent "what I'm doing right now" indicator. */}
      <StatusBar />

      {/* 1. Hero with the GPU paint-splatter scene. */}
      <Hero />

      {/* 2. About + portrait. */}
      <About />

      {/* 3. Portfolio. */}
      <Portfolio />

      {/* 4. Contact. */}
      <Contact />
    </main>
  );
}
