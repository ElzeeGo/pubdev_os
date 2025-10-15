import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "pubdev - AI-Powered Content Generation",
    short_name: "pubdev",
    description: "AI-powered content generation platform for X (Twitter). Create engaging tweets, analyze performance, and grow your audience with intelligent automation.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1a1a1a",
    icons: [
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  }
}

