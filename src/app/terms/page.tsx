import type { Metadata } from "next";
import { TermsContent } from "./TermsContent";

export const metadata: Metadata = {
  title: "Terms of Service — TradeLog",
  description: "Terms and conditions for using the TradeLog trading journal.",
  alternates: { canonical: "https://gettradelog.com/terms" },
};

export default function TermsPage() {
  return <TermsContent />;
}
