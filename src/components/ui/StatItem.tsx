interface StatItemProps {
  label: string;
  value: string;
  color?: "g" | "r" | "";
}

export default function StatItem({ label, value, color = "" }: StatItemProps) {
  const valueColor =
    color === "g" ? "text-green" : color === "r" ? "text-red" : "text-text";

  return (
    <div className="flex justify-between items-center py-1.5 px-1">
      <span className="text-xs text-text-2">{label}</span>
      <span className={`font-dm-mono text-xs font-medium ${valueColor}`}>
        {value}
      </span>
    </div>
  );
}
