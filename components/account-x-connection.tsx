"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle2, X as XIcon } from "lucide-react"
import { useRouter } from "next/navigation"

interface AccountXConnectionProps {
  xIdentity: {
    id: string
    provider_user: string
    expires_at: string | null
    oauth1a_token: string | null
    oauth1a_secret: string | null
  } | null
  showSuccessMessage?: boolean
  showMediaSuccess?: boolean
}

export function AccountXConnection({ xIdentity, showSuccessMessage, showMediaSuccess }: AccountXConnectionProps) {
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const router = useRouter()

  async function handleDisconnect() {
    if (!confirm("Are you sure you want to disconnect your X account? This will affect all your projects.")) {
      return
    }

    setIsDisconnecting(true)
    try {
      const response = await fetch("/api/identities?provider=x", {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to disconnect")
      }

      router.refresh()
    } catch (error) {
      console.error("Error disconnecting X account:", error)
      alert("Failed to disconnect X account. Please try again.")
    } finally {
      setIsDisconnecting(false)
    }
  }

  return (
    <>
      {showSuccessMessage && (
        <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800 dark:bg-green-950 dark:text-green-200">
          <CheckCircle2 className="mb-1 inline h-4 w-4" /> Successfully connected to X!
        </div>
      )}

      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white dark:bg-white dark:text-black">
            <span className="font-bold">𝕏</span>
          </div>
          <div>
            <p className="font-medium">X (Twitter)</p>
            {xIdentity ? (
              <p className="text-sm text-muted-foreground">Connected as @{xIdentity.provider_user}</p>
            ) : (
              <p className="text-sm text-muted-foreground">Not connected</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {xIdentity ? (
            <>
              <Button asChild size="sm" variant="outline">
                <a href="/api/oauth/x/authorize?redirect=settings">
                  Reconnect
                </a>
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleDisconnect}
                disabled={isDisconnecting}
              >
                {isDisconnecting ? (
                  "Disconnecting..."
                ) : (
                  <>
                    <XIcon className="mr-2 h-4 w-4" />
                    Disconnect
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button asChild size="sm">
              <a href="/api/oauth/x/authorize?redirect=settings">Connect</a>
            </Button>
          )}
        </div>
      </div>

      {showMediaSuccess && (
        <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800 dark:bg-green-950 dark:text-green-200">
          <CheckCircle2 className="mb-1 inline h-4 w-4" /> Media uploads enabled! You can now attach images to your posts.
        </div>
      )}

      {xIdentity && (
        <>
          <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Connected</p>
            <p className="mt-1">This X account is linked to your profile and can be used across all your projects.</p>
          </div>

          {/* Media Upload Status */}
          {!xIdentity.oauth1a_token ? (
            <div className="rounded-lg border-2 border-dashed border-yellow-500 bg-yellow-50 p-4 dark:bg-yellow-950/20">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-medium text-yellow-900 dark:text-yellow-100">Media Uploads Not Enabled</p>
                  <p className="mt-1 text-sm text-yellow-800 dark:text-yellow-200">
                    To attach images to your posts, you need to enable media upload permissions. This requires a one-time
                    additional authorization.
                  </p>
                </div>
                <Button asChild size="sm" variant="outline">
                  <a href="/api/oauth/x/authorize-media">
                    Enable Media Uploads
                  </a>
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-green-500 bg-green-50 p-3 dark:bg-green-950/20">
              <div className="flex items-center gap-2 text-sm text-green-800 dark:text-green-200">
                <CheckCircle2 className="h-4 w-4" />
                <span className="font-medium">Media uploads enabled</span>
              </div>
            </div>
          )}
        </>
      )}
    </>
  )
}

