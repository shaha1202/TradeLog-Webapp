interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-3 card-hover group">
      <div className="w-9 h-9 rounded-lg bg-surface2 border border-border flex items-center justify-center text-text-2 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-medium text-text font-dm-sans mb-1.5">
          {title}
        </h3>
        <p className="text-sm text-text-2 font-dm-sans leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
