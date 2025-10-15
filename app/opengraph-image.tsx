import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "pubdev - AI-Powered Content Generation from codebase"
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "white",
        }}
      >
        {/* Content container */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "48px",
          }}
        >
          {/* Logo and brand */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "24px",
            }}
          >
            {/* Logo square */}
            <div
              style={{
                width: "120px",
                height: "120px",
                backgroundColor: "#1a1a1a",
                borderRadius: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "72px",
                fontWeight: "bold",
                color: "white",
              }}
            >
              P
            </div>

            {/* Brand name */}
            <div
              style={{
                fontSize: "96px",
                fontWeight: "bold",
                color: "#1a1a1a",
                letterSpacing: "-0.02em",
              }}
            >
              pubdev
            </div>
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: "40px",
              color: "#666",
              textAlign: "center",
              maxWidth: "800px",
              lineHeight: 1.3,
            }}
          >
            AI-Powered content generation from codebase
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}

