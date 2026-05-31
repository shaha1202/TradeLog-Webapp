import { MetadataRoute } from "next";

const disallowPrivate = [
  "/journal/",
  "/stats/",
  "/settings/",
  "/api/",
  "/auth/",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Default: all crawlers
      {
        userAgent: "*",
        allow: ["/"],
        disallow: disallowPrivate,
      },
      // Google
      {
        userAgent: "Googlebot",
        allow: ["/"],
        disallow: disallowPrivate,
      },
      // Bing
      {
        userAgent: "Bingbot",
        allow: ["/"],
        disallow: disallowPrivate,
      },
      // Apple
      {
        userAgent: "applebot",
        allow: ["/"],
        disallow: disallowPrivate,
      },
      // OpenAI / ChatGPT
      {
        userAgent: "GPTBot",
        allow: ["/"],
        disallow: ["/journal/", "/stats/", "/settings/", "/api/"],
      },
      {
        userAgent: "OAI-SearchBot",
        allow: ["/"],
        disallow: ["/journal/", "/stats/", "/settings/", "/api/"],
      },
      {
        userAgent: "ChatGPT-User",
        allow: ["/"],
        disallow: ["/journal/", "/stats/", "/settings/", "/api/"],
      },
      // Anthropic / Claude
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
      // Perplexity
      {
        userAgent: "PerplexityBot",
        allow: ["/"],
        disallow: ["/journal/", "/stats/", "/settings/", "/api/"],
      },
      // Cohere
      {
        userAgent: "cohere-ai",
        allow: ["/"],
        disallow: ["/journal/", "/stats/", "/settings/", "/api/"],
      },
      // Meta AI
      {
        userAgent: "Meta-ExternalAgent",
        allow: ["/"],
        disallow: ["/journal/", "/stats/", "/settings/", "/api/"],
      },
      // ByteDance
      {
        userAgent: "Bytespider",
        allow: ["/"],
        disallow: ["/journal/", "/stats/", "/settings/", "/api/"],
      },
      // Social previews
      {
        userAgent: "Twitterbot",
        allow: ["/"],
        disallow: ["/journal/", "/stats/", "/settings/", "/api/"],
      },
      {
        userAgent: "LinkedInBot",
        allow: ["/"],
        disallow: ["/journal/", "/stats/", "/settings/", "/api/"],
      },
      {
        userAgent: "facebookexternalhit",
        allow: ["/"],
        disallow: ["/journal/", "/stats/", "/settings/", "/api/"],
      },
    ],
    sitemap: "https://gettradelog.com/sitemap.xml",
  };
}
