"use client";

import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { useLanguage } from "@/lib/i18n";

export function ContactContent() {
  const { t } = useLanguage();
  const l = t.legal;

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-16 md:py-24">
        <div className="mb-12">
          <p className="text-xs font-dm-mono text-text-3 uppercase tracking-widest mb-3">
            {l.contactLabel}
          </p>
          <h1 className="font-fraunces font-light text-4xl md:text-5xl text-text leading-snug mb-4">
            {l.contactTitle}
          </h1>
          <p className="text-base text-text-2 font-dm-sans leading-relaxed max-w-xl">
            {l.contactDesc}
          </p>
        </div>

        <div className="bg-surface border border-border rounded-xl p-8 mb-8">
          <a
            href={`mailto:${l.contactEmail}`}
            className="text-xl font-dm-sans font-medium text-teal hover:opacity-80 transition-opacity"
          >
            {l.contactEmail}
          </a>
          <p className="text-sm text-text-3 font-dm-sans mt-3">
            {l.contactNote}
          </p>
        </div>

        <div className="pt-4 border-t border-border flex gap-4">
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
