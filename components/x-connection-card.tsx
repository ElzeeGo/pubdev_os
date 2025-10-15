"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle2, X as XIcon } from "lucide-react"
import { useRouter } from "next/navigation"

interface XConnectionCardProps {
  projectSlug: string
  xIdentity: {
    id: string
    provider_user: string
    expires_at: string | null
  } | null
  showSuccessMessage?: boolean
}

export function XConnectionCard({ projectSlug, xIdentity, showSuccessMessage }: XConnectionCardProps) {
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const router = useRouter()

  async function handleDisconnect() {
    if (!confirm("Are you sure you want to disconnect your X account?")) {
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
                <a href={`/api/oauth/x/authorize?project=${projectSlug}`}>
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
              <a href={`/api/oauth/x/authorize?project=${projectSlug}`}>Connect</a>
            </Button>
          )}
        </div>
      </div>
    </>
  )
}

