export const VIDEO_MODELS = {
  "bytedance-seedance-v2.5": {
    label: "Seedance 2.5",
    description: "Sharper realism, up to 30s. Default.",
    pricePerSecondUsd: 0.41,
    minDuration: 4,
    maxDuration: 30,
    resolution: "720p",
  },
  "minimax-h3-max": {
    label: "MiniMax H3 Max",
    description: "Near-instant, up to 768p, audio-backed.",
    pricePerSecondUsd: 0.2,
    minDuration: 5,
    maxDuration: 15,
    resolution: "768p",
  },
} as const

export type VideoModelId = keyof typeof VIDEO_MODELS

export const DEFAULT_VIDEO_MODEL: VideoModelId = "bytedance-seedance-v2.5"

export const VIDEO_ASPECT_RATIOS = ["16:9", "9:16", "1:1", "21:9"] as const

export type VideoAspectRatio = (typeof VIDEO_ASPECT_RATIOS)[number]

export const VIDEO_DURATIONS = [5, 8, 12, 15, 30] as const

export function resolveVideoModel(value: string | undefined | null): VideoModelId {
  if (value && value in VIDEO_MODELS) return value as VideoModelId
  return DEFAULT_VIDEO_MODEL
}

export function resolveVideoAspect(value: string | undefined | null): VideoAspectRatio {
  if (value === "16:9" || value === "1280x720" || value === "1792x1024") return "16:9"
  if (value === "9:16" || value === "720x1280" || value === "1024x1792") return "9:16"
  if (value === "1:1" || value === "21:9") return value
  return "16:9"
}

export function resolveVideoDuration(model: VideoModelId, value: number | undefined | null): number {
  const spec = VIDEO_MODELS[model]
  const requested = value && value > 0 ? Math.round(value) : 5
  return Math.min(spec.maxDuration, Math.max(spec.minDuration, requested))
}

export function videoModelLabel(model: string): string {
  if (model in VIDEO_MODELS) return VIDEO_MODELS[model as VideoModelId].label
  return model
}

export function formatVideoPrice(model: VideoModelId, seconds: number): string {
  const amount = VIDEO_MODELS[model].pricePerSecondUsd * seconds
  return `~$${amount.toFixed(2)} for ${seconds}s`
}
