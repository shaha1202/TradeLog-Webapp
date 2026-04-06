import { PricingCard } from "./PricingCard";

export function PricingSection() {
  return (
    <section id="pricing" className="bg-surface2 border-y border-border">
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="max-w-md mb-12 mx-auto text-center">
          <p className="text-xs font-dm-mono text-text-3 uppercase tracking-widest mb-3">
            Narxlar
          </p>
          <h2 className="font-fraunces font-light text-3xl text-text leading-snug">
            Sodda narxlar,
            <br />
            maksimal natija.
          </h2>
          <p className="text-sm text-text-2 font-dm-sans mt-3 leading-relaxed">
            Boshlash bepul, professional darajaga chiqish esa juda oson.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <PricingCard
            plan="free"
            name="Free"
            price="Bepul"
            description="Jurnallashtirishni boshlash uchun zarur bo'lgan hamma narsa."
            features={[
              "3 ta trade (Lifetime limit)",
              "AI Screenshot Scan",
              "Asosiy statistika",
            ]}
            cta="Hozir boshlash"
          />
          <PricingCard
            plan="pro"
            name="Pro"
            price="$14"
            period="/oy"
            description="Cheksiz trade va chuqur AI tahlil istagan traderlar uchun."
            features={[
              "Cheksiz tradelar",
              "AI Trading Coach",
              "Psixologiya Tahlili & Mood Heatmap",
              "Deep Leak Detection",
              "Chuqur AI Feedback",
              "Shaxsiy checklistlar",
            ]}
            cta="Pro'ga o'tish"
            highlighted
          />
        </div>
      </div>
    </section>
  );
}
