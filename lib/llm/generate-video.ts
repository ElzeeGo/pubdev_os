import OpenAI from "openai"

export interface VideoGenerationInput {
  prompt: string
  model: "sora-2" | "sora-2-pro"
  duration: 4 | 8 | 12
  size: "1280x720" | "720x1280" | "1792x1024" | "1024x1792"
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
  model: "sora-2" | "sora-2-pro"
  duration: number
  size: string
  created_at: string
  completed_at?: string
  error?: string
}

/**
 * Generate a video using OpenAI Sora 2
 */
export async function generateVideo(
  input: VideoGenerationInput
): Promise<VideoAsset> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  try {
    // Start video generation
    const video = await openai.videos.create({
      model: input.model,
      prompt: input.prompt,
      size: input.size as any, // Cast to any - OpenAI SDK type definitions may be outdated
      seconds: input.duration.toString() as "4" | "8" | "12",
    })

    return {
      id: video.id,
      prompt: input.prompt,
      status: (video.status as any) || "queued",
      progress: video.progress,
      model: input.model,
      duration: input.duration,
      size: input.size,
      created_at: new Date(video.created_at * 1000).toISOString(),
    }
  } catch (error) {
    console.error("[pudbdev] Error starting video generation:", error)
    throw error
  }
}

/**
 * Poll video status
 */
export async function pollVideoStatus(videoId: string): Promise<VideoAsset> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  try {
    const video = await openai.videos.retrieve(videoId)

    const asset: VideoAsset = {
      id: video.id,
      prompt: "", // We don't get prompt back from retrieve
      status: (video.status as any) || "queued",
      progress: video.progress,
      model: (video.model as any) || "sora-2",
      duration: parseInt(video.seconds || "4"),
      size: video.size || "1280x720",
      created_at: new Date(video.created_at * 1000).toISOString(),
    }

    // Capture error message if video failed
    if (video.status === "failed" && (video as any).error) {
      asset.error = (video as any).error.message || "Video generation failed"
    }

    return asset
  } catch (error) {
    console.error("[pudbdev] Error polling video status:", error)
    throw error
  }
}

/**
 * Download completed video
 */
export async function downloadVideo(
  videoId: string
): Promise<{ buffer: Buffer; url: string }> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  try {
    const content = await openai.videos.downloadContent(videoId)
    const arrayBuffer = await content.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Convert to data URL for immediate use
    // In production, you'd upload to Supabase Storage
    const base64 = buffer.toString("base64")
    const url = `data:video/mp4;base64,${base64}`

    return { buffer, url }
  } catch (error) {
    console.error("[pudbdev] Error downloading video:", error)
    throw error
  }
}

/**
 * Create and poll until completion (convenience function)
 */
export async function createAndPollVideo(
  input: VideoGenerationInput,
  onProgress?: (progress: number, status: string) => void
): Promise<VideoAsset> {
  try {
    // Start generation
    const initialVideo = await generateVideo(input)

    // Poll until complete
    let video = initialVideo
    while (video.status === "queued" || video.status === "in_progress") {
      // Wait 5 seconds before checking again
      await new Promise((resolve) => setTimeout(resolve, 5000))

      video = await pollVideoStatus(video.id)

      if (onProgress && video.progress !== undefined) {
        onProgress(video.progress, video.status)
      }
    }

    // If completed, download the video
    if (video.status === "completed") {
      const { url } = await downloadVideo(video.id)
      video.url = url
      video.completed_at = new Date().toISOString()
    } else if (video.status === "failed") {
      // Video failed on OpenAI's side
      video.error = video.error || "Video generation failed on OpenAI's servers"
    }

    return video
  } catch (error) {
    // If there's an error during the process, return a failed video object
    console.error("[pudbdev] Error in createAndPollVideo:", error)
    return {
      id: "error",
      prompt: input.prompt,
      status: "failed",
      model: input.model,
      duration: input.duration,
      size: input.size,
      created_at: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Failed to generate video",
    }
  }
}

/**
 * Build a video prompt from context
 */
export function buildVideoPrompt(context: {
  title?: string
  description?: string
  changes?: string[]
  videoStyle?: string
}): string {
  // If videoStyle contains detailed template instructions (long style), use it directly
  const hasDetailedStyle = context.videoStyle && context.videoStyle.length > 200
  
  if (hasDetailedStyle) {
    // Use the full template instructions as-is, with minimal context
    let prompt = ""
    
    if (context.title) {
      prompt += `Feature: ${context.title}. `
    }
    
    if (context.description && context.description !== context.title) {
      prompt += `${context.description}. `
    }
    
    // Add the full style template
    prompt += context.videoStyle
    
    return prompt.trim()
  }
  
  // For short/simple styles, build a descriptive prompt
  let prompt = ""

  // Build a visual description instead of asking for text overlays
  // Sora struggles with text generation, so focus on visuals
  
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

  // Add style guidelines
  const style = context.videoStyle || "modern, professional, clean design"
  prompt += `Visual style: ${style}. Smooth camera motion, professional lighting, engaging composition.`

  return prompt.trim()
}

