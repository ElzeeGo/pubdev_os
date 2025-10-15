import { createClient } from "@/lib/supabase/server"
import { getXOAuth1aClient } from "@/lib/oauth/x-oauth1a"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL!))
    }

    const oauth1aClient = getXOAuth1aClient()
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/x/callback-media`

    // Step 1: Get request token
    const { token, secret } = await oauth1aClient.getRequestToken(callbackUrl)

    // Store the request token secret temporarily (needed for step 3)
    await supabase.from("oauth_state").insert({
      id: token,
      state: {
        user_id: user.id,
        oauth_token_secret: secret,
        type: "oauth1a_media",
      },
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
    })

    // Step 2: Redirect to authorization URL
    const authUrl = oauth1aClient.getAuthorizationUrl(token)
    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error("[catchy] Error starting OAuth 1.0a flow:", error)
    return NextResponse.redirect(
      new URL("/settings?error=oauth1a_failed", process.env.NEXT_PUBLIC_APP_URL!)
    )
  }
}

