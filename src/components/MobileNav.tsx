"use client";

import { usePathname } from "next/navigation";

export default function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/journal",
      label: "Jurnal",
      icon: <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
        <path d="M2 4h12M2 8h8M2 12h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    },
    {
      href: "/journal/new",
      label: "Yangi",
      isMain: true,
      icon: <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 5v6M5 8h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    },
    {
      href: "/stats",
      label: "Statistika",
      icon: <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
        <path d="M2 13V8l3 3 3-4 5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    },
    {
      href: "/settings",
      label: "Sozlamalar",
      icon: <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
        <path d="M6.5 1.5H9.5L10 3.5C10.4 3.7 10.8 3.9 11.1 4.2L13 3.5L14.5 6L13 7.2C13 7.5 13 7.7 13 8C13 8.3 13 8.5 13 8.8L14.5 10L13 12.5L11.1 11.8C10.8 12.1 10.4 12.3 10 12.5L9.5 14.5H6.5L6 12.5C5.6 12.3 5.2 12.1 4.9 11.8L3 12.5L1.5 10L3 8.8C3 8.5 3 8.3 3 8C3 7.7 3 7.5 3 7.2L1.5 6L3 3.5L4.9 4.2C5.2 3.9 5.6 3.7 6 3.5L6.5 1.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
        <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" />
      </svg>
    },
  ];

  const isActive = (href: string) => {
    if (href === "/journal") {
      return pathname === "/journal" || (pathname.startsWith("/journal/") && !pathname.startsWith("/journal/new"));
    }
    if (href === "/journal/new") return pathname === "/journal/new";
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border md:hidden z-50">
      <div className="flex items-center justify-around py-2 px-1">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-lg transition-all duration-150 no-underline ${
                item.isMain
                  ? active
                    ? "bg-text text-white"
                    : "bg-teal text-white hover:opacity-90"
                  : active
                  ? "bg-surface3 text-text"
                  : "text-text-2 hover:bg-surface2 hover:text-text"
              }`}
            >
              <div className={item.isMain ? "w-5 h-5" : "w-4 h-4"}>
                {item.icon}
              </div>
              <span className="text-[10px] mt-0.5 font-medium font-dm-sans">{item.label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
