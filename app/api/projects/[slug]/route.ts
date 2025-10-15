import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

interface RouteParams {
  params: Promise<{
    slug: string
  }>
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { slug } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: project } = await supabase
      .from("projects")
      .select(`
        *,
        organization:organizations (
          *,
          memberships!inner (*)
        )
      `)
      .eq("slug", slug)
      .eq("organization.memberships.user_id", user.id)
      .single()

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    return NextResponse.json({ project })
  } catch (error) {
    console.error("[catchy] Error fetching project:", error)
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 })
  }
}
