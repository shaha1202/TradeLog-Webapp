import type { Metadata } from "next";
import { PrivacyContent } from "./PrivacyContent";

export const metadata: Metadata = {
  title: "Privacy Policy — TradeLog",
  description: "How TradeLog collects, uses, and protects your trading data.",
  alternates: { canonical: "https://gettradelog.com/privacy" },
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}
