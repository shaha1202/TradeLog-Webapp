import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy — TradeLog",
  description: "How TradeLog collects, uses, and protects your trading data.",
  alternates: { canonical: "https://gettradelog.com/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-16 md:py-24">
        <div className="mb-10">
          <p className="text-xs font-dm-mono text-text-3 uppercase tracking-widest mb-3">
            Legal
          </p>
          <h1 className="font-fraunces font-light text-4xl text-text leading-snug mb-3">
            Privacy Policy
          </h1>
          <p className="text-sm text-text-3 font-dm-sans">
            Last updated: June 2025
          </p>
        </div>

        <div className="prose-tradelog">
          <Section title="1. Overview">
            <p>
              TradeLog (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates the website{" "}
              <a href="https://gettradelog.com">gettradelog.com</a> and the
              TradeLog web application. This Privacy Policy explains what
              information we collect, how we use it, and your rights regarding
              your data.
            </p>
            <p>
              By using TradeLog, you agree to the collection and use of
              information as described in this policy.
            </p>
          </Section>

          <Section title="2. Information We Collect">
            <h3>2.1 Account Information</h3>
            <p>
              When you create an account, we collect your email address and, if
              provided, your full name. Authentication is handled securely via
              Supabase.
            </p>

            <h3>2.2 Trading Journal Data</h3>
            <p>
              We collect the trading data you voluntarily enter into the app,
              including but not limited to: asset names, trade direction, entry
              and exit prices, stop-loss and take-profit levels, risk/reward
              ratio, P&amp;L, trade notes, mood tags, and checklist responses.
              This data is stored in your private account and is not shared with
              third parties.
            </p>

            <h3>2.3 Chart Screenshots</h3>
            <p>
              When you upload a chart screenshot for AI analysis, the image is
              sent to Anthropic&apos;s API for processing and immediately
              discarded — we do not store your screenshots on our servers.
            </p>

            <h3>2.4 Usage Data</h3>
            <p>
              We may collect basic usage data such as page visits and feature
              interactions to improve the product. This data is anonymised and
              aggregated.
            </p>

            <h3>2.5 Payment Information</h3>
            <p>
              Payments are processed by Lemon Squeezy. We do not store your
              credit card details. We receive confirmation of your subscription
              status from Lemon Squeezy via webhook.
            </p>
          </Section>

          <Section title="3. How We Use Your Information">
            <ul>
              <li>To provide and operate the TradeLog service</li>
              <li>To process AI analysis of your chart screenshots</li>
              <li>To calculate and display your trading statistics</li>
              <li>To manage your subscription and billing via Lemon Squeezy</li>
              <li>To send transactional emails (password reset, subscription receipts)</li>
              <li>To improve and develop the product</li>
            </ul>
            <p>We do not sell your data to third parties.</p>
          </Section>

          <Section title="4. AI Analysis & Data Processing">
            <p>
              TradeLog uses Anthropic&apos;s Claude AI to analyse chart
              screenshots and generate trade insights. When you upload a chart:
            </p>
            <ul>
              <li>
                The image is transmitted to Anthropic&apos;s API over an
                encrypted connection.
              </li>
              <li>
                The image is used solely to extract trade data (asset, entry,
                SL, TP, etc.) and is not stored by us.
              </li>
              <li>
                Anthropic&apos;s own{" "}
                <a
                  href="https://www.anthropic.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Privacy Policy
                </a>{" "}
                applies to data processed through their API.
              </li>
            </ul>
            <p>
              AI-generated narratives and feedback are stored in your journal as
              part of the trade record. You can delete any trade — and its
              associated AI content — at any time.
            </p>
          </Section>

          <Section title="5. Data Storage & Security">
            <p>
              Your data is stored in Supabase (PostgreSQL), hosted on
              infrastructure secured with row-level security (RLS) policies,
              meaning only you can access your own trade data.
            </p>
            <p>
              All data is transmitted over HTTPS. We apply industry-standard
              security practices, but no method of electronic transmission is
              100% secure.
            </p>
          </Section>

          <Section title="6. Data Retention">
            <p>
              Your data is retained as long as your account is active. You can
              delete all your trade data at any time via{" "}
              <strong>Settings → Clear data</strong>. To fully delete your
              account, contact us at{" "}
              <a href="mailto:support@gettradelog.com">
                support@gettradelog.com
              </a>
              .
            </p>
          </Section>

          <Section title="7. Third-Party Services">
            <p>We use the following third-party services:</p>
            <ul>
              <li>
                <strong>Supabase</strong> — database and authentication
              </li>
              <li>
                <strong>Anthropic (Claude)</strong> — AI chart analysis and
                insights
              </li>
              <li>
                <strong>Lemon Squeezy</strong> — payment processing and
                subscription management
              </li>
              <li>
                <strong>Vercel</strong> — hosting and deployment
              </li>
            </ul>
          </Section>

          <Section title="8. Cookies">
            <p>
              We use session cookies for authentication (managed by Supabase).
              We do not use advertising or tracking cookies.
            </p>
          </Section>

          <Section title="9. Your Rights">
            <p>You have the right to:</p>
            <ul>
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your account and data</li>
              <li>Export your trading data</li>
            </ul>
            <p>
              To exercise these rights, contact us at{" "}
              <a href="mailto:support@gettradelog.com">
                support@gettradelog.com
              </a>
              .
            </p>
          </Section>

          <Section title="10. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. Significant
              changes will be communicated via email or an in-app notice. Your
              continued use of TradeLog after changes constitutes acceptance.
            </p>
          </Section>

          <Section title="11. Contact">
            <p>
              For privacy-related questions, email us at{" "}
              <a href="mailto:support@gettradelog.com">
                support@gettradelog.com
              </a>
              .
            </p>
          </Section>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex gap-4">
          <Link
            href="/terms"
            className="text-sm text-teal font-dm-sans hover:opacity-80 transition-opacity"
          >
            Terms of Service →
          </Link>
          <Link
            href="/"
            className="text-sm text-text-3 font-dm-sans hover:text-text transition-colors"
          >
            ← Back to home
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
