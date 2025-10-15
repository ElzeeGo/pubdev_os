import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import crypto from "crypto"

interface ScanRequestBody {
  projectId: string
  commit: {
    sha: string
    message: string
    author: string
    timestamp: string
  }
  changes: {
    added: string[]
    modified: string[]
    deleted: string[]
  }
  features: Array<{
    type: "component" | "page" | "api" | "feature"
    name: string
    description: string
    filePath: string
    code?: string
  }>
  projectContext?: {
    name: string
    description: string
    type: string
    framework: string
    primaryFeatures: string[]
    tech: string[]
    readme?: string
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get API key from Authorization header
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid Authorization header" },
        { status: 401 }
      )
    }

    const apiKey = authHeader.substring(7) // Remove "Bearer "

    // Validate API key and get project (use service role to bypass RLS)
    const { createServiceClient } = await import("@/lib/supabase/server")
    const supabase = createServiceClient()
    
    // Hash the API key to compare with stored hash
    const keyHash = crypto.createHash("sha256").update(apiKey).digest("hex")
    
    console.log("[pubdev] API Key Debug:")
    console.log("- Key preview:", apiKey.substring(0, 8) + "..." + apiKey.slice(-4))
    console.log("- Key hash:", keyHash)
    
    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from("api_keys")
      .select("id, project_id, organization_id, expires_at")
      .eq("key_hash", keyHash)
      .single()

    console.log("- DB Query Error:", apiKeyError)
    console.log("- DB Query Result:", apiKeyData)

    if (apiKeyError || !apiKeyData) {
      console.log("[pubdev] API Key validation failed")
      return NextResponse.json(
        { error: "Invalid API key" },
        { status: 401 }
      )
    }

    // Check if API key is expired
    if (apiKeyData.expires_at && new Date(apiKeyData.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "API key has expired" },
        { status: 401 }
      )
    }

    // Parse request body
    const body: ScanRequestBody = await request.json()

    // Validate project ID matches API key
    if (apiKeyData.project_id && apiKeyData.project_id !== body.projectId) {
      return NextResponse.json(
        { error: "Project ID mismatch" },
        { status: 403 }
      )
    }

    // Get project details
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id, name, slug, organization_id")
      .eq("id", body.projectId)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    // Verify API key belongs to project's organization
    if (project.organization_id !== apiKeyData.organization_id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    // Create scan record
    const { data: scan, error: scanError } = await supabase
      .from("scans")
      .insert({
        project_id: body.projectId,
        api_key_id: apiKeyData.id,
        commit_sha: body.commit.sha,
        commit_message: body.commit.message,
        commit_author: body.commit.author,
        commit_timestamp: body.commit.timestamp,
        changes: body.changes,
        features: body.features,
        status: "pending",
      })
      .select()
      .single()

    if (scanError || !scan) {
      console.error("[catchy] Error creating scan:", scanError)
      return NextResponse.json(
        { error: "Failed to create scan" },
        { status: 500 }
      )
    }

    // Trigger content generation asynchronously
    // We'll use a separate background function or queue
    triggerContentGeneration(scan.id, body, project).catch((error) => {
      console.error("[catchy] Error triggering content generation:", error)
    })

    // Return response immediately
    const draftUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/projects/${project.slug}`

    return NextResponse.json({
      scanId: scan.id,
      status: "processing",
      draftUrl,
    })
  } catch (error) {
    console.error("[catchy] Error processing scan:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Background function to generate content from scan
async function triggerContentGeneration(
  scanId: string,
  scanData: ScanRequestBody,
  project: any
) {
  try {
    const { createServiceClient } = await import("@/lib/supabase/server")
    const supabase = createServiceClient()

    // Update scan status
    await supabase
      .from("scans")
      .update({ status: "processing" })
      .eq("id", scanId)

    // Check quota before generating
    const { checkQuotaAvailable } = await import("@/lib/llm/usage-tracker")
    const hasQuota = await checkQuotaAvailable(project.organization_id)
    
    if (!hasQuota) {
      await supabase
        .from("scans")
        .update({
          status: "failed",
          error: "Insufficient credits. Please purchase more credits to continue.",
          processed_at: new Date().toISOString(),
        })
        .eq("id", scanId)
      
      console.log("[catchy] Organization quota exceeded:", project.organization_id)
      return
    }

    // Analyze scan data with AI for rich descriptions
    const { analyzeScanWithAI, formatScanAnalysisForContent } = await import("@/lib/llm/scan-analyzer")
    
    console.log("[pubdev] Analyzing scan with AI...")
    const scanAnalysis = await analyzeScanWithAI(
      scanData.features,
      scanData.commit.message,
      scanData.commit.author,
      scanData.projectContext // Pass project context for better analysis
    )
    console.log("[pubdev] AI Analysis complete:", scanAnalysis.overallFeature)

    // Build enhanced context from AI analysis
    const enhancedContext = formatScanAnalysisForContent(scanAnalysis)
    const context = {
      title: `${project.name} - ${enhancedContext.title}`,
      description: enhancedContext.description,
      changes: enhancedContext.changes,
      repository: project.name,
      author: scanData.commit.author,
    }

    // Get project settings for tone/audience
    const { data: projectData } = await supabase
      .from("projects")
      .select("settings")
      .eq("id", project.id)
      .single()

    const projectSettings = (projectData?.settings as any) || {}

    // Get the user who created the project (for created_by)
    const { data: membership } = await supabase
      .from("memberships")
      .select("user_id")
      .eq("organization_id", project.organization_id)
      .limit(1)
      .single()

    // Get user settings for image/video generation preferences
    const { data: userData } = await supabase
      .from("users")
      .select("settings")
      .eq("id", membership?.user_id || "")
      .single()

    const userSettings = (userData?.settings as any) || {}

    // Merge settings: project settings for tone/audience, user settings for image/video
    const settings = {
      // Project settings take precedence for tone/audience
      tone: projectSettings.tone || userSettings.tone,
      audience: projectSettings.audience || userSettings.audience,
      hashtags: projectSettings.hashtags || userSettings.hashtags || [],
      
      // User settings take precedence for image generation
      generateImages: userSettings.generateImages ?? projectSettings.generateImages ?? false,
      imageStyle: userSettings.imageStyle || projectSettings.imageStyle,
      
      // User settings take precedence for video generation
      generateVideos: userSettings.generateVideos ?? projectSettings.generateVideos ?? false,
      videoModel: userSettings.videoModel || projectSettings.videoModel || "sora-2",
      videoDuration: userSettings.videoDuration || projectSettings.videoDuration || 8,
      videoSize: userSettings.videoSize || projectSettings.videoSize || "1280x720",
      videoStyle: userSettings.videoStyle || projectSettings.videoStyle,
    }

    console.log("[pubdev] Merged settings for scan:")
    console.log("  - Generate Images:", settings.generateImages, "(from user settings)")
    console.log("  - Generate Videos:", settings.generateVideos, "(from user settings)")
    if (settings.generateVideos) {
      console.log("  - Video Model:", settings.videoModel)
      console.log("  - Video Duration:", settings.videoDuration, "seconds")
      console.log("  - Video Size:", settings.videoSize)
    }

    // Import the content generation function
    const { generatePostContent } = await import("@/lib/llm/generate-variants")

    // Generate content with usage tracking and AI-suggested hashtags
    const content = await generatePostContent(
      {
        context,
        settings: {
          tone: settings.tone,
          audience: settings.audience,
          hashtags: enhancedContext.hashtags.concat(settings.hashtags || []),
          generateImages: settings.generateImages,
          imageStyle: settings.imageStyle,
        },
      },
      // Tracking data for billing
      {
        userId: membership?.user_id || project.organization_id,
        organizationId: project.organization_id,
        projectId: project.id,
        scanId: scanId,
      }
    )

    // Generate video if enabled in user settings
    let videos = null
    let videoStartTime = 0
    if (settings.generateVideos) {
      videoStartTime = Date.now()
      try {
        const { createAndPollVideo, buildVideoPrompt } = await import("@/lib/llm/generate-video")
        
        const videoPrompt = buildVideoPrompt({
          title: context.title,
          description: context.description,
          changes: context.changes,
          videoStyle: settings.videoStyle,
        })

        const video = await createAndPollVideo({
          prompt: videoPrompt,
          model: settings.videoModel || "sora-2",
          duration: settings.videoDuration || 8,
          size: settings.videoSize || "1280x720",
          context,
        })

        videos = [video]
      } catch (videoError) {
        console.error("[pubdev] Error generating video:", videoError)
        // Don't fail the whole scan if video fails
      }
    }

    // Create draft with generated content
    const { data: draft, error: draftError } = await supabase
      .from("drafts")
      .insert({
        project_id: project.id,
        scan_id: scanId,
        range: `${scanData.features.length} features`,
        context,
        variants: content.variants,
        images: content.images || null,
        videos: (videos as any) || null,
        status: "pending",
        created_by: membership?.user_id || project.organization_id, // Fallback
      })
      .select()
      .single()

    if (draftError) {
      throw new Error(`Failed to create draft: ${draftError.message}`)
    }

    // Log video generation usage if video was generated
    if (videos && videos.length > 0) {
      try {
        const { logGeneration } = await import("@/lib/llm/usage-tracker")
        const video = videos[0]

        await logGeneration({
          userId: membership?.user_id || project.organization_id,
          organizationId: project.organization_id,
          projectId: project.id,
          draftId: draft.id,
          scanId: scanId,
          metrics: {
            durationMs: Date.now() - (videoStartTime || Date.now()),
            promptTokens: 0,
            completionTokens: 0,
            totalTokens: 0,
            imagesGenerated: 0,
            videosGenerated: video.status === "completed" ? 1 : 0,
            videoSeconds: video.status === "completed" ? video.duration : 0,
            videoSize: video.size,
            model: video.model,
            type: "video",
          },
          status: video.status === "completed" ? "completed" : "failed",
          error: video.error,
          metadata: {
            videoId: video.id,
            videoSize: video.size,
            videoPrompt: video.prompt,
          },
        })
      } catch (logError) {
        console.error("[pubdev] Error logging video generation:", logError)
        // Don't fail the scan if logging fails
      }
    }

    // Update scan status to completed
    await supabase
      .from("scans")
      .update({
        status: "completed",
        processed_at: new Date().toISOString(),
      })
      .eq("id", scanId)

    console.log("[catchy] Content generated successfully for scan:", scanId)
  } catch (error) {
    console.error("[catchy] Error generating content:", error)
    
    // Update scan status to failed
    const supabase = await createClient()
    await supabase
      .from("scans")
      .update({
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
        processed_at: new Date().toISOString(),
      })
      .eq("id", scanId)
  }
}

