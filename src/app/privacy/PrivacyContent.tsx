"use client";

import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { useLanguage } from "@/lib/i18n";

export function PrivacyContent() {
  const { t } = useLanguage();
  const l = t.legal;

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-16 md:py-24">
        <div className="mb-10">
          <p className="text-xs font-dm-mono text-text-3 uppercase tracking-widest mb-3">
            {l.label}
          </p>
          <h1 className="font-fraunces font-light text-4xl text-text leading-snug mb-3">
            {l.privacyTitle}
          </h1>
          <p className="text-sm text-text-3 font-dm-sans">
            {l.lastUpdated}
          </p>
        </div>

        <div className="prose-tradelog">
          <Section title={l.p1Title}>
            <p>{l.p1Text1}</p>
            <p>{l.p1Text2}</p>
          </Section>

          <Section title={l.p2Title}>
            <h3>{l.p2Sub1}</h3>
            <p>{l.p2Sub1Text}</p>
            <h3>{l.p2Sub2}</h3>
            <p>{l.p2Sub2Text}</p>
            <h3>{l.p2Sub3}</h3>
            <p>{l.p2Sub3Text}</p>
            <h3>{l.p2Sub4}</h3>
            <p>{l.p2Sub4Text}</p>
            <h3>{l.p2Sub5}</h3>
            <p>{l.p2Sub5Text}</p>
          </Section>

          <Section title={l.p3Title}>
            <ul>
              <li>{l.p3List1}</li>
              <li>{l.p3List2}</li>
              <li>{l.p3List3}</li>
              <li>{l.p3List4}</li>
              <li>{l.p3List5}</li>
              <li>{l.p3List6}</li>
            </ul>
            <p>{l.p3Text1}</p>
          </Section>

          <Section title={l.p4Title}>
            <p>{l.p4Text1}</p>
            <ul>
              <li>{l.p4List1}</li>
              <li>{l.p4List2}</li>
              <li>{l.p4List3}</li>
            </ul>
            <p>{l.p4Text2}</p>
          </Section>

          <Section title={l.p5Title}>
            <p>{l.p5Text1}</p>
            <p>{l.p5Text2}</p>
          </Section>

          <Section title={l.p6Title}>
            <p>{l.p6Text1}</p>
          </Section>

          <Section title={l.p7Title}>
            <p>{l.p7Text1}</p>
            <ul>
              <li>{l.p7List1}</li>
              <li>{l.p7List2}</li>
              <li>{l.p7List3}</li>
              <li>{l.p7List4}</li>
            </ul>
          </Section>

          <Section title={l.p8Title}>
            <p>{l.p8Text1}</p>
          </Section>

          <Section title={l.p9Title}>
            <p>{l.p9Text1}</p>
            <ul>
              <li>{l.p9List1}</li>
              <li>{l.p9List2}</li>
              <li>{l.p9List3}</li>
              <li>{l.p9List4}</li>
            </ul>
            <p>{l.p9Text2}</p>
          </Section>

          <Section title={l.p10Title}>
            <p>{l.p10Text1}</p>
          </Section>

          <Section title={l.p11Title}>
            <p>{l.p11Text1}</p>
          </Section>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex gap-4">
          <Link
            href="/terms"
            className="text-sm text-teal font-dm-sans hover:opacity-80 transition-opacity"
          >
            {l.viewTerms}
          </Link>
          <Link
            href="/"
            className="text-sm text-text-3 font-dm-sans hover:text-text transition-colors"
          >
            {l.backToHome}
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-8">
      <h2 className="font-fraunces font-light text-xl text-text mb-3 pb-2 border-b border-border">
        {title}
      </h2>
      <div className="space-y-3 text-sm text-text-2 font-dm-sans leading-relaxed [&_h3]:text-[13px] [&_h3]:font-medium [&_h3]:text-text [&_h3]:mt-4 [&_h3]:mb-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_a]:text-teal [&_a]:no-underline [&_a:hover]:underline [&_strong]:text-text [&_strong]:font-medium">
        {children}
      </div>
    </div>
  );
}
