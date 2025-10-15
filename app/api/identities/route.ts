import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// GET /api/identities - Get all connected identities for current user
export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: identities, error } = await supabase
      .from("identities")
      .select("*")
      .eq("user_id", user.id)

    if (error) {
      console.error("[catchy] Error fetching identities:", error)
      return NextResponse.json({ error: "Failed to fetch identities" }, { status: 500 })
    }

    // Don't send tokens to client
    const sanitizedIdentities = identities?.map((identity) => ({
      id: identity.id,
      provider: identity.provider,
      provider_user: identity.provider_user,
      expires_at: identity.expires_at,
      scopes: identity.scopes,
      created_at: identity.created_at,
    }))

    return NextResponse.json({ identities: sanitizedIdentities })
  } catch (error) {
    console.error("[catchy] Error in GET /api/identities:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/identities?provider=x - Disconnect an identity
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const provider = searchParams.get("provider")

    if (!provider) {
      return NextResponse.json({ error: "Provider is required" }, { status: 400 })
    }

    const { error } = await supabase
      .from("identities")
      .delete()
      .eq("user_id", user.id)
      .eq("provider", provider)

    if (error) {
      console.error("[catchy] Error deleting identity:", error)
      return NextResponse.json({ error: "Failed to disconnect account" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[catchy] Error in DELETE /api/identities:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

