"use client";

import { useEffect } from "react";

interface ToastProps {
  message: string;
  show: boolean;
  onHide: () => void;
}

export default function Toast({ message, show, onHide }: ToastProps) {
  useEffect(() => {
    if (show) {
      const t = setTimeout(onHide, 3000);
      return () => clearTimeout(t);
    }
  }, [show, onHide]);

  return (
    <div
      className={[
        "fixed bottom-8 left-1/2 -translate-x-1/2 z-[999]",
        "bg-text text-bg px-5 py-3 rounded-xl",
        "text-sm font-medium whitespace-nowrap",
        "flex items-center gap-2.5",
        "shadow-[0_8px_32px_rgba(0,0,0,0.2)]",
        "transition-[transform] duration-[400ms] [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]",
        show ? "translate-y-0" : "translate-y-20",
      ].join(" ")}
    >
      <div className="w-[18px] h-[18px] bg-green-bg rounded-full flex items-center justify-center shrink-0">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
          <path
            d="M20 6L9 17l-5-5"
            stroke="var(--green)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {message}
    </div>
  );
}
