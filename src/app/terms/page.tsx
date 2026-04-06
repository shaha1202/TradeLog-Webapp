import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Terms of Service — TradeLog",
  description: "Terms and conditions for using the TradeLog trading journal.",
  alternates: { canonical: "https://gettradelog.com/terms" },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-16 md:py-24">
        <div className="mb-10">
          <p className="text-xs font-dm-mono text-text-3 uppercase tracking-widest mb-3">
            Legal
          </p>
          <h1 className="font-fraunces font-light text-4xl text-text leading-snug mb-3">
            Terms of Service
          </h1>
          <p className="text-sm text-text-3 font-dm-sans">
            Last updated: June 2025
          </p>
        </div>

        <div className="prose-tradelog">
          <Section title="1. Acceptance of Terms">
            <p>
              By accessing or using TradeLog (&quot;the Service&quot;), you agree to
              be bound by these Terms of Service. If you do not agree, do not
              use the Service.
            </p>
            <p>
              The Service is operated by TradeLog (&quot;we&quot;, &quot;us&quot;, or
              &quot;our&quot;). These terms apply to all users, including free and
              paid subscribers.
            </p>
          </Section>

          <Section title="2. Description of Service">
            <p>
              TradeLog is a web-based trading journal that allows users to log
              trades, analyse performance statistics, and receive AI-powered
              insights. The Service is provided &quot;as is&quot; and is intended for
              personal, non-commercial use by individual traders.
            </p>
            <p>
              TradeLog is <strong>not</strong> a financial advisory service. The
              AI-generated insights and statistics are for informational purposes
              only and should not be construed as financial advice. Trading
              involves significant risk of loss.
            </p>
          </Section>

          <Section title="3. Account Registration">
            <p>
              You must provide a valid email address to create an account. You
              are responsible for maintaining the confidentiality of your account
              credentials and for all activity under your account.
            </p>
            <p>
              You must be at least 18 years old to use the Service. By creating
              an account, you confirm that you meet this requirement.
            </p>
          </Section>

          <Section title="4. Free Plan & Limitations">
            <p>
              The Free plan allows you to log up to <strong>3 trades</strong>{" "}
              (lifetime limit) and access basic statistics. AI chart analysis is
              included on the Free plan.
            </p>
            <p>
              We reserve the right to modify the features and limits of the Free
              plan at any time with reasonable notice.
            </p>
          </Section>

          <Section title="5. Pro Subscription">
            <h3>5.1 Billing</h3>
            <p>
              The Pro plan is billed at <strong>$14 USD per month</strong>.
              Payments are processed by Lemon Squeezy. By subscribing, you
              authorise Lemon Squeezy to charge your payment method on a
              recurring monthly basis.
            </p>

            <h3>5.2 Cancellation</h3>
            <p>
              You may cancel your Pro subscription at any time through your
              Lemon Squeezy customer portal. After cancellation, your Pro access
              remains active until the end of the current billing period. Your
              account then reverts to the Free plan limits.
            </p>
            <p>
              To access your Lemon Squeezy customer portal, use the link
              provided in your subscription confirmation email, or contact us at{" "}
              <a href="mailto:support@gettradelog.com">
                support@gettradelog.com
              </a>
              .
            </p>

            <h3>5.3 Refund Policy</h3>
            <p>
              <strong>All sales are final. We do not offer refunds</strong> for
              any subscription payments, partial months, or unused periods.
              TradeLog is a digital service and access is granted immediately
              upon payment.
            </p>
            <p>
              If you believe you were charged in error, contact us at{" "}
              <a href="mailto:support@gettradelog.com">
                support@gettradelog.com
              </a>{" "}
              within 7 days of the charge and we will review your case.
            </p>

            <h3>5.4 Price Changes</h3>
            <p>
              We reserve the right to change subscription prices. You will be
              notified at least 30 days in advance of any price increase. If you
              do not cancel before the price change takes effect, you agree to
              the new price.
            </p>
          </Section>

          <Section title="6. AI-Powered Features">
            <p>
              TradeLog uses Anthropic&apos;s Claude AI to provide chart analysis
              and trading insights. You acknowledge that:
            </p>
            <ul>
              <li>
                AI-generated content may contain errors or inaccuracies.
              </li>
              <li>
                AI insights are not financial advice and should not be relied
                upon for trading decisions.
              </li>
              <li>
                Chart screenshots you upload are processed by Anthropic&apos;s
                API and are subject to their usage policies.
              </li>
              <li>
                AI availability depends on third-party services and may
                occasionally be unavailable.
              </li>
            </ul>
          </Section>

          <Section title="7. User Content">
            <p>
              You retain ownership of all trade data and notes you enter into
              TradeLog. By using the Service, you grant us a limited licence to
              store, process, and display your content solely for the purpose of
              operating the Service.
            </p>
            <p>
              You must not upload content that is illegal, harmful, or violates
              third-party rights. We reserve the right to remove content or
              suspend accounts that violate these terms.
            </p>
          </Section>

          <Section title="8. Prohibited Use">
            <p>You agree not to:</p>
            <ul>
              <li>Use the Service for any unlawful purpose</li>
              <li>
                Attempt to reverse-engineer, scrape, or exploit the Service
              </li>
              <li>Share your account credentials with others</li>
              <li>
                Use automated tools to access the Service without prior written
                permission
              </li>
              <li>
                Misrepresent your identity or affiliation with any person or
                organisation
              </li>
            </ul>
          </Section>

          <Section title="9. Disclaimer of Warranties">
            <p>
              The Service is provided &quot;as is&quot; without warranties of any kind,
              either express or implied. We do not warrant that the Service will
              be uninterrupted, error-free, or free of viruses.
            </p>
            <p>
              <strong>
                TradeLog is not responsible for any trading losses incurred
                while using the Service.
              </strong>{" "}
              All trading decisions are your own.
            </p>
          </Section>

          <Section title="10. Limitation of Liability">
            <p>
              To the maximum extent permitted by law, TradeLog shall not be
              liable for any indirect, incidental, special, or consequential
              damages arising from your use of the Service, even if we have been
              advised of the possibility of such damages.
            </p>
            <p>
              Our total liability to you for any claims arising from use of the
              Service shall not exceed the amount you paid to us in the 3 months
              preceding the claim.
            </p>
          </Section>

          <Section title="11. Termination">
            <p>
              We reserve the right to suspend or terminate your account at any
              time for violation of these Terms, with or without notice. Upon
              termination, your right to use the Service ceases immediately.
            </p>
            <p>
              You may delete your account at any time via{" "}
              <strong>Settings → Clear data</strong>, or by contacting us at{" "}
              <a href="mailto:support@gettradelog.com">
                support@gettradelog.com
              </a>
              .
            </p>
          </Section>

          <Section title="12. Governing Law">
            <p>
              These Terms are governed by and construed in accordance with
              applicable laws. Any disputes will be resolved through good-faith
              negotiation. If unresolved, disputes shall be submitted to
              binding arbitration.
            </p>
          </Section>

          <Section title="13. Changes to Terms">
            <p>
              We may update these Terms from time to time. Material changes will
              be notified via email or an in-app notice at least 14 days before
              taking effect. Continued use of the Service after changes
              constitutes acceptance.
            </p>
          </Section>

          <Section title="14. Contact">
            <p>
              For questions about these Terms, contact us at{" "}
              <a href="mailto:support@gettradelog.com">
                support@gettradelog.com
              </a>
              .
            </p>
          </Section>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex gap-4">
          <Link
            href="/privacy"
            className="text-sm text-teal font-dm-sans hover:opacity-80 transition-opacity"
          >
            Privacy Policy →
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
