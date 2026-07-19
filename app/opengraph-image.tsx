import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Helix. Research you can inspect.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background: "#0d0c0b",
          color: "#f1eee6",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ position: "absolute", width: 560, height: 560, border: "2px solid #f1eee6", borderRadius: 560, left: 690, top: 150 }} />
        <div style={{ position: "absolute", width: 540, height: 240, background: "#ff4a1f", left: 760, top: 195, transform: "rotate(-18deg)" }} />
        <div style={{ position: "absolute", width: 2, height: "100%", background: "rgba(241,238,230,.24)", left: 650, top: 0 }} />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 650, padding: "56px 58px" }}>
          <div style={{ display: "flex", fontFamily: "monospace", fontSize: 16, letterSpacing: 4, color: "#ff4a1f", textTransform: "uppercase" }}>
            HELIX / RESEARCH DESK
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 92, lineHeight: 0.94, letterSpacing: -5 }}>Research you can inspect.</div>
            <div style={{ marginTop: 30, fontFamily: "Arial, sans-serif", fontSize: 20, color: "#bcb6aa" }}>
              Evidence-backed briefs with a visible research trail.
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
