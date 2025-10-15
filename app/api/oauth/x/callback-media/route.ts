import { createClient } from "@/lib/supabase/server"
import { getXOAuth1aClient } from "@/lib/oauth/x-oauth1a"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const oauth_token = searchParams.get("oauth_token")
    const oauth_verifier = searchParams.get("oauth_verifier")
    const denied = searchParams.get("denied")

    if (denied) {
      return NextResponse.redirect(
        new URL("/settings?error=oauth1a_denied", process.env.NEXT_PUBLIC_APP_URL!)
      )
    }

    if (!oauth_token || !oauth_verifier) {
      return NextResponse.redirect(
        new URL("/settings?error=oauth1a_invalid", process.env.NEXT_PUBLIC_APP_URL!)
      )
    }

    const supabase = await createClient()

    // Get the stored request token secret
    const { data: oauthState } = await supabase
      .from("oauth_state")
      .select("state")
      .eq("id", oauth_token)
      .single()

    if (!oauthState) {
      return NextResponse.redirect(
        new URL("/settings?error=oauth1a_expired", process.env.NEXT_PUBLIC_APP_URL!)
      )
    }

    const state = oauthState.state as any
    const user_id = state.user_id
    const oauth_token_secret = state.oauth_token_secret

    // Step 3: Exchange for access tokens
    const oauth1aClient = getXOAuth1aClient()
    const tokens = await oauth1aClient.getAccessToken(oauth_token, oauth_token_secret, oauth_verifier)

    // Update the existing identity with OAuth 1.0a tokens
    await supabase
      .from("identities")
      .update({
        oauth1a_token: tokens.oauth_token,
        oauth1a_secret: tokens.oauth_token_secret,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user_id)
      .eq("provider", "x")

    // Clean up the temporary state
    await supabase.from("oauth_state").delete().eq("id", oauth_token)

    // Redirect back to settings with success
    return NextResponse.redirect(
      new URL("/settings?media_connected=true", process.env.NEXT_PUBLIC_APP_URL!)
    )
  } catch (error) {
    console.error("[catchy] Error in OAuth 1.0a callback:", error)
    return NextResponse.redirect(
      new URL("/settings?error=oauth1a_callback_failed", process.env.NEXT_PUBLIC_APP_URL!)
    )
  }
}

