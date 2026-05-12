import type { Metadata } from "next";

import { ResumeWhiskApp } from "@/components/resume-whisk-app";

export const metadata: Metadata = {
  openGraph: {
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "자소서 거품기",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "자소서 거품기",
    images: ["/api/og"],
  },
};

export default function Home() {
  return <ResumeWhiskApp />;
}
