import { createClient } from "@/lib/supabase/server"
import { generatePostContent } from "@/lib/llm/generate-variants"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { projectId, context, range, videoOptions } = body

    if (!projectId || !context) {
      return NextResponse.json({ error: "Project ID and context are required" }, { status: 400 })
    }

    // Verify user has access to project
    const { data: project } = await supabase
      .from("projects")
      .select(`
        *,
        organization:organizations (
          *,
          memberships!inner (*)
        )
      `)
      .eq("id", projectId)
      .eq("organization.memberships.user_id", user.id)
      .single()

    if (!project) {
      return NextResponse.json({ error: "Project not found or access denied" }, { status: 404 })
    }

    // Get project settings
    const settings = project.settings as {
      tone?: string
      audience?: string
      hashtags?: string[]
      generateImages?: boolean
      imageStyle?: string
      generateVideos?: boolean
      videoModel?: string
      videoDuration?: number
      videoSize?: string
      videoStyle?: string
    }

    // Get user settings for defaults
    const { data: userData } = await supabase
      .from("users")
      .select("settings")
      .eq("id", user.id)
      .single()

    const userSettings = (userData?.settings as any) || {}

    // Generate variants and images using LLM
    const content = await generatePostContent({
      context,
      settings,
      userSettings,
    })

    // Generate video if requested
    let videos = null
    let videoStartTime = 0
    if (videoOptions) {
      videoStartTime = Date.now()
      try {
        const { createAndPollVideo, buildVideoPrompt } = await import("@/lib/llm/generate-video")
        
        const videoPrompt = buildVideoPrompt({
          title: context.title,
          description: context.description,
          changes: context.changes,
          videoStyle: videoOptions.style || settings.videoStyle || userSettings?.videoStyle,
        })

        const video = await createAndPollVideo({
          prompt: videoPrompt,
          model: videoOptions.model || "sora-2",
          duration: videoOptions.duration || 5,
          size: videoOptions.size || "1280x720",
          context,
        })

        videos = [video]

        // Log video generation for billing (after draft is created)
        // We'll do this after the draft is created so we have a draft_id
      } catch (videoError) {
        console.error("[catchy] Error generating video:", videoError)
        // Don't fail the whole request if video fails
      }
    }

    // Create draft
    const { data: draft, error } = await supabase
      .from("drafts")
      .insert({
        project_id: projectId,
        range: range || null,
        context,
        variants: content.variants,
        images: content.images || null,
        videos: (videos as any) || null,
        status: "pending",
        created_by: user.id,
      })
      .select(`
        *,
        project:projects (*),
        creator:users!created_by (*)
      `)
      .single()

    if (error) throw error

    // Log video generation usage if video was generated
    if (videoOptions && videos && videos.length > 0) {
      try {
        const { logGeneration } = await import("@/lib/llm/usage-tracker")
        const video = videos[0]
        const organizationId = (project as any).organization.id

        await logGeneration({
          userId: user.id,
          organizationId,
          projectId,
          draftId: draft.id,
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
        console.error("[catchy] Error logging video generation:", logError)
        // Don't fail the request if logging fails
      }
    }

    return NextResponse.json({ draft })
  } catch (error) {
    console.error("[catchy] Error creating draft:", error)
    return NextResponse.json({ error: "Failed to create draft" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get("projectId")

    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 })
    }

    // Verify user has access to project
    const { data: project } = await supabase
      .from("projects")
      .select(`
        *,
        organization:organizations (
          memberships!inner (*)
        )
      `)
      .eq("id", projectId)
      .eq("organization.memberships.user_id", user.id)
      .single()

    if (!project) {
      return NextResponse.json({ error: "Project not found or access denied" }, { status: 404 })
    }

    const { data: drafts } = await supabase
      .from("drafts")
      .select(`
        *,
        creator:users!created_by (*)
      `)
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })

    return NextResponse.json({ drafts: drafts || [] })
  } catch (error) {
    console.error("[catchy] Error fetching drafts:", error)
    return NextResponse.json({ error: "Failed to fetch drafts" }, { status: 500 })
  }
}
