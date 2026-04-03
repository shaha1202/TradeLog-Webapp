"use client";

import Link from "next/link";

interface UserCardProps {
  initials: string;
  name: string;
  plan: string;
}

export default function UserCard({ initials, name, plan }: UserCardProps) {
  return (
    <Link
      href="/settings"
      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors duration-150 no-underline hover:bg-surface2"
    >
      <div className="w-8 h-8 rounded-lg bg-teal-bg border border-teal-br flex items-center justify-center text-sm font-semibold text-teal shrink-0 font-dm-mono">
        {initials}
      </div>
      <div className="min-w-0">
        <div className="text-sm font-medium text-text leading-snug truncate">
          {name}
        </div>
        <div className="text-[11px] text-text-3 mt-0.5">{plan}</div>
      </div>
    </Link>
  );
}
