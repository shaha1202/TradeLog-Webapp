import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "TradeLog — AI-Powered Trading Journal";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "#f7f5f0",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 72px",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background accent — top right */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -120,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "rgba(15,118,110,0.08)",
          }}
        />
        {/* Background accent — bottom left */}
        <div
          style={{
            position: "absolute",
            bottom: -80,
            left: -80,
            width: 280,
            height: 280,
            borderRadius: "50%",
            background: "rgba(15,118,110,0.05)",
          }}
        />

        {/* TOP: Logo + badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 12,
              background: "#0f766e",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
            }}
          >
            📈
          </div>
          <span
            style={{
              fontSize: 26,
              fontWeight: 600,
              color: "#1a1814",
              letterSpacing: "-0.5px",
            }}
          >
            TradeLog
          </span>
          <div
            style={{
              marginLeft: 8,
              background: "#ccfbf1",
              border: "1px solid #5eead4",
              borderRadius: 999,
              padding: "4px 14px",
              fontSize: 13,
              fontWeight: 500,
              color: "#0f766e",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#0f766e",
              }}
            />
            AI-Powered
          </div>
        </div>

        {/* MIDDLE: Headline + subtext */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 62,
              fontWeight: 700,
              color: "#1a1814",
              lineHeight: 1.1,
              letterSpacing: "-2px",
              maxWidth: 700,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>Your Trading Journal,</span>
            <span style={{ color: "#0f766e" }}>Powered by AI</span>
          </div>
          <div
            style={{
              fontSize: 22,
              color: "#6b6457",
              fontWeight: 400,
              maxWidth: 600,
              lineHeight: 1.5,
            }}
          >
            Track every trade. Analyze patterns. Improve with AI-driven
            insights — built for forex, crypto, and stock traders.
          </div>
        </div>

        {/* BOTTOM: Stats strip */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              paddingRight: 40,
              borderRight: "1px solid #e2ddd4",
            }}
          >
            <span style={{ fontSize: 32, fontWeight: 700, color: "#2d6a4f" }}>
              +67%
            </span>
            <span style={{ fontSize: 14, color: "#a09890" }}>
              Avg win rate improvement
            </span>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              padding: "0 40px",
              borderRight: "1px solid #e2ddd4",
            }}
          >
            <span style={{ fontSize: 32, fontWeight: 700, color: "#1a1814" }}>
              100%
            </span>
            <span style={{ fontSize: 14, color: "#a09890" }}>
              Free to start
            </span>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              paddingLeft: 40,
            }}
          >
            <span style={{ fontSize: 32, fontWeight: 700, color: "#1a1814" }}>
              AI
            </span>
            <span style={{ fontSize: 14, color: "#a09890" }}>
              Chart analysis built in
            </span>
          </div>
          <div
            style={{
              marginLeft: "auto",
              fontSize: 16,
              color: "#a09890",
              fontWeight: 500,
            }}
          >
            gettradelog.com
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
