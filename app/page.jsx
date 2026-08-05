import { Hero, StatusBar, Portfolio, About, Faq, Contact, CursorTrail } from "@/components";

export default function Home() {
  return (
    <main className="relative">
      {/* Faint aurora cursor trail over the whole page. */}
      <CursorTrail />

      {/* Persistent "what I'm doing right now" indicator. */}
      <StatusBar />

      {/* 1. Hero with the GPU paint-splatter scene. */}
      <Hero />

      {/* 2. About + portrait. */}
      <About />

      {/* 3. Portfolio. */}
      <Portfolio />

      {/* 4. FAQ. */}
      <Faq />

      {/* 5. Contact. */}
      <Contact />
    </main>
  );
}
