import { ImageResponse } from "next/og";

export const alt = "jewebsiteonline.be — professionele websites voor KMO's";
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
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          backgroundColor: "#FAF5F0",
          backgroundImage:
            "radial-gradient(ellipse 55% 70% at 85% 20%, rgba(192,127,99,0.28), transparent 60%), radial-gradient(ellipse 40% 50% at 10% 90%, rgba(27,48,34,0.08), transparent 55%)",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 36,
            fontWeight: 600,
            color: "#1B3022",
            letterSpacing: "-0.02em",
          }}
        >
          jewebsiteonline
          <span style={{ color: "#C07F63" }}>.be</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              display: "flex",
              fontSize: 64,
              fontWeight: 600,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              color: "#1B3022",
              maxWidth: 920,
            }}
          >
            Professionele websites voor Belgische KMO&apos;s
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 28,
              color: "#4A5C52",
              maxWidth: 780,
              lineHeight: 1.35,
            }}
          >
            Gratis preview binnen 48 uur · vanaf €199
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 22,
            fontWeight: 600,
            color: "#C07F63",
          }}
        >
          Vraag uw preview aan
        </div>
      </div>
    ),
    { ...size },
  );
}
