import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

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
        ),
        creator:users!created_by (*),
        posts (*)
      `)
      .eq("id", id)
      .eq("project.organization.memberships.user_id", user.id)
      .order("created_at", { ascending: false, referencedTable: "posts" })
      .single()

    if (!draft) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 })
    }

    return NextResponse.json({ draft })
  } catch (error) {
    console.error("[catchy] Error fetching draft:", error)
    return NextResponse.json({ error: "Failed to fetch draft" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { status } = body

    // Verify user has access to draft
    const { data: draft } = await supabase
      .from("drafts")
      .select(`
        *,
        project:projects (
          organization:organizations (
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

    // Update draft
    const { data: updatedDraft, error } = await supabase
      .from("drafts")
      .update({ status })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ draft: updatedDraft })
  } catch (error) {
    console.error("[catchy] Error updating draft:", error)
    return NextResponse.json({ error: "Failed to update draft" }, { status: 500 })
  }
}
