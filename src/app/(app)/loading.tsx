export default function Loading() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 32, height: 32, border: "2.5px solid var(--border)",
          borderTopColor: "var(--teal)", borderRadius: "50%",
          animation: "spin 0.7s linear infinite", margin: "0 auto 16px",
        }} />
      </div>
    </div>
  );
}
