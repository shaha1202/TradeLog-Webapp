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
    "best trading journal app",
    "trading journal with AI feedback",
    "AI trade analysis tool",
    "forex trading performance tracker",
    "trading journal for beginners",
    "trading improvement tool",
    "AI powered trade review",
    "trading chart analysis AI",
    "win rate tracker",
    "risk reward journal",
    "trade journaling software",
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
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                name: "TradeLog",
                url: "https://gettradelog.com",
                logo: "https://gettradelog.com/logo.png",
                description:
                  "AI-powered trading journal to track, analyze, and improve your trades. Supports forex, crypto, and stock markets with AI chart analysis and performance statistics.",
                applicationCategory: "FinanceApplication",
                operatingSystem: "Web",
                offers: {
                  "@type": "Offer",
                  price: "0",
                  priceCurrency: "USD",
                  description: "Free plan available, Pro plan with AI features",
                },
                featureList: [
                  "AI chart analysis",
                  "Trade journaling",
                  "Performance statistics",
                  "Win rate tracking",
                  "Risk/reward analysis",
                  "Multi-language support",
                  "Forex trading journal",
                  "Crypto trading journal",
                  "Stock trading journal",
                ],
                screenshot: "https://gettradelog.com/opengraph-image",
                aggregateRating: {
                  "@type": "AggregateRating",
                  ratingValue: "4.9",
                  ratingCount: "120",
                },
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "TradeLog",
                url: "https://gettradelog.com",
                description:
                  "The AI-powered trading journal for forex, crypto, and stock traders.",
                potentialAction: {
                  "@type": "SearchAction",
                  target: {
                    "@type": "EntryPoint",
                    urlTemplate: "https://gettradelog.com/login",
                  },
                  "query-input": "required name=search_term_string",
                },
              },
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "TradeLog",
                url: "https://gettradelog.com",
                logo: "https://gettradelog.com/logo.png",
                sameAs: ["https://gettradelog.com"],
                description:
                  "TradeLog builds AI-powered tools to help traders track performance and improve results.",
              },
              {
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: [
                  {
                    "@type": "Question",
                    name: "What is TradeLog?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "TradeLog is an AI-powered trading journal that helps forex, crypto, and stock traders track every trade, analyze performance patterns, and improve their results with instant AI feedback and chart analysis.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "Is TradeLog free to use?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Yes, TradeLog offers a free plan that lets you log up to 3 trades. The Pro plan unlocks unlimited trades, AI chart analysis, advanced statistics, and personalized AI feedback.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "Which markets does TradeLog support?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "TradeLog supports all major markets including forex (currency pairs), cryptocurrency, and stocks. You can log trades from any broker or exchange.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "How does TradeLog's AI feedback work?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "TradeLog uses Claude AI (by Anthropic) to analyze your TradingView chart screenshots and trade details. It identifies patterns, evaluates your entry/exit quality, and gives actionable suggestions to improve your trading strategy.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "What statistics does TradeLog track?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "TradeLog tracks win rate, total P&L, average risk/reward ratio, best and worst trades, trade frequency, and performance trends over time — all visualized in a clean dashboard.",
                    },
                  },
                ],
              },
            ]),
          }}
        />
        <ThemeProvider>
          <LanguageProvider>{children}</LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
