import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "CPH Deals";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #09090b 0%, #18181b 50%, #09090b 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              fontSize: "72px",
              fontWeight: 900,
              color: "#fafafa",
              letterSpacing: "-2px",
            }}
          >
            CPH Deals
          </div>
        </div>
        <div
          style={{
            fontSize: "28px",
            color: "#a1a1aa",
            maxWidth: "700px",
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          Best deals on activities, food & entertainment in Copenhagen
        </div>
        <div
          style={{
            display: "flex",
            gap: "16px",
            marginTop: "40px",
          }}
        >
          <div
            style={{
              background: "rgba(16, 185, 129, 0.15)",
              color: "#34d399",
              padding: "8px 20px",
              borderRadius: "999px",
              fontSize: "20px",
              fontWeight: 600,
            }}
          >
            Activities
          </div>
          <div
            style={{
              background: "rgba(234, 138, 30, 0.15)",
              color: "#f5b840",
              padding: "8px 20px",
              borderRadius: "999px",
              fontSize: "20px",
              fontWeight: 600,
            }}
          >
            Food
          </div>
          <div
            style={{
              background: "rgba(147, 51, 234, 0.15)",
              color: "#a78bfa",
              padding: "8px 20px",
              borderRadius: "999px",
              fontSize: "20px",
              fontWeight: 600,
            }}
          >
            Entertainment
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
