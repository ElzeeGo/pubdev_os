import OAuth from "oauth-1.0a"
import crypto from "crypto"

export interface OAuth1aTokens {
  oauth_token: string
  oauth_token_secret: string
}

export class XOAuth1aClient {
  private oauth: OAuth
  private consumerKey: string
  private consumerSecret: string

  constructor(consumerKey: string, consumerSecret: string) {
    this.consumerKey = consumerKey
    this.consumerSecret = consumerSecret

    this.oauth = new OAuth({
      consumer: {
        key: consumerKey,
        secret: consumerSecret,
      },
      signature_method: "HMAC-SHA1",
      hash_function(base_string, key) {
        return crypto.createHmac("sha1", key).update(base_string).digest("base64")
      },
    })
  }

  // Step 1: Request temporary token
  async getRequestToken(callbackUrl: string): Promise<{ token: string; secret: string }> {
    const requestData = {
      url: "https://api.twitter.com/oauth/request_token",
      method: "POST",
      data: {
        oauth_callback: callbackUrl,
      },
    }

    const authorization = this.oauth.authorize(requestData)
    const headers = this.oauth.toHeader(authorization)

    const response = await fetch(requestData.url, {
      method: requestData.method,
      headers: {
        ...headers,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        oauth_callback: callbackUrl,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("[catchy] Failed to get request token:", error)
      throw new Error(`Failed to get request token: ${error}`)
    }

    const data = await response.text()
    const params = new URLSearchParams(data)

    return {
      token: params.get("oauth_token")!,
      secret: params.get("oauth_token_secret")!,
    }
  }

  // Step 2: Get authorization URL
  getAuthorizationUrl(oauthToken: string): string {
    return `https://api.twitter.com/oauth/authorize?oauth_token=${oauthToken}`
  }

  // Step 3: Exchange oauth_verifier for access tokens
  async getAccessToken(
    oauthToken: string,
    oauthTokenSecret: string,
    oauthVerifier: string
  ): Promise<OAuth1aTokens> {
    const requestData = {
      url: "https://api.twitter.com/oauth/access_token",
      method: "POST",
    }

    const token = {
      key: oauthToken,
      secret: oauthTokenSecret,
    }

    const headers = this.oauth.toHeader(this.oauth.authorize(requestData, token))

    const response = await fetch(requestData.url, {
      method: requestData.method,
      headers: {
        ...headers,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        oauth_verifier: oauthVerifier,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to get access token: ${error}`)
    }

    const data = await response.text()
    const params = new URLSearchParams(data)

    return {
      oauth_token: params.get("oauth_token")!,
      oauth_token_secret: params.get("oauth_token_secret")!,
    }
  }

  // Upload media with OAuth 1.0a
  async uploadMedia(
    oauth_token: string,
    oauth_token_secret: string,
    mediaBuffer: Buffer
  ): Promise<string | null> {
    try {
      const base64Media = mediaBuffer.toString("base64")

      const requestData = {
        url: "https://upload.twitter.com/1.1/media/upload.json",
        method: "POST",
        data: {
          media_data: base64Media,
        },
      }

      const token = {
        key: oauth_token,
        secret: oauth_token_secret,
      }

      const headers = this.oauth.toHeader(this.oauth.authorize(requestData, token))

      console.log("[catchy] Uploading media with OAuth 1.0a, size:", mediaBuffer.length, "bytes")

      const response = await fetch(requestData.url, {
        method: requestData.method,
        headers: {
          ...headers,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          media_data: base64Media,
        }),
      })

      console.log("[catchy] Media upload response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`[catchy] Failed to upload media (${response.status}):`, errorText)
        return null
      }

      const data = await response.json()
      console.log("[catchy] Media uploaded successfully, media_id:", data.media_id_string)
      return data.media_id_string
    } catch (error) {
      console.error("[catchy] Error uploading media:", error)
      return null
    }
  }
}

// Singleton instance
let xOAuth1aClient: XOAuth1aClient | null = null

export function getXOAuth1aClient(): XOAuth1aClient {
  if (!xOAuth1aClient) {
    // Use OAuth 1.0a credentials (API Key and Secret)
    // Fall back to OAuth 2.0 credentials if OAuth 1.0a not set
    const apiKey = process.env.X_OAUTH1A_API_KEY || process.env.X_CLIENT_ID!
    const apiSecret = process.env.X_OAUTH1A_API_SECRET || process.env.X_CLIENT_SECRET!
    
    xOAuth1aClient = new XOAuth1aClient(apiKey, apiSecret)
  }
  return xOAuth1aClient
}

