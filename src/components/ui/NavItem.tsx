"use client";

import Link from "next/link";

interface NavItemProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  isDark: boolean;
}

export default function NavItem({ href, label, icon, active, isDark }: NavItemProps) {
  const activeClasses = isDark
    ? "bg-surface3 border-border-dark text-text"
    : "bg-text border-transparent text-white";
  const inactiveClasses =
    "border-transparent text-text-2 hover:bg-surface2 hover:text-text";

  const iconClasses = active
    ? isDark
      ? "text-text opacity-100"
      : "text-white opacity-100"
    : "text-text-2 opacity-60";

  return (
    <Link
      href={href}
      className={[
        "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm border",
        "transition-all duration-150 mb-0.5 no-underline font-normal",
        active ? activeClasses : inactiveClasses,
      ].join(" ")}
    >
      <span className={`flex-shrink-0 ${iconClasses}`}>{icon}</span>
      {label}
    </Link>
  );
}
