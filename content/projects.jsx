// Portfolio projects. Add an entry here and it shows up in the grid.
// `accent` must be one of the neon palette keys: magenta | purple | cobalt | ember | lime
export const projects = [
  {
    title: "Decorz",
    blurb:
      "An AI interior decorator app. Snap a photo of any room, pick a style, and Decorz redesigns the space with a list of real, shoppable products. Live on the App Store for iOS devices.",
    tags: ["SwiftUI", "Flask", "Gemini AI", "Google Cloud"],
    accent: "ember",
    image: "/projects/decorz.webp",
    links: [
      {
        label: "App Store",
        href: "https://apps.apple.com/us/app/decorz-ai-room-designer/id6760203110",
      },
    ],
  },
  {
    title: "dominickvarano.io",
    blurb:
      "This website! Not much else to say other than that!",
    tags: ["Next.js", "React Three Fiber", "Motion", "Tailwind", "Vercel"],
    accent: "magenta",
    image: "/projects/portfolio-site.webp",
    links: [{ label: "You're looking at it", href: "/" }],
  },
  {
    title: "Lunchbox",
    blurb:
      "A shared lunch planner for families, currently in development. Parents create or join a family and use a real-time calendar to coordinate meal packing for their  kids. Snap a photo and an AI scanner auto-fills the items.",
    tags: ["Swift", "Firebase", "OpenAI"],
    accent: "purple",
    image: "/projects/lunchbox.webp",
    links: [],
  },
  {
    title: "Solidif.ai",
    blurb:
      "A SaaS platform to helps creators, writers, and small businesses optimize their content for AI searches.",
    tags: ["Next.js", "AWS", "Cohere", "Stripe", "Vercel"],
    accent: "cobalt",
    image: "/projects/solidifai.webp",
    links: [],
  },
];

export default projects;
