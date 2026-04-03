interface TestimonialCardProps {
  quote: string;
  name: string;
  role: string;
  initials: string;
}

export function TestimonialCard({
  quote,
  name,
  role,
  initials,
}: TestimonialCardProps) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-4">
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={i}
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 1L7.5 4.5H11L8 6.5L9 10L6 8L3 10L4 6.5L1 4.5H4.5L6 1Z"
              fill="var(--amber)"
            />
          </svg>
        ))}
      </div>
      <p className="text-sm text-text-2 font-dm-sans leading-relaxed flex-1">
        &ldquo;{quote}&rdquo;
      </p>
      <div className="flex items-center gap-3 pt-3 border-t border-border">
        <div className="w-8 h-8 rounded-full bg-surface2 border border-border flex items-center justify-center">
          <span className="text-xs font-dm-mono font-medium text-text-2">
            {initials}
          </span>
        </div>
        <div>
          <div className="text-xs font-medium text-text font-dm-sans">
            {name}
          </div>
          <div className="text-xs text-text-3 font-dm-sans">{role}</div>
        </div>
      </div>
    </div>
  );
}
