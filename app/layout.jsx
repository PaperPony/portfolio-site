import "./globals.css";
import { site } from "@/content/site";
import { buildJsonLd } from "@/content/jsonld";
import { Analytics } from "@vercel/analytics/next";

export const metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.role}`,
    template: `%s — ${site.name}`,
  },
  description: site.intro,
  alternates: {
    canonical: "/",
  },
  // index/follow are already the defaults; the preview and snippet directives are
  // the part that changes search behavior (larger image previews, no snippet cap).
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
  },
  openGraph: {
    type: "website",
    url: site.url,
    title: `${site.name} — ${site.role}`,
    description: site.intro,
    siteName: site.name,
    images: [{ url: site.ogImage, width: 1200, height: 630, alt: site.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.role}`,
    description: site.intro,
    images: [site.ogImage],
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export const viewport = {
  themeColor: "#0a0a0a",
};

export default function RootLayout({ children }) {
  const jsonLd = buildJsonLd();

  return (
    <html lang="en">
      <body>
        {/* Server-rendered entity graph (Person/Org/Service/WebSite/FAQPage) for AEO/GEO. */}
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
