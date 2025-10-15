import { createClient } from "@/lib/supabase/server"
import { generatePostContent } from "@/lib/llm/generate-variants"
import { NextResponse } from "next/server"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the draft
    const { data: draft } = await supabase
      .from("drafts")
      .select(`
        *,
        project:projects (
          *,
          organization:organizations (
            *,
            memberships!inner (*)
          )
        )
      `)
      .eq("id", id)
      .eq("project.organization.memberships.user_id", user.id)
      .single()

    if (!draft) {
      return NextResponse.json({ error: "Draft not found or access denied" }, { status: 404 })
    }

    // Get project settings
    const settings = draft.project.settings as {
      tone?: string
      audience?: string
      hashtags?: string[]
      generateImages?: boolean
      imageStyle?: string
    }

    // Get user settings for defaults
    const { data: userData } = await supabase
      .from("users")
      .select("settings")
      .eq("id", user.id)
      .single()

    const userSettings = (userData?.settings as any) || {}

    // Regenerate variants and images using LLM
    const content = await generatePostContent({
      context: draft.context as any,
      settings,
      userSettings,
    })

    // Update draft with new variants and images
    const { data: updatedDraft, error } = await supabase
      .from("drafts")
      .update({
        variants: content.variants,
        images: content.images || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select(`
        *,
        project:projects (*),
        creator:users!created_by (*)
      `)
      .single()

    if (error) throw error

    return NextResponse.json({ draft: updatedDraft })
  } catch (error) {
    console.error("[catchy] Error regenerating draft:", error)
    return NextResponse.json({ error: "Failed to regenerate draft" }, { status: 500 })
  }
}

