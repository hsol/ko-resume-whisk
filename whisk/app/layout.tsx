import type { Metadata, Viewport } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";

import { GaRoutePath } from "@/components/ga-route-path";
import { Toaster } from "@/components/ui/sonner";
import { OG_IMAGE_PATH, OG_IMAGE_SIZE } from "@/lib/og-image";
import {
  SEO_KEYWORDS,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
} from "@/lib/site-seo";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

/** `NEXT_PUBLIC_GA_MEASUREMENT_ID`가 있을 때만 GA4 로드. 비어 있으면 비활성. */
const gaMeasurementId =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || "";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    template: `%s - ${SITE_NAME}`,
    default: SITE_TITLE,
  },
  description: SITE_DESCRIPTION,
  keywords: [...SEO_KEYWORDS],
  applicationName: SITE_NAME,
  category: "productivity",
  creator: "hsol.info",
  publisher: "hsol.info",
  authors: [{ name: "hsol.info" }],

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    url: "/",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    locale: "ko_KR",
    images: [
      {
        url: OG_IMAGE_PATH,
        ...OG_IMAGE_SIZE,
        type: "image/png",
        alt: SITE_NAME,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE_PATH],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },

  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: "default",
  },

  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },

  // verification 토큰은 환경 변수로 주입한다(로컬·preview 빌드 누수 방지).
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    other: {
      "naver-site-verification":
        process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION ?? "",
    },
  },

  // icons/manifest 는 app/icon.svg, app/apple-icon.png, app/favicon.ico, app/manifest.ts 로부터
  // Next.js 가 자동 주입한다. 명시적 선언은 두지 않는다(중복 방지).
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0f0f" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster />
        {gaMeasurementId ? (
          <>
            <GoogleAnalytics gaId={gaMeasurementId} />
            <GaRoutePath gaId={gaMeasurementId} />
          </>
        ) : null}
        <Analytics />
      </body>
    </html>
  );
}
