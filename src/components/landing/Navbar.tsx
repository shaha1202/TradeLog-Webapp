"use client";

import Link from "next/link";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useLanguage } from "@/lib/i18n";
import { useNavbarScroll } from "@/lib/hooks";

export function Navbar() {
  const { t } = useLanguage();
  const l = t.landing;
  const scrolled = useNavbarScroll();

  return (
    <nav
      className={[
        "sticky top-0 z-50 border-b transition-all duration-300",
        scrolled
          ? "bg-bg/95 backdrop-blur-md shadow-sm border-border-dark"
          : "bg-bg border-border",
      ].join(" ")}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 no-underline">
          <span className="font-fraunces text-xl font-medium text-text flex items-center gap-2">
            <span className="w-2 h-2 bg-teal rounded-full inline-block animate-shimmer" />
            TradeLog
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-6">
          <a
            href="/#features"
            className="nav-link text-sm text-text-2 hover:text-text transition-colors font-dm-sans"
          >
            {l.features}
          </a>
          <a
            href="/#pricing"
            className="nav-link text-sm text-text-2 hover:text-text transition-colors font-dm-sans"
          >
            {l.pricing}
          </a>
          <a
            href="/#story"
            className="nav-link text-sm text-text-2 hover:text-text transition-colors font-dm-sans"
          >
            {l.about}
          </a>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSelector />
          <a
            href={`${process.env.NEXT_PUBLIC_APP_URL}/login`}
            className="hidden sm:block text-sm text-text-2 hover:text-text transition-colors font-dm-sans"
          >
            {l.signIn}
          </a>
          <a
            href={`${process.env.NEXT_PUBLIC_APP_URL}/login`}
            className="text-sm font-medium bg-teal text-white px-3 sm:px-4 py-1.5 rounded-lg hover:opacity-90 transition-opacity font-dm-sans whitespace-nowrap"
          >
            {l.startFree}
          </a>
        </div>
      </div>
    </nav>
  );
}
