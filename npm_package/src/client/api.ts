import { ScanData, ScanResponse } from "../types"

export class pubdevAPIClient {
  private apiKey: string
  private apiUrl: string

  constructor(apiKey: string, apiUrl?: string) {
    this.apiKey = apiKey
    this.apiUrl = apiUrl || process.env.PUBDEV_API_URL || "https://pubdev.app"
  }

  async submitScan(data: ScanData): Promise<ScanResponse> {
    const response = await fetch(`${this.apiUrl}/api/v1/scan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to submit scan: ${response.status} ${errorText}`)
    }

    return response.json() as Promise<ScanResponse>
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/api/health`, {
        method: "GET",
      })
      return response.ok
    } catch (error) {
      return false
    }
  }
}

