import { createClient } from "@/lib/supabase/server"
import { getValidAccessToken } from "@/lib/oauth/refresh-token"
import { getXOAuthClient } from "@/lib/oauth/x"
import { getXOAuth1aClient } from "@/lib/oauth/x-oauth1a"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { draftId, variantPick, text, images } = body

    if (!draftId || text === undefined) {
      return NextResponse.json({ error: "Draft ID and text are required" }, { status: 400 })
    }

    // Fetch draft with project and membership info
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
        )
      `)
      .eq("id", draftId)
      .eq("project.organization.memberships.user_id", user.id)
      .single()

    if (!draft) {
      return NextResponse.json({ error: "Draft not found or access denied" }, { status: 404 })
    }

    // Check if user has permission to publish (owner or admin)
    const membership = draft.project.organization.memberships[0]
    if (membership.role !== "owner" && membership.role !== "admin") {
      return NextResponse.json({ error: "Only owners and admins can publish" }, { status: 403 })
    }

    // Get valid access token (will refresh if needed)
    let accessToken: string
    try {
      accessToken = await getValidAccessToken(user.id, "x")
    } catch (error) {
      return NextResponse.json(
        { error: "X account not connected. Please connect your X account in project settings." },
        { status: 400 },
      )
    }

    // Post to X
    const xClient = getXOAuthClient()
    const xOAuth1aClient = getXOAuth1aClient()
    let tweetResponse
    let permalink: string | null = null
    let mediaIds: string[] = []

    try {
      // Upload images if provided (requires OAuth 1.0a)
      if (images && Array.isArray(images) && images.length > 0) {
        // Get OAuth 1.0a tokens from identity
        const { data: identity } = await supabase
          .from("identities")
          .select("oauth1a_token, oauth1a_secret")
          .eq("user_id", user.id)
          .eq("provider", "x")
          .single()

        if (identity?.oauth1a_token && identity?.oauth1a_secret) {
          // Use OAuth 1.0a for media uploads
          for (const image of images) {
            if (image.url) {
              try {
                // Convert base64 data URL to buffer
                const base64Data = image.url.split(",")[1]
                if (base64Data) {
                  const buffer = Buffer.from(base64Data, "base64")
                  const mediaId = await xOAuth1aClient.uploadMedia(
                    identity.oauth1a_token,
                    identity.oauth1a_secret,
                    buffer
                  )
                  if (mediaId) {
                    mediaIds.push(mediaId)
                  }
                }
              } catch (uploadError) {
                console.error("[catchy] Error uploading image:", uploadError)
                // Continue with other images even if one fails
              }
            }
          }
        } else {
          console.warn(
            "[catchy] OAuth 1.0a tokens not found. Media uploads require reconnecting your X account with media permissions."
          )
          // Continue without images - backward compatible
        }
      }

      // Post tweet with media IDs if available (uses OAuth 2.0)
      tweetResponse = await xClient.postTweet(accessToken, text, mediaIds)
      
      // Construct permalink from tweet ID
      const tweetId = tweetResponse.data?.id
      if (tweetId) {
        // Get username from identity
        const { data: identity } = await supabase
          .from("identities")
          .select("provider_user")
          .eq("user_id", user.id)
          .eq("provider", "x")
          .single()
          
        if (identity) {
          permalink = `https://twitter.com/${identity.provider_user}/status/${tweetId}`
        }
      }
    } catch (error) {
      // Create failed post record
      const { data: post } = await supabase
        .from("posts")
        .insert({
          project_id: draft.project_id,
          provider: "x",
          draft_id: draft.id,
          variant_pick: variantPick ?? null,
          text,
          media_ids: mediaIds,
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error",
          created_by: user.id,
        })
        .select()
        .single()

      return NextResponse.json({ error: "Failed to post to X", post }, { status: 500 })
    }

    // Create successful post record
    const { data: post } = await supabase
      .from("posts")
      .insert({
        project_id: draft.project_id,
        provider: "x",
        draft_id: draft.id,
        variant_pick: variantPick ?? null,
        text,
        media_ids: mediaIds,
        permalink,
        status: "published",
        created_by: user.id,
      })
      .select()
      .single()

    // Update draft status
    await supabase
      .from("drafts")
      .update({ status: "published" })
      .eq("id", draftId)

    return NextResponse.json({ post, tweetResponse })
  } catch (error) {
    console.error("[catchy] Error publishing post:", error)
    return NextResponse.json({ error: "Failed to publish post" }, { status: 500 })
  }
}
