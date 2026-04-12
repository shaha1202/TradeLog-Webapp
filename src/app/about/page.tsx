import type { Metadata } from "next";
import { AboutContent } from "./AboutContent";

export const metadata: Metadata = {
  title: "About Us — TradeLog",
  description:
    "TradeLog was built by a trader to solve trading indiscipline. Learn about our mission to empower disciplined trading through AI-driven insights.",
  alternates: { canonical: "https://gettradelog.com/about" },
};

export default function AboutPage() {
  return <AboutContent />;
}
