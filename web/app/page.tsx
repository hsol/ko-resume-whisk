import type { Metadata } from "next";

import { ResumeWhiskApp } from "@/components/resume-whisk-app";

const OG_COPY_QUERY_MAX = 560;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata(props: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const sp = await props.searchParams;
  const raw = sp.copy;
  const copy =
    typeof raw === "string"
      ? raw.trim()
      : Array.isArray(raw)
        ? (raw[0] ?? "").trim()
        : "";

  const params = new URLSearchParams();
  if (copy.length > 0) {
    params.set("copy", copy.slice(0, OG_COPY_QUERY_MAX));
  }
  const imagePath = copy.length > 0 ? `/api/og?${params.toString()}` : "/api/og";

  return {
    openGraph: {
      images: [
        {
          url: imagePath,
          width: 1200,
          height: 630,
          alt: "자소서 거품기",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "자소서 거품기",
      images: [imagePath],
    },
  };
}

export default function Home() {
  return <ResumeWhiskApp />;
}
