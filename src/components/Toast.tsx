"use client";

import { useEffect, useState } from "react";

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
      style={{
        position: "fixed",
        bottom: 32,
        left: "50%",
        transform: show
          ? "translateX(-50%) translateY(0)"
          : "translateX(-50%) translateY(80px)",
        background: "var(--text)",
        color: "white",
        padding: "13px 22px",
        borderRadius: 10,
        fontSize: 13,
        fontWeight: 500,
        transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        zIndex: 999,
        whiteSpace: "nowrap",
        display: "flex",
        alignItems: "center",
        gap: 10,
        boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
      }}
    >
      <div
        style={{
          width: 18,
          height: 18,
          background: "var(--green-bg)",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
          <path d="M20 6L9 17l-5-5" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {message}
    </div>
  );
}
