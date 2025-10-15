import { createClient } from "@/lib/supabase/server"
import { getXOAuthClient } from "@/lib/oauth/x"

export async function getValidAccessToken(userId: string, provider: string): Promise<string> {
  const supabase = await createClient()
  
  const { data: identity } = await supabase
    .from("identities")
    .select("*")
    .eq("user_id", userId)
    .eq("provider", provider)
    .single()

  if (!identity) {
    throw new Error(`No ${provider} identity found for user`)
  }

  // Check if token is expired or will expire in the next 5 minutes
  const now = new Date()
  const expiresAt = identity.expires_at ? new Date(identity.expires_at) : null
  const needsRefresh = !expiresAt || expiresAt.getTime() - now.getTime() < 5 * 60 * 1000

  if (!needsRefresh) {
    return identity.access_token
  }

  // Refresh the token
  if (!identity.refresh_token) {
    throw new Error("No refresh token available")
  }

  if (provider === "x") {
    const xClient = getXOAuthClient()
    const tokens = await xClient.refreshAccessToken(identity.refresh_token)

    // Update the identity with new tokens
    await supabase
      .from("identities")
      .update({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || identity.refresh_token,
        expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      })
      .eq("user_id", userId)
      .eq("provider", provider)

    return tokens.access_token
  }

  throw new Error(`Unsupported provider: ${provider}`)
}
