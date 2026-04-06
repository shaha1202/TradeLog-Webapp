"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n";

export function Footer() {
  const { t } = useLanguage();
  const l = t.landing;

  return (
    <footer className="border-t border-border">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-teal flex items-center justify-center">
            <svg
              width="11"
              height="11"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 10L5.5 6.5L8 9L12 4"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="text-sm font-dm-sans font-medium text-text">
            TradeLog
          </span>
          <span className="text-xs text-text-3 font-dm-sans ml-2">
            © {new Date().getFullYear()}
          </span>
        </div>

        <div className="flex items-center gap-5 flex-wrap justify-center">
          <a
            href="#features"
            className="text-xs text-text-3 hover:text-text transition-colors font-dm-sans"
          >
            {l.features}
          </a>
          <a
            href="#pricing"
            className="text-xs text-text-3 hover:text-text transition-colors font-dm-sans"
          >
            {l.pricing}
          </a>
          <a
            href="#story"
            className="text-xs text-text-3 hover:text-text transition-colors font-dm-sans"
          >
            {l.about}
          </a>
          <Link
            href="/privacy"
            className="text-xs text-text-3 hover:text-text transition-colors font-dm-sans"
          >
            {l.privacyPolicy}
          </Link>
          <Link
            href="/terms"
            className="text-xs text-text-3 hover:text-text transition-colors font-dm-sans"
          >
            {l.termsOfService}
          </Link>
          <Link
            href="/login"
            className="text-xs text-text-3 hover:text-text transition-colors font-dm-sans"
          >
            {l.signIn}
          </Link>
        </div>
      </div>
    </footer>
  );
}
