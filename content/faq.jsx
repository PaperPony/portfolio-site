// FAQ content — general service/process questions only (no pricing, no niche
// commitment). Mirrored exactly in the FAQPage JSON-LD in content/jsonld.jsx
// consumers, so keep question/answer text in sync with components/faq/Faq.jsx.
export const faq = {
  heading: "Frequently asked questions",
  items: [
    {
      question: "What does Dominick build?",
      answer:
        "Full-stack web apps, mobile apps, and AI systems, covering the user-facing interface, the backend, and the data and automation behind it. Work ranges from new builds to adding AI features to existing products.",
    },
    {
      question: "How does the process work?",
      answer:
        "Most engagements start with a short call to scope the problem, followed by a plan covering architecture, timeline, and milestones. From there it's iterative: build, review, and ship in stages so feedback shapes the product early.",
    },
    {
      question: "Does he work with remote clients?",
      answer:
        "Yes. Work is fully remote, with regular calls and written updates. Clients anywhere collaborate over scheduled calls, email, and shared tools.",
    },
    {
      question: "How do I get started?",
      answer:
        "Book a call or send an email describing what you want to build. Usually that leads to a short discovery call to sort out scope and fit.",
    },
  ],
};

export default faq;
