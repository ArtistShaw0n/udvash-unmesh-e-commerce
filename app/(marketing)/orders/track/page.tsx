import type { Metadata } from "next";
import { TrackOrderPage } from "./_track-page";

export const metadata: Metadata = {
  title: "অর্ডার ট্র্যাক করুন",
  description:
    "অর্ডার আইডি ও ইমেইল দিয়ে আপনার অর্ডারের রিয়েল-টাইম স্ট্যাটাস দেখুন।",
};

export default function TrackPage() {
  return <TrackOrderPage />;
}
