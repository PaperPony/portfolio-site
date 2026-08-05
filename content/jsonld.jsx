// Builds the site-wide JSON-LD entity graph (Person, Organization, Service,
// WebSite) injected as a single <script type="application/ld+json"> in the
// root layout. Kept as one @graph so every node can cross-reference by @id.
import { site } from "@/content/site";
import { faq } from "@/content/faq";

const personId = `${site.url}/#person`;
const orgId = `${site.url}/#organization`;
const serviceId = `${site.url}/#service`;
const websiteId = `${site.url}/#website`;
const faqId = `${site.url}/#faq`;

export function buildJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": personId,
        name: "Dominick Varano",
        jobTitle: "Software Engineer / Full-Stack Developer",
        url: site.url,
        email: site.email,
        image: `${site.url}/portrait.webp`,
        sameAs: [
          "https://www.linkedin.com/in/dominick-varano-software-engineer",
          "https://github.com/PaperPony",
          "https://x.com/Dominick_Varano",
          site.url,
        ],
      },
      {
        "@type": "Organization",
        "@id": orgId,
        name: site.name,
        url: site.url,
        logo: `${site.url}/og.svg`,
        email: site.email,
        areaServed: "US",
        founder: { "@id": personId },
      },
      {
        "@type": "Service",
        "@id": serviceId,
        name: "Web, Mobile & AI Application Development",
        provider: { "@id": orgId },
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        name: site.name,
        url: site.url,
      },
      {
        "@type": "FAQPage",
        "@id": faqId,
        mainEntity: faq.items.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
  };
}

export default buildJsonLd;
