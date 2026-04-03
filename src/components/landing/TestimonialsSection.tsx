import { TestimonialCard } from "./TestimonialCard";

const testimonials = [
  {
    quote:
      "I tried three different journals before TradeLog. This is the first one I've actually stuck with. Logging a trade takes under a minute now.",
    name: "Marcus T.",
    role: "Forex trader · 3 years",
    initials: "MT",
  },
  {
    quote:
      "The win rate and R:R stats updating after each trade is a game changer. I can see in real time if I'm trading my plan or not.",
    name: "Priya K.",
    role: "Prop firm trader",
    initials: "PK",
  },
  {
    quote:
      "I was repeating the same mistakes for months without realising it. Three weeks with TradeLog and I could see the pattern clearly.",
    name: "Daniel R.",
    role: "Swing trader · Indices",
    initials: "DR",
  },
  {
    quote:
      "The AI chart analysis is wild. I upload the screenshot and it fills in everything. I just add my notes and I'm done.",
    name: "Aisha O.",
    role: "Day trader · Crypto",
    initials: "AO",
  },
];

export function TestimonialsSection() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <div className="max-w-md mb-12">
        <p className="text-xs font-dm-mono text-text-3 uppercase tracking-widest mb-3">
          Testimonials
        </p>
        <h2 className="font-fraunces font-light text-3xl text-text leading-snug">
          Traders who stopped
          <br />
          repeating mistakes.
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {testimonials.map((t, i) => (
          <TestimonialCard
            key={i}
            quote={t.quote}
            name={t.name}
            role={t.role}
            initials={t.initials}
          />
        ))}
      </div>
    </section>
  );
}
