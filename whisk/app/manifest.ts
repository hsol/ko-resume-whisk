import type { MetadataRoute } from "next";

/**
 * PWA Web App Manifest.
 * Next.js App Router 컨벤션에 따라 이 파일이 /manifest.webmanifest 로 자동 노출되고
 * <link rel="manifest"> 태그가 layout 메타에 자동 주입된다.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "자소서 거품기",
    short_name: "거품기",
    description: "평범한 문장을 이력서·자소서 문체로 바꿔 보여 주는 거품기",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
