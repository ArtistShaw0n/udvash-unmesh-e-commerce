import { ImageResponse } from "next/og";
import { getBookBySlug } from "@/lib/books";

export const runtime = "edge";
export const alt = "Product detail — উদ্ভাস-উন্মেষ";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface Props {
  params: { slug: string };
}

export default async function OG({ params }: Props) {
  const book = getBookBySlug(params.slug);

  if (!book) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#0f172a",
            color: "white",
            fontSize: 64,
            fontFamily: "sans-serif",
          }}
        >
          উদ্ভাস-উন্মেষ
        </div>
      ),
      { ...size },
    );
  }

  const discount =
    book.oldPrice && book.oldPrice > book.price
      ? Math.round(((book.oldPrice - book.price) / book.oldPrice) * 100)
      : 0;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "linear-gradient(135deg, #fffaf2 0%, #fde7c4 60%, #f3b97a 100%)",
          color: "#1a1a1a",
          padding: 60,
          fontFamily: "sans-serif",
        }}
      >
        {/* Left — book cover mock */}
        <div
          style={{
            width: 320,
            height: 460,
            background: "#006D77",
            borderRadius: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            boxShadow: "0 30px 60px rgba(0,0,0,0.25)",
            marginRight: 60,
            padding: 24,
          }}
        >
          <div style={{ fontSize: 22, opacity: 0.85, marginBottom: 12 }}>
            {book.categoryLabel.toUpperCase()}
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 800,
              textAlign: "center",
              lineHeight: 1.2,
            }}
          >
            {book.titleBn}
          </div>
        </div>

        {/* Right — info */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: 22,
              color: "#666",
              letterSpacing: 1,
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            {book.author}
          </div>
          <div
            style={{
              fontSize: 56,
              fontWeight: 800,
              lineHeight: 1.15,
              color: "#3D3D3D",
              marginBottom: 20,
              maxWidth: 700,
            }}
          >
            {book.title}
          </div>
          <div
            style={{ display: "flex", alignItems: "baseline", gap: 16, marginTop: 8 }}
          >
            <div style={{ fontSize: 64, fontWeight: 800, color: "#3D3D3D" }}>
              ৳{book.price}
            </div>
            {book.oldPrice && (
              <div
                style={{
                  fontSize: 32,
                  color: "#A4A4A4",
                  textDecoration: "line-through",
                }}
              >
                ৳{book.oldPrice}
              </div>
            )}
            {discount > 0 && (
              <div
                style={{
                  padding: "6px 18px",
                  background: "#E02D15",
                  color: "white",
                  fontSize: 22,
                  fontWeight: 700,
                  borderRadius: 999,
                }}
              >
                {discount}% ছাড়
              </div>
            )}
          </div>
          {book.freeDelivery && (
            <div
              style={{
                marginTop: 32,
                padding: "10px 24px",
                background: "rgba(0,109,119,0.15)",
                color: "#006D77",
                fontSize: 24,
                fontWeight: 700,
                borderRadius: 8,
                alignSelf: "flex-start",
              }}
            >
              ✓ ফ্রি ডেলিভারি
            </div>
          )}
          <div
            style={{
              marginTop: 40,
              fontSize: 28,
              color: "#006D77",
              fontWeight: 700,
            }}
          >
            উদ্ভাস-উন্মেষ
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
