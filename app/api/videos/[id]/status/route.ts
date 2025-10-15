import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { pollVideoStatus, downloadVideo } from "@/lib/llm/generate-video"

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Poll video status
    const video = await pollVideoStatus(id)

    // If completed, download the video
    if (video.status === "completed") {
      const { url } = await downloadVideo(id)
      return NextResponse.json({
        ...video,
        url,
      })
    }

    return NextResponse.json(video)
  } catch (error) {
    console.error("[pudbdev] Error fetching video status:", error)
    return NextResponse.json(
      { error: "Failed to fetch video status" },
      { status: 500 }
    )
  }
}

