import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: ["/journal/", "/stats/", "/settings/", "/api/", "/auth/"],
      },
      {
        userAgent: "GPTBot",
        allow: ["/"],
        disallow: ["/journal/", "/stats/", "/settings/", "/api/"],
      },
      {
        userAgent: "PerplexityBot",
        allow: ["/"],
        disallow: ["/journal/", "/stats/", "/settings/", "/api/"],
      },
      {
        userAgent: "anthropic-ai",
        allow: ["/"],
        disallow: ["/journal/", "/stats/", "/settings/", "/api/"],
      },
      {
        userAgent: "ClaudeBot",
        allow: ["/"],
        disallow: ["/journal/", "/stats/", "/settings/", "/api/"],
      },
    ],
    sitemap: "https://gettradelog.com/sitemap.xml",
  };
}
