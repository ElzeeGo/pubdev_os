import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/auth"
import crypto from "crypto"

// Get all API keys for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createClient()

    const { data: keys, error } = await supabase
      .from("api_keys")
      .select("id, name, key_preview, project_id, last_used_at, created_at, expires_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[catchy] Error fetching API keys:", error)
      return NextResponse.json(
        { error: "Failed to fetch API keys" },
        { status: 500 }
      )
    }

    return NextResponse.json({ keys })
  } catch (error) {
    console.error("[catchy] Error in GET /api/v1/keys:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Create a new API key
export async function POST(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, projectId } = body

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      )
    }

    if (!projectId || typeof projectId !== "string") {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify user has access to the project
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id, organization_id")
      .eq("id", projectId)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    // Check membership
    const { data: membership, error: membershipError } = await supabase
      .from("memberships")
      .select("role")
      .eq("user_id", user.id)
      .eq("organization_id", project.organization_id)
      .single()

    if (membershipError || !membership) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    if (!["owner", "admin"].includes(membership.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      )
    }

    // Generate API key
    const apiKey = `sk_${crypto.randomBytes(32).toString("hex")}`
    const keyHash = crypto.createHash("sha256").update(apiKey).digest("hex")
    const keyPreview = `...${apiKey.slice(-4)}`

    // Insert API key
    const { data: newKey, error: insertError } = await supabase
      .from("api_keys")
      .insert({
        user_id: user.id,
        organization_id: project.organization_id,
        project_id: projectId,
        key_hash: keyHash,
        key_preview: keyPreview,
        name,
      })
      .select("id, name, key_preview, created_at")
      .single()

    if (insertError || !newKey) {
      console.error("[catchy] Error creating API key:", insertError)
      return NextResponse.json(
        { error: "Failed to create API key" },
        { status: 500 }
      )
    }

    // Return the full API key (only time it's shown)
    return NextResponse.json({
      key: apiKey,
      id: newKey.id,
      name: newKey.name,
      keyPreview: newKey.key_preview,
      createdAt: newKey.created_at,
    })
  } catch (error) {
    console.error("[catchy] Error in POST /api/v1/keys:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Delete an API key
export async function DELETE(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const keyId = searchParams.get("id")

    if (!keyId) {
      return NextResponse.json(
        { error: "Key ID is required" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify ownership
    const { data: apiKey, error: fetchError } = await supabase
      .from("api_keys")
      .select("id, user_id, organization_id")
      .eq("id", keyId)
      .single()

    if (fetchError || !apiKey) {
      return NextResponse.json(
        { error: "API key not found" },
        { status: 404 }
      )
    }

    // Check if user owns this key or has admin access
    const { data: membership } = await supabase
      .from("memberships")
      .select("role")
      .eq("user_id", user.id)
      .eq("organization_id", apiKey.organization_id)
      .single()

    if (apiKey.user_id !== user.id && (!membership || !["owner", "admin"].includes(membership.role))) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    // Delete the key
    const { error: deleteError } = await supabase
      .from("api_keys")
      .delete()
      .eq("id", keyId)

    if (deleteError) {
      console.error("[catchy] Error deleting API key:", deleteError)
      return NextResponse.json(
        { error: "Failed to delete API key" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[catchy] Error in DELETE /api/v1/keys:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

