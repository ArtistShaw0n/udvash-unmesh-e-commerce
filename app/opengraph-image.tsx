import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "উদ্ভাস-উন্মেষ — বাংলা শিক্ষামূলক বইয়ের অনলাইন বুকশপ";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #006D77 0%, #004D54 100%)",
          color: "#ffffff",
          padding: 80,
          textAlign: "center",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 36,
            opacity: 0.85,
            marginBottom: 12,
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          উদ্ভাস-উন্মেষ
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            lineHeight: 1.1,
            maxWidth: 1000,
            marginBottom: 24,
          }}
        >
          বাংলা শিক্ষামূলক বইয়ের অনলাইন বুকশপ
        </div>
        <div style={{ fontSize: 30, opacity: 0.85, maxWidth: 900 }}>
          একাডেমিক · এডমিশন · মডেল টেস্ট · ক্যাডেট · বৃত্তি
        </div>
        <div
          style={{
            marginTop: 60,
            padding: "12px 32px",
            background: "rgba(255,255,255,0.15)",
            borderRadius: 999,
            fontSize: 26,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span style={{ color: "#fde68a" }}>✓</span> ফ্রি ডেলিভারি · ৭ দিন রিটার্ন · COD
        </div>
      </div>
    ),
    { ...size },
  );
}
