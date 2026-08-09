import { ImageResponse } from "next/og";
import { site } from "@/lib/config/site";

export const alt = site.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          backgroundColor: "#0f766e",
          color: "#fafaf9",
          padding: 72,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              borderRadius: 9999,
              backgroundColor: "#ffffff",
              color: "#0f766e",
              fontSize: 30,
              fontWeight: 800,
            }}
          >
            MSI
          </div>
          <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: 1 }}>MSI AUDIO</div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            maxWidth: 900,
          }}
        >
          <div style={{ fontSize: 62, fontWeight: 800, lineHeight: 1.1 }}>{site.tagline}</div>
          <div style={{ fontSize: 28, lineHeight: 1.5, color: "#ccfbf1" }}>{site.description}</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
