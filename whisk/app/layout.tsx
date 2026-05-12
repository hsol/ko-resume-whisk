import type { Metadata, Viewport } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Geist, Geist_Mono } from "next/font/google";

import { GaRoutePath } from "@/components/ga-route-path";
import { Toaster } from "@/components/ui/sonner";
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

const SITE_NAME = "자소서 거품기";
const SITE_DESCRIPTION =
  "평범한 일상 업무 기록을 이력서·자기소개서 문체로 바꿔 보여 주는 거품기. 거꾸로 거품을 빼서 실제로 무슨 일을 했는지 환원해 주기도 합니다.";

const SEO_KEYWORDS = [
  "자소서 거품기",
  "자소서 거품",
  "자소서 문체 변환",
  "이력서 자동 작성",
  "자기소개서 변환",
  "자기소개서 거품",
  "자소서 도우미",
  "이력서 도우미",
  "취업 자소서",
  "경력기술서 변환",
  "자소서 번역",
  "자소서 디버블러",
  "AI 자소서",
  "AI 이력서",
  "이력서 거품기",
];

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    template: "%s - 자소서 거품기",
    default: SITE_NAME,
  },
  description: SITE_DESCRIPTION,
  keywords: SEO_KEYWORDS,
  applicationName: SITE_NAME,
  category: "productivity",
  creator: "yeol.dev",
  publisher: "yeol.dev",
  authors: [{ name: "yeol.dev" }],

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    url: "/",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    locale: "ko_KR",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ["/api/og"],
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
      </body>
    </html>
  );
}
