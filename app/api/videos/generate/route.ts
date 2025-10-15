import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateVideo } from "@/lib/llm/generate-video"

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
    const { prompt, model, duration, size } = body

    if (!prompt || !model || !duration) {
      return NextResponse.json(
        { error: "Missing required fields: prompt, model, duration" },
        { status: 400 }
      )
    }

    // Start video generation
    const video = await generateVideo({
      prompt,
      model,
      duration,
      size: size || "1280x720",
    })

    return NextResponse.json({
      videoId: video.id,
      status: video.status,
      progress: video.progress,
    })
  } catch (error) {
    console.error("[pudbdev] Error starting video generation:", error)
    return NextResponse.json(
      { error: "Failed to start video generation" },
      { status: 500 }
    )
  }
}

