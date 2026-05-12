import type { Metadata } from "next";

import { ResumeWhiskApp } from "@/components/resume-whisk-app";
import { isUuidV4 } from "@/lib/snapshot-id";

const OG_SIZE = { width: 1200, height: 630 } as const;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ snapshot?: string }>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const snap = sp.snapshot;
  const ogUrl =
    snap && isUuidV4(snap)
      ? `/api/og?snapshot=${encodeURIComponent(snap)}`
      : "/api/og";

  return {
    openGraph: {
      images: [
        {
          url: ogUrl,
          ...OG_SIZE,
          alt: "자소서 거품기",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "자소서 거품기",
      images: [ogUrl],
    },
  };
}

export default function Home() {
  return <ResumeWhiskApp />;
}
