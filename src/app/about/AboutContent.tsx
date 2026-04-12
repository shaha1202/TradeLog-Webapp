"use client";

import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { useLanguage } from "@/lib/i18n";

export function AboutContent() {
  const { t } = useLanguage();
  const l = t.legal;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.gettradelog.com";

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-16 md:py-24">
        <div className="mb-12">
          <p className="text-xs font-dm-mono text-text-3 uppercase tracking-widest mb-3">
            {l.aboutLabel}
          </p>
          <h1 className="font-fraunces font-light text-4xl md:text-5xl text-text leading-snug mb-4">
            {l.aboutTitle}
          </h1>
          <p className="text-base text-text-2 font-dm-sans leading-relaxed max-w-xl">
            {l.aboutSub}
          </p>
        </div>

        <div className="space-y-8">
          <Section title={l.aboutS1Title}>
            <p>{l.aboutS1Text}</p>
          </Section>

          <Section title={l.aboutS2Title}>
            <p>{l.aboutS2Text}</p>
          </Section>

          <Section title={l.aboutS3Title}>
            <p>{l.aboutS3Text}</p>
          </Section>

          <Section title={l.aboutS4Title}>
            <p>{l.aboutS4Text}</p>
          </Section>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <a
            href={`${appUrl}/login`}
            className="inline-flex items-center gap-2 text-sm font-dm-sans font-medium text-teal hover:opacity-80 transition-opacity"
          >
            {l.aboutCta} →
          </a>
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
      <div className="space-y-3 text-sm text-text-2 font-dm-sans leading-relaxed">
        {children}
      </div>
    </div>
  );
}
