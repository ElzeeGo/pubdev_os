import { createClient } from "@/lib/supabase/server"
import { getXOAuthClient } from "@/lib/oauth/x"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")

    if (error) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=${error}`)
    }

    if (!code || !state) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=missing_params`)
    }

    const supabase = await createClient()

    // Retrieve stored PKCE verifier and user info
    const { data: oauthState, error: fetchError } = await supabase
      .from("oauth_state")
      .select("*")
      .eq("id", state)
      .single()

    if (fetchError || !oauthState) {
      console.error("[catchy] Error fetching OAuth state:", fetchError)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=invalid_state`)
    }

    // Check if state has expired
    if (new Date(oauthState.expires_at) < new Date()) {
      await supabase.from("oauth_state").delete().eq("id", state)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=state_expired`)
    }

    const storedData = oauthState.state as { codeVerifier: string; userId: string; projectSlug?: string; redirect?: string }

    // Delete the stored data
    await supabase.from("oauth_state").delete().eq("id", state)

    const xClient = getXOAuthClient()

    // Exchange code for tokens
    const tokens = await xClient.exchangeCodeForTokens(code, storedData.codeVerifier)

    // Get user info from X
    const userInfo = await xClient.getUserInfo(tokens.access_token)

    // Calculate token expiration
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000)

    // Store identity in database
    await supabase
      .from("identities")
      .upsert({
        user_id: storedData.userId,
        provider: "x",
        provider_user: userInfo.data.username,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: expiresAt.toISOString(),
        scopes: tokens.scope.split(" "),
      }, {
        onConflict: "user_id,provider"
      })

    // Redirect back to the appropriate page
    let redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?connected=x`
    
    if (storedData.redirect === "settings") {
      redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/settings?connected=x`
    } else if (storedData.projectSlug) {
      redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/projects/${storedData.projectSlug}/settings?connected=x`
    }
    
    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error("[catchy] Error in X OAuth callback:", error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=oauth_failed`)
  }
}
