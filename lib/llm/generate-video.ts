import {
  DEFAULT_VIDEO_MODEL,
  resolveVideoAspect,
  resolveVideoDuration,
  resolveVideoModel,
  VIDEO_MODELS,
  type VideoAspectRatio,
  type VideoModelId,
} from "@/lib/llm/video-models"

const ELEVENLABS_VIDEO_URL = "https://api.elevenlabs.io/v1/flows/video"

export interface VideoGenerationInput {
  prompt: string
  model: VideoModelId | string
  duration: number
  size: VideoAspectRatio | string
  context?: {
    title?: string
    description?: string
  }
}

export interface VideoAsset {
  id: string
  prompt: string
  url?: string
  status: "queued" | "in_progress" | "completed" | "failed"
  progress?: number
  model: VideoModelId
  duration: number
  size: string
  created_at: string
  completed_at?: string
  error?: string
}

interface ElevenLabsGeneration {
  id: string
  status: "pending" | "generating" | "completed" | "failed"
  content_url?: string
  error_message?: string
  failure_reason?: string
}

function elevenLabsHeaders(): HeadersInit {
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY is not set")
  }

  return {
    "xi-api-key": apiKey,
    "Content-Type": "application/json",
  }
}

async function readElevenLabsError(response: Response): Promise<string> {
  const body = await response.text()
  try {
    const parsed = JSON.parse(body) as { detail?: unknown }
    const detail = parsed.detail
    if (typeof detail === "string") return detail
    if (Array.isArray(detail)) {
      const message = detail
        .map((item) => {
          if (item && typeof item === "object" && "msg" in item) return String(item.msg)
          return ""
        })
        .filter(Boolean)
        .join("; ")
      if (message) return message
    }
    if (detail && typeof detail === "object" && "message" in detail) {
      return String((detail as { message: unknown }).message)
    }
  } catch {
    // Fall through to the raw body.
  }

  return body.slice(0, 400) || response.statusText
}

function mapStatus(status: ElevenLabsGeneration["status"]): VideoAsset["status"] {
  if (status === "pending") return "queued"
  if (status === "generating") return "in_progress"
  if (status === "completed") return "completed"
  return "failed"
}

function toVideoAsset(
  generation: ElevenLabsGeneration,
  input: { prompt: string; model: VideoModelId; duration: number; size: string }
): VideoAsset {
  const asset: VideoAsset = {
    id: generation.id,
    prompt: input.prompt,
    status: mapStatus(generation.status),
    model: input.model,
    duration: input.duration,
    size: input.size,
    created_at: new Date().toISOString(),
  }

  if (generation.status === "failed") {
    asset.error = generation.error_message || generation.failure_reason || "Video generation failed"
  }

  if (generation.content_url) asset.url = generation.content_url

  return asset
}

/**
 * Start a video generation on ElevenLabs.
 * Seedance 2.5 is the default. MiniMax H3 Max is the faster, cheaper option.
 */
export async function generateVideo(input: VideoGenerationInput): Promise<VideoAsset> {
  const model = resolveVideoModel(input.model)
  const spec = VIDEO_MODELS[model]
  const duration = resolveVideoDuration(model, input.duration)
  const aspectRatio = resolveVideoAspect(input.size)

  const response = await fetch(ELEVENLABS_VIDEO_URL, {
    method: "POST",
    headers: elevenLabsHeaders(),
    body: JSON.stringify({
      model_id: model,
      prompt: input.prompt,
      duration_secs: duration,
      aspect_ratio: aspectRatio,
      resolution: spec.resolution,
      generate_audio: true,
    }),
  })

  if (!response.ok) {
    const message = await readElevenLabsError(response)
    if (model === "minimax-h3-max" && message.includes("does not match any of the expected tags")) {
      throw new Error(
        "MiniMax H3 Max is not available on the ElevenLabs video API yet. Use Seedance 2.5."
      )
    }
    throw new Error(message)
  }

  const generation = (await response.json()) as ElevenLabsGeneration

  return toVideoAsset(generation, {
    prompt: input.prompt,
    model,
    duration,
    size: aspectRatio,
  })
}

export async function pollVideoStatus(videoId: string): Promise<VideoAsset> {
  const response = await fetch(`${ELEVENLABS_VIDEO_URL}/${videoId}`, {
    headers: elevenLabsHeaders(),
  })

  if (!response.ok) {
    throw new Error(await readElevenLabsError(response))
  }

  const generation = (await response.json()) as ElevenLabsGeneration

  return toVideoAsset(generation, {
    prompt: "",
    model: DEFAULT_VIDEO_MODEL,
    duration: 0,
    size: "",
  })
}

export async function downloadVideo(videoId: string): Promise<{ buffer: Buffer; url: string }> {
  const video = await pollVideoStatus(videoId)
  if (!video.url) {
    throw new Error("Video is not ready to download")
  }

  const response = await fetch(video.url)
  if (!response.ok) {
    throw new Error("Failed to download the generated video")
  }

  const buffer = Buffer.from(await response.arrayBuffer())
  const url = `data:video/mp4;base64,${buffer.toString("base64")}`
  return { buffer, url }
}

export async function createAndPollVideo(
  input: VideoGenerationInput,
  onProgress?: (progress: number, status: string) => void
): Promise<VideoAsset> {
  try {
    let video = await generateVideo(input)

    while (video.status === "queued" || video.status === "in_progress") {
      await new Promise((resolve) => setTimeout(resolve, 10000))
      const polled = await pollVideoStatus(video.id)
      video = {
        ...polled,
        prompt: input.prompt,
        model: video.model,
        duration: video.duration,
        size: video.size,
      }

      if (onProgress) onProgress(video.progress ?? 0, video.status)
    }

    if (video.status === "completed") {
      const { url } = await downloadVideo(video.id)
      video.url = url
      video.completed_at = new Date().toISOString()
    }

    return video
  } catch (error) {
    console.error("[pubdev] Error in createAndPollVideo:", error)
    const model = resolveVideoModel(input.model)
    return {
      id: "error",
      prompt: input.prompt,
      status: "failed",
      model,
      duration: resolveVideoDuration(model, input.duration),
      size: resolveVideoAspect(input.size),
      created_at: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Failed to generate video",
    }
  }
}

export function buildVideoPrompt(context: {
  title?: string
  description?: string
  changes?: string[]
  videoStyle?: string
}): string {
  const hasDetailedStyle = context.videoStyle && context.videoStyle.length > 200

  if (hasDetailedStyle) {
    let prompt = ""

    if (context.title) prompt += `Feature: ${context.title}. `
    if (context.description && context.description !== context.title) {
      prompt += `${context.description}. `
    }
    prompt += context.videoStyle

    return prompt.trim()
  }

  let prompt = ""

  if (context.title || context.description) {
    const subject = context.title || context.description || "a product announcement"
    prompt += `A dynamic promotional video showcasing ${subject}. `
  }

  if (context.description && context.description !== context.title) {
    prompt += `${context.description}. `
  }

  if (context.changes && context.changes.length > 0) {
    prompt += `Featuring: ${context.changes.slice(0, 3).join(", ")}. `
  }

  const style = context.videoStyle || "modern, professional, clean design"
  prompt += `Visual style: ${style}. Smooth camera motion, professional lighting, engaging composition.`

  return prompt.trim()
}
