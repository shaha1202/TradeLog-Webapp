import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TradeLog — AI-Powered Trading Journal",
    short_name: "TradeLog",
    description:
      "Track every trade, analyze patterns, and improve with AI-driven insights. Built for forex, crypto, and stock traders.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f5f0",
    theme_color: "#0f766e",
    icons: [
      {
        src: "/icon.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
