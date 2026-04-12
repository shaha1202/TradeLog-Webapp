"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n";
import { useScrollReveal } from "@/lib/hooks";

export function Footer() {
  const { t } = useLanguage();
  const l = t.landing;
  const { ref: contentRef } = useScrollReveal<HTMLDivElement>({ threshold: 0.05 });

  return (
    <footer className="border-t border-border">
      <div ref={contentRef} className="max-w-6xl mx-auto px-6 py-12 reveal">
        {/* 4-column grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-10">
          {/* Column 1: Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded-md bg-teal flex items-center justify-center flex-shrink-0">
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
            </div>
            <p className="text-xs text-text-3 font-dm-sans mb-2">
              {l.footerTagline}
            </p>
            <p className="text-xs text-text-3 font-dm-sans leading-relaxed">
              {l.footerMission}
            </p>
          </div>

          {/* Column 2: Product */}
          <div>
            <p className="text-xs font-dm-sans font-medium text-text uppercase tracking-widest mb-4">
              {l.footerProduct}
            </p>
            <ul className="space-y-3">
              <li>
                <a
                  href="/#features"
                  className="text-xs text-text-3 hover:text-text transition-colors font-dm-sans"
                >
                  {l.features}
                </a>
              </li>
              <li>
                <a
                  href="/#pricing"
                  className="text-xs text-text-3 hover:text-text transition-colors font-dm-sans"
                >
                  {l.pricing}
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <p className="text-xs font-dm-sans font-medium text-text uppercase tracking-widest mb-4">
              {l.footerCompany}
            </p>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-xs text-text-3 hover:text-text transition-colors font-dm-sans"
                >
                  {l.footerAbout}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-xs text-text-3 hover:text-text transition-colors font-dm-sans"
                >
                  {l.footerContact}
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-xs text-text-3 hover:text-text transition-colors font-dm-sans"
                >
                  {l.privacyPolicy}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-xs text-text-3 hover:text-text transition-colors font-dm-sans"
                >
                  {l.termsOfService}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Social */}
          <div>
            <p className="text-xs font-dm-sans font-medium text-text uppercase tracking-widest mb-4">
              {l.footerSocial}
            </p>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://t.me/gettradelog"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-text-3 hover:text-text transition-colors font-dm-sans group"
                >
                  <TelegramIcon />
                  {l.footerTelegram}
                </a>
              </li>
              <li>
                <a
                  href="https://x.com/gettradelog"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-text-3 hover:text-text transition-colors font-dm-sans group"
                >
                  <XIcon />
                  {l.footerX}
                </a>
              </li>
              <li>
                <a
                  href="https://www.threads.com/@gettradelog"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-text-3 hover:text-text transition-colors font-dm-sans group"
                >
                  <ThreadsIcon />
                  {l.footerThreads}
                </a>
              </li>
              <li>
                <a
                  href="https://discord.gg/gnQ5jsSbKt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-text-3 hover:text-text transition-colors font-dm-sans group"
                >
                  <DiscordIcon />
                  {l.footerDiscord}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border pt-6">
          {/* Financial Disclaimer */}
          <p className="text-[11px] text-text-3 font-dm-sans leading-relaxed mb-4 max-w-3xl">
            {l.footerDisclaimer}
          </p>

          {/* Bottom row: support + copyright */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <a
              href="mailto:support@gettradelog.com"
              className="text-xs text-text-3 hover:text-text transition-colors font-dm-sans"
            >
              {l.footerSupport}
            </a>
            <span className="text-xs text-text-3 font-dm-sans">
              {l.footerCopyright}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function TelegramIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

function ThreadsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 192 192" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M141.537 88.988a66.667 66.667 0 0 0-2.518-1.143c-1.482-27.307-16.403-42.94-41.457-43.1h-.34c-14.986 0-27.449 6.396-35.12 18.035l13.422 9.215c5.73-8.694 14.723-10.548 21.699-10.548h.23c8.392.054 14.733 2.493 18.84 7.25 2.99 3.504 4.992 8.347 5.988 14.494a110.148 110.148 0 0 0-24.078-2.057c-24.16 1.4-39.69 15.568-38.79 35.228.458 10.05 5.277 18.698 13.556 24.333 7.02 4.833 16.078 7.202 25.504 6.698 12.43-.676 22.189-5.4 29.01-14.042 5.143-6.559 8.396-15.063 9.853-25.82 5.908 3.565 10.283 8.266 12.703 13.995 4.16 9.973 4.406 26.375-8.543 39.323-11.39 11.392-25.074 16.312-45.757 16.458-22.959-.163-40.312-7.547-51.591-21.94C24.16 138.974 18.52 120.467 18.3 96.9c.22-23.568 5.86-42.075 16.757-55.023C46.336 28.483 63.69 21.1 86.648 20.937c23.127.164 40.8 7.589 52.529 22.082 5.793 7.184 10.139 16.247 12.93 26.94l15.37-4.1c-3.394-12.81-8.868-23.93-16.37-33.19C137.027 14.03 115.496 4.27 86.69 4.069h-.065C58.042 4.27 36.25 14.08 22.083 33.19 9.533 50.26 3.05 74.143 2.8 96.875v.25c.25 22.73 6.733 46.613 19.283 63.684C36.25 179.92 58.042 189.73 86.625 189.93h.065c25.902-.175 44.14-6.964 59.18-22.004 19.55-19.55 18.96-44.006 12.527-59.02-4.573-10.974-13.322-19.958-16.86-19.918z"/>
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  );
}
