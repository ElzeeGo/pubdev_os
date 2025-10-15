import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, organizationId } = await request.json()

    if (!name || !organizationId) {
      return NextResponse.json({ error: "Name and organization ID are required" }, { status: 400 })
    }

    // Verify user is member of organization with owner or admin role
    const { data: membership } = await supabase
      .from("memberships")
      .select("*")
      .eq("user_id", user.id)
      .eq("organization_id", organizationId)
      .in("role", ["owner", "admin"])
      .single()

    if (!membership) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Generate unique slug
    let slug = generateSlug(name)
    let counter = 1
    let existing = await supabase.from("projects").select("id").eq("slug", slug).single()
    while (existing.data) {
      slug = `${generateSlug(name)}-${counter}`
      counter++
      existing = await supabase.from("projects").select("id").eq("slug", slug).single()
    }

    const { data: project, error } = await supabase
      .from("projects")
      .insert({
        name,
        slug,
        organization_id: organizationId,
        settings: {
          tone: "professional",
          language: "en",
          audience: "developers",
          hashtags: [],
          imageMode: "auto",
        },
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ project })
  } catch (error) {
    console.error("[catchy] Error creating project:", error)
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 })
  }
}
