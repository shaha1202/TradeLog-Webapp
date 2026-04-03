import Link from "next/link";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-bg border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo — matches Sidebar exactly */}
        <Link href="/" className="flex items-center gap-2 no-underline">
          <span className="font-fraunces text-xl font-medium text-text flex items-center gap-2">
            <span className="w-2 h-2 bg-teal rounded-full inline-block" />
            TradeLog
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-6">
          <a
            href="#features"
            className="text-sm text-text-2 hover:text-text transition-colors font-dm-sans"
          >
            Features
          </a>
          <a
            href="#pricing"
            className="text-sm text-text-2 hover:text-text transition-colors font-dm-sans"
          >
            Pricing
          </a>
          <a
            href="#story"
            className="text-sm text-text-2 hover:text-text transition-colors font-dm-sans"
          >
            About
          </a>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="hidden sm:block text-sm text-text-2 hover:text-text transition-colors font-dm-sans"
          >
            Sign in
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium bg-teal text-white px-3 sm:px-4 py-1.5 rounded-lg hover:opacity-90 transition-opacity font-dm-sans whitespace-nowrap"
          >
            Start free
          </Link>
        </div>
      </div>
    </nav>
  );
}
