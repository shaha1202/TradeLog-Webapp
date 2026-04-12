import type { Metadata } from "next";
import { ContactContent } from "./ContactContent";

export const metadata: Metadata = {
  title: "Contact — TradeLog",
  description:
    "Get in touch with the TradeLog team. We're here to help with questions, feedback, or account support.",
  alternates: { canonical: "https://gettradelog.com/contact" },
};

export default function ContactPage() {
  return <ContactContent />;
}
