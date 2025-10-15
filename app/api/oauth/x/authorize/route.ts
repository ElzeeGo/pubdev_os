import { createClient } from "@/lib/supabase/server"
import { getXOAuthClient } from "@/lib/oauth/x"
import { NextResponse } from "next/server"

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
    const projectSlug = searchParams.get("project")
    const redirect = searchParams.get("redirect")

    // Either project or redirect must be provided
    if (!projectSlug && !redirect) {
      return NextResponse.json({ error: "Project slug or redirect parameter is required" }, { status: 400 })
    }

    const xClient = getXOAuthClient()

    // Generate PKCE parameters
    const codeVerifier = xClient.generateCodeVerifier()
    const codeChallenge = xClient.generateCodeChallenge(codeVerifier)
    const state = crypto.randomUUID()

    // Store PKCE verifier and state in Supabase (expires in 10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
    
    const { error: insertError } = await supabase
      .from("oauth_state")
      .insert({
        id: state,
        state: { codeVerifier, userId: user.id, projectSlug, redirect },
        expires_at: expiresAt.toISOString(),
      })

    if (insertError) {
      console.error("[catchy] Error storing OAuth state:", insertError)
      return NextResponse.json({ error: "Failed to initiate OAuth" }, { status: 500 })
    }

    // Redirect to X authorization
    const authUrl = xClient.getAuthorizationUrl(state, codeChallenge)
    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error("[catchy] Error initiating X OAuth:", error)
    return NextResponse.json({ error: "Failed to initiate OAuth" }, { status: 500 })
  }
}
