import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "উদ্ভাস-উন্মেষ",
    short_name: "উদ্ভাস",
    description: "বাংলা শিক্ষামূলক বই ও সামগ্রীর অনলাইন বুকশপ",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#006D77",
    orientation: "portrait-primary",
    lang: "bn",
    categories: ["education", "books", "shopping"],
    icons: [
      {
        src: "/udvash-logo.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
    shortcuts: [
      {
        name: "বই দেখুন",
        short_name: "Products",
        url: "/products",
      },
      {
        name: "অর্ডার ট্র্যাক",
        short_name: "Track",
        url: "/orders/track",
      },
      {
        name: "আমার অর্ডার",
        short_name: "Orders",
        url: "/account/orders",
      },
    ],
  };
}
