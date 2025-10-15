import crypto from "crypto"

export interface XOAuthConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
}

export interface XTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token?: string
  scope: string
}

export interface XUserResponse {
  data: {
    id: string
    name: string
    username: string
  }
}

export class XOAuthClient {
  private config: XOAuthConfig

  constructor(config: XOAuthConfig) {
    this.config = config
  }

  // Generate PKCE challenge
  generateCodeVerifier(): string {
    return crypto.randomBytes(32).toString("base64url")
  }

  generateCodeChallenge(verifier: string): string {
    return crypto.createHash("sha256").update(verifier).digest("base64url")
  }

  // Generate authorization URL
  getAuthorizationUrl(state: string, codeChallenge: string): string {
    const params = new URLSearchParams({
      response_type: "code",
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: "tweet.read tweet.write users.read offline.access",
      state,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    })

    return `https://twitter.com/i/oauth2/authorize?${params.toString()}`
  }

  // Exchange authorization code for tokens
  async exchangeCodeForTokens(code: string, codeVerifier: string): Promise<XTokenResponse> {
    const response = await fetch("https://api.twitter.com/2/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: this.config.redirectUri,
        code_verifier: codeVerifier,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to exchange code for tokens: ${error}`)
    }

    return response.json()
  }

  // Refresh access token
  async refreshAccessToken(refreshToken: string): Promise<XTokenResponse> {
    const response = await fetch("https://api.twitter.com/2/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to refresh token: ${error}`)
    }

    return response.json()
  }

  // Get user info
  async getUserInfo(accessToken: string): Promise<XUserResponse> {
    const response = await fetch("https://api.twitter.com/2/users/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to get user info: ${error}`)
    }

    return response.json()
  }

  // Post a tweet
  async postTweet(accessToken: string, text: string, mediaIds?: string[]): Promise<any> {
    const body: any = { text }
    if (mediaIds && mediaIds.length > 0) {
      body.media = { media_ids: mediaIds }
    }

    const response = await fetch("https://api.twitter.com/2/tweets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to post tweet: ${error}`)
    }

    return response.json()
  }
}

// Singleton instance
let xOAuthClient: XOAuthClient | null = null

export function getXOAuthClient(): XOAuthClient {
  if (!xOAuthClient) {
    xOAuthClient = new XOAuthClient({
      clientId: process.env.X_CLIENT_ID!,
      clientSecret: process.env.X_CLIENT_SECRET!,
      redirectUri: process.env.X_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/x/callback`,
    })
  }
  return xOAuthClient
}
