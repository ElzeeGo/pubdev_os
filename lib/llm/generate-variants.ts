import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { GoogleGenAI } from "@google/genai"

interface GenerateVariantsInput {
  context: {
    title?: string
    description?: string
    changes?: string[]
    repository?: string
    author?: string
    [key: string]: any
  }
  settings: {
    tone?: string
    audience?: string
    hashtags?: string[]
    generateImages?: boolean
    imageStyle?: string
  }
  userSettings?: {
    tone?: string
    audience?: string
    hashtags?: string[]
    generateImages?: boolean
    imageStyle?: string
  }
}

interface GeneratedContent {
  variants: string[]
  images?: Array<{
    prompt: string
    url?: string
    base64?: string
  }>
}

export async function generatePostVariants(input: GenerateVariantsInput): Promise<string[]> {
  const content = await generatePostContent(input)
  return content.variants
}

function stripMarkdownCodeBlock(text: string): string {
  // Remove markdown code blocks if present
  let cleaned = text.trim()
  
  // Remove ```json or ``` at the start
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.substring(7)
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.substring(3)
  }
  
  // Remove ``` at the end
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.substring(0, cleaned.length - 3)
  }
  
  return cleaned.trim()
}

export async function generatePostContent(
  input: GenerateVariantsInput,
  trackingData?: {
    userId: string
    organizationId: string
    projectId: string
    draftId?: string
    scanId?: string
  }
): Promise<GeneratedContent> {
  const startTime = Date.now()
  const { context, settings, userSettings } = input

  // Merge user settings with project settings (project settings take precedence)
  const mergedSettings = {
    tone: settings.tone || userSettings?.tone || "professional",
    audience: settings.audience || userSettings?.audience || "developers",
    hashtags: settings.hashtags || userSettings?.hashtags || [],
    generateImages: settings.generateImages ?? userSettings?.generateImages ?? false,
    imageStyle: settings.imageStyle || userSettings?.imageStyle || "modern and minimalist",
  }

  const prompt = `You are a social media content creator specializing in technical announcements.

Context:
${context.title ? `Title: ${context.title}` : ""}
${context.description ? `Description: ${context.description}` : ""}
${context.changes ? `Changes:\n${context.changes.map((c) => `- ${c}`).join("\n")}` : ""}
${context.repository ? `Repository: ${context.repository}` : ""}
${context.author ? `Author: ${context.author}` : ""}

Settings:
- Tone: ${mergedSettings.tone}
- Target Audience: ${mergedSettings.audience}
${mergedSettings.hashtags.length > 0 ? `- Hashtags: ${mergedSettings.hashtags.join(" ")}` : ""}

Generate 3 different tweet variants (max 280 characters each) announcing this update. Each variant should:
1. Be engaging and concise
2. Match the specified tone
3. Appeal to the target audience
4. Include relevant hashtags if provided
5. Highlight the most important aspects

Format your response as a JSON array of strings, like this:
["variant 1 text", "variant 2 text", "variant 3 text"]

Only return the JSON array, no other text.`

  try {
    const { text, usage } = await generateText({
      model: openai("gpt-5"),
      prompt,
      temperature: 0.8,
    })

    // Strip markdown code blocks and parse the JSON response
    const cleanedText = stripMarkdownCodeBlock(text)
    const variants = JSON.parse(cleanedText)
    
    const textGenerationTime = Date.now() - startTime

    if (!Array.isArray(variants) || variants.length === 0) {
      throw new Error("Invalid response format from LLM")
    }

    const result: GeneratedContent = {
      variants: variants.slice(0, 3),
    }

    // Generate images if requested
    let imageGenerationTime = 0
    let imagesGenerated = 0
    if (mergedSettings.generateImages) {
      const imageStartTime = Date.now()
      result.images = await generatePostImages({
        context,
        settings: mergedSettings,
        variants: result.variants,
      })
      imageGenerationTime = Date.now() - imageStartTime
      imagesGenerated = result.images?.length || 0
    }

    // Log generation metrics for billing
    if (trackingData && usage) {
      const { logGeneration } = await import("./usage-tracker")
      // AI SDK usage structure: { promptTokens, completionTokens, totalTokens }
      const usageData = usage as any // Type assertion for AI SDK compatibility
      await logGeneration({
        ...trackingData,
        metrics: {
          durationMs: Date.now() - startTime,
          promptTokens: usageData.promptTokens || 0,
          completionTokens: usageData.completionTokens || 0,
          totalTokens: usageData.totalTokens || 0,
          imagesGenerated,
          videosGenerated: 0,
          videoSeconds: 0,
          model: "gpt-5",
          type: imagesGenerated > 0 ? "both" : "text",
        },
        status: "completed",
      })
    }

    return result
  } catch (error) {
    console.error("[catchy] Error generating variants:", error)
    
    // Log failed generation
    if (trackingData) {
      const { logGeneration } = await import("./usage-tracker")
      await logGeneration({
        ...trackingData,
        metrics: {
          durationMs: Date.now() - startTime,
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
          imagesGenerated: 0,
          videosGenerated: 0,
          videoSeconds: 0,
          model: "gpt-5",
          type: "text",
        },
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }
    
    // Fallback variants
    return {
      variants: [
        `${context.title || "New update"} is now available! ${mergedSettings.hashtags.join(" ")}`.trim(),
        `Just released: ${context.title || "an update"}. Check it out! ${mergedSettings.hashtags.join(" ")}`.trim(),
        `Exciting news! ${context.title || "We've shipped something new"}. ${mergedSettings.hashtags.join(" ")}`.trim(),
      ],
    }
  }
}

async function generatePostImages(input: {
  context: any
  settings: any
  variants: string[]
}): Promise<Array<{ prompt: string; url?: string; base64?: string }>> {
  const { context, settings } = input

  try {
    // First, generate image prompts using GPT-5
    const promptGenerationText = `Based on this content context, generate 2-3 detailed image prompts that would work well as social media post images.

Context:
${context.title ? `Title: ${context.title}` : ""}
${context.description ? `Description: ${context.description}` : ""}

Style: ${settings.imageStyle}

Each prompt should be:
- Detailed and optimized for AI image generation
- Eye-catching and visually appealing
- Relevant to the content
- Suitable for social media posts (16:9 or square format)

Return ONLY a JSON array of strings (just the prompts):
["prompt 1", "prompt 2", "prompt 3"]

Only return the JSON array, no other text.`

    const { text } = await generateText({
      model: openai("gpt-5"),
      prompt: promptGenerationText,
      temperature: 0.7,
    })

    // Strip markdown code blocks and parse the JSON response
    const cleanedText = stripMarkdownCodeBlock(text)
    const prompts = JSON.parse(cleanedText)

    if (!Array.isArray(prompts) || prompts.length === 0) {
      throw new Error("Invalid image prompts format")
    }

    // Now generate actual images using Gemini 2.5 Flash Image (nano-banana)
    const geminiApiKey = process.env.GEMINI_API_KEY
    if (!geminiApiKey) {
      console.warn("[catchy] GEMINI_API_KEY not found, returning prompts only")
      return prompts.map((prompt: string) => ({
        prompt,
        url: undefined,
      }))
    }

    const genAI = new GoogleGenAI({ apiKey: geminiApiKey })
    const imageResults = await Promise.allSettled(
      prompts.slice(0, 3).map(async (prompt: string) => {
        try {
          // Use Gemini 2.5 Flash Image to generate actual images
          const result: any = await genAI.models.generateContent({
            model: "gemini-2.5-flash-image",
            contents: prompt,
          })

          // Extract image data from the response
          // Gemini returns image data in base64 format
          let imageData: string | undefined

          if (result.candidates?.[0]?.content?.parts) {
            for (const part of result.candidates[0].content.parts) {
              if (part.inlineData?.data) {
                imageData = part.inlineData.data
                break
              }
            }
          }

          return {
            prompt,
            base64: imageData,
            url: imageData ? `data:image/png;base64,${imageData}` : undefined,
          }
        } catch (error) {
          console.error(`[catchy] Error generating image for prompt "${prompt}":`, error)
          return {
            prompt,
            url: undefined,
          }
        }
      })
    )

    return imageResults.map((result) =>
      result.status === "fulfilled" ? result.value : { prompt: "", url: undefined }
    )
  } catch (error) {
    console.error("[catchy] Error generating images:", error)
    return []
  }
}
