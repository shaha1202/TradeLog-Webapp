
interface PricingCardProps {
  plan: "free" | "pro";
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
  popular?: string;
}

export function PricingCard({
  name,
  price,
  period,
  description,
  features,
  cta,
  highlighted = false,
  popular = "Popular",
}: PricingCardProps) {
  return (
    <div
      className={`rounded-2xl border p-6 flex flex-col gap-6 card-hover ${
        highlighted
          ? "bg-teal-bg border-teal-br hover:-translate-y-1 hover:scale-[1.01]"
          : "bg-surface border-border"
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <span
            className={`text-xs font-dm-mono uppercase tracking-wider ${
              highlighted ? "text-teal" : "text-text-3"
            }`}
          >
            {name}
          </span>
          {highlighted && (
            <span className="text-xs font-dm-mono bg-teal text-white px-2 py-0.5 rounded-full">
              {popular}
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-1 mb-2">
          <span
            className={`text-3xl font-dm-mono font-medium ${
              highlighted ? "text-teal" : "text-text"
            }`}
          >
            {price}
          </span>
          {period && (
            <span className="text-sm text-text-3 font-dm-sans">{period}</span>
          )}
        </div>
        <p className="text-sm text-text-2 font-dm-sans leading-relaxed">
          {description}
        </p>
      </div>

      <ul className="flex flex-col gap-2.5">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2">
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mt-0.5 shrink-0"
            >
              <path
                d="M2.5 7L5.5 10L11.5 4"
                stroke={highlighted ? "var(--teal)" : "var(--green)"}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-sm text-text-2 font-dm-sans">{f}</span>
          </li>
        ))}
      </ul>

      <a
        href={`${process.env.NEXT_PUBLIC_APP_URL}/login`}
        className={`w-full text-center text-sm font-medium font-dm-sans py-2.5 rounded-lg transition-all hover:opacity-90 active:scale-95 ${
          highlighted
            ? "bg-teal text-white"
            : "bg-surface2 border border-border text-text"
        }`}
      >
        {cta}
      </a>
    </div>
  );
}
