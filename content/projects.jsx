// Portfolio projects. Add an entry here and it shows up in the grid.
// `accent` must be one of the neon palette keys: magenta | purple | cobalt | ember | lime
// TODO: replace placeholders with real projects + images in /public/projects.
export const projects = [
  {
    title: "Atlas Dashboard",
    blurb:
      "Real-time analytics dashboard for a logistics startup. Sub-second data streaming and a fully custom charting layer.",
    tags: ["Next.js", "WebSockets", "D3"],
    accent: "cobalt",
    image: "/projects/placeholder-1.svg",
    links: [{ label: "Case study", href: "#" }],
  },
  {
    title: "Verse AI Assistant",
    blurb:
      "Retrieval-augmented support assistant that cut a client's ticket volume by 40%. Built on a tuned LLM pipeline.",
    tags: ["AI", "RAG", "Python"],
    accent: "magenta",
    image: "/projects/placeholder-2.svg",
    links: [{ label: "Overview", href: "#" }],
  },
  {
    title: "Tempo Mobile",
    blurb:
      "Cross-platform habit-tracking app with offline-first sync and a playful, gesture-driven interface.",
    tags: ["React Native", "Expo", "SQLite"],
    accent: "lime",
    image: "/projects/placeholder-3.svg",
    links: [{ label: "App store", href: "#" }],
  },
  {
    title: "Prism Commerce",
    blurb:
      "Headless storefront with a custom checkout and a content pipeline that lets non-devs ship landing pages.",
    tags: ["Next.js", "Stripe", "Headless CMS"],
    accent: "ember",
    image: "/projects/placeholder-4.svg",
    links: [{ label: "Visit site", href: "#" }],
  },
];

export default projects;
