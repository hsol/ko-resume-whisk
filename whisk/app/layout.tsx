import type { Metadata, Viewport } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Geist, Geist_Mono } from "next/font/google";

import { GaRoutePath } from "@/components/ga-route-path";
import "./globals.css";

/** 서버: `GA_MEASUREMENT_ID`, 클라이언트 번들 노출용: `NEXT_PUBLIC_GA_MEASUREMENT_ID`. 비어 있으면 GA 비활성. */
const gaMeasurementId =
  process.env.GA_MEASUREMENT_ID?.trim() ||
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ||
  "";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "자소서 거품기",
  description: "평범한 문장을 이력서·자소서 문체로 바꿔 보여 주는 거품기",
  applicationName: "자소서 거품기",
  appleWebApp: {
    capable: true,
    title: "자소서 거품기",
    statusBarStyle: "default",
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
