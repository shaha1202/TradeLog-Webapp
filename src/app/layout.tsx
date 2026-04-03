import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";

export const metadata: Metadata = {
  metadataBase: new URL("https://gettradelog.com"),
  title: {
    default: "TradeLog — AI-Powered Trading Journal",
    template: "%s | TradeLog",
  },
  description:
    "Track, analyze, and improve your trades with AI-powered insights. Built for forex, crypto, and stock traders. Upload charts, get instant AI feedback.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "https://gettradelog.com",
    siteName: "TradeLog",
    title: "TradeLog — AI-Powered Trading Journal",
    description:
      "Track, analyze, and improve your trades with AI-powered insights. Built for forex, crypto, and stock traders.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "TradeLog — AI-Powered Trading Journal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TradeLog — AI-Powered Trading Journal",
    description:
      "Track, analyze, and improve your trades with AI-powered insights.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  applicationName: "TradeLog",
  keywords: [
    "trading journal",
    "AI trading journal",
    "forex trading journal",
    "trade tracker",
    "trading performance analytics",
    "crypto trading journal",
    "stock trading journal",
    "trade analysis app",
  ],
  authors: [{ name: "TradeLog", url: "https://gettradelog.com" }],
  creator: "TradeLog",
  publisher: "TradeLog",
  category: "Finance",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                var t = localStorage.getItem('theme') || 'light';
                document.documentElement.setAttribute('data-theme', t);
              })()
            `,
          }}
        />
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "TradeLog",
              url: "https://gettradelog.com",
              description:
                "AI-powered trading journal to track, analyze, and improve your trades. Supports forex, crypto, and stock markets with AI chart analysis and performance statistics.",
              applicationCategory: "FinanceApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
                description: "Free plan available",
              },
              featureList: [
                "AI chart analysis",
                "Trade journaling",
                "Performance statistics",
                "Win rate tracking",
                "Risk/reward analysis",
                "Multi-language support",
              ],
              screenshot: "https://gettradelog.com/opengraph-image",
            }),
          }}
        />
        <ThemeProvider>
          <LanguageProvider>{children}</LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
