import { site } from "@/content/site";

export default function robots() {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      // Explicitly allow AI citation/answer-engine crawlers.
      { userAgent: "OAI-SearchBot", allow: "/" },
      { userAgent: "ChatGPT-User", allow: "/" },
      { userAgent: "Perplexity-User", allow: "/" },
      { userAgent: "Claude-Web", allow: "/" },
    ],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
