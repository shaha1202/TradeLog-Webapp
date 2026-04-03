import Link from "next/link";

export function Footer() {
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

        <div className="flex items-center gap-5">
          <Link
            href="/login"
            className="text-xs text-text-3 hover:text-text transition-colors font-dm-sans"
          >
            Sign in
          </Link>
          <a
            href="#features"
            className="text-xs text-text-3 hover:text-text transition-colors font-dm-sans"
          >
            Features
          </a>
          <a
            href="#pricing"
            className="text-xs text-text-3 hover:text-text transition-colors font-dm-sans"
          >
            Pricing
          </a>
          <a
            href="#story"
            className="text-xs text-text-3 hover:text-text transition-colors font-dm-sans"
          >
            About
          </a>
        </div>
      </div>
    </footer>
  );
}
