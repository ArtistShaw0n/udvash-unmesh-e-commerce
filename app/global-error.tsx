"use client";

import { useEffect } from "react";

/**
 * Root-level error boundary. Renders when even the root layout fails,
 * so this file deliberately produces its own <html><body> and ships a
 * minimal style block — no provider tree, no fonts, no Tailwind layer.
 */
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    console.error("[global-error]", error);
  }, [error]);

  return (
    <html lang="bn">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, -apple-system, 'Hind Siliguri', sans-serif",
          background: "#020617",
          color: "#f8fafc",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 480 }}>
          <h1 style={{ fontSize: 28, marginBottom: 12 }}>সিস্টেম এ একটি গুরুতর সমস্যা হয়েছে</h1>
          <p style={{ opacity: 0.8, marginBottom: 24 }}>
            দয়া করে কিছুক্ষণ পরে আবার চেষ্টা করুন।
          </p>
          <a
            href="/"
            style={{
              display: "inline-block",
              padding: "12px 24px",
              background: "#006D77",
              color: "white",
              borderRadius: 6,
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            হোমে যান
          </a>
        </div>
      </body>
    </html>
  );
}
