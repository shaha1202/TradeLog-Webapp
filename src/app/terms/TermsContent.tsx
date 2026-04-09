"use client";

import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { useLanguage } from "@/lib/i18n";

export function TermsContent() {
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
            {l.termsTitle}
          </h1>
          <p className="text-sm text-text-3 font-dm-sans">
            {l.lastUpdated}
          </p>
        </div>

        <div className="prose-tradelog">
          <Section title={l.t1Title}>
            <p>{l.t1Text1}</p>
            <p>{l.t1Text2}</p>
          </Section>

          <Section title={l.t2Title}>
            <p>{l.t2Text1}</p>
            <p>{l.t2Text2}</p>
          </Section>

          <Section title={l.t3Title}>
            <p>{l.t3Text1}</p>
            <p>{l.t3Text2}</p>
          </Section>

          <Section title={l.t4Title}>
            <p>{l.t4Text1}</p>
            <p>{l.t4Text2}</p>
          </Section>

          <Section title={l.t5Title}>
            <h3>{l.t5Sub1}</h3>
            <p>{l.t5Sub1Text}</p>
            <h3>{l.t5Sub2}</h3>
            <p>{l.t5Sub2Text1}</p>
            <p>{l.t5Sub2Text2}</p>
            <h3>{l.t5Sub3}</h3>
            <p>{l.t5Sub3Text1}</p>
            <p>{l.t5Sub3Text2}</p>
            <h3>{l.t5Sub4}</h3>
            <p>{l.t5Sub4Text}</p>
          </Section>

          <Section title={l.t6Title}>
            <p>{l.t6Text1}</p>
            <ul>
              <li>{l.t6List1}</li>
              <li>{l.t6List2}</li>
              <li>{l.t6List3}</li>
              <li>{l.t6List4}</li>
            </ul>
          </Section>

          <Section title={l.t7Title}>
            <p>{l.t7Text1}</p>
            <p>{l.t7Text2}</p>
          </Section>

          <Section title={l.t8Title}>
            <p>{l.t8Text1}</p>
            <ul>
              <li>{l.t8List1}</li>
              <li>{l.t8List2}</li>
              <li>{l.t8List3}</li>
              <li>{l.t8List4}</li>
              <li>{l.t8List5}</li>
            </ul>
          </Section>

          <Section title={l.t9Title}>
            <p>{l.t9Text1}</p>
            <p>{l.t9Text2}</p>
          </Section>

          <Section title={l.t10Title}>
            <p>{l.t10Text1}</p>
            <p>{l.t10Text2}</p>
          </Section>

          <Section title={l.t11Title}>
            <p>{l.t11Text1}</p>
            <p>{l.t11Text2}</p>
          </Section>

          <Section title={l.t12Title}>
            <p>{l.t12Text1}</p>
          </Section>

          <Section title={l.t13Title}>
            <p>{l.t13Text1}</p>
          </Section>

          <Section title={l.t14Title}>
            <p>{l.t14Text1}</p>
          </Section>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex gap-4">
          <Link
            href="/privacy"
            className="text-sm text-teal font-dm-sans hover:opacity-80 transition-opacity"
          >
            {l.viewPrivacy}
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
