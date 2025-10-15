"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Trash2, Key } from "lucide-react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"

interface ApiKey {
  id: string
  name: string
  key_preview: string
  last_used_at: string | null
  created_at: string
  expires_at: string | null
}

interface ProjectWithKeys {
  id: string
  name: string
  slug: string
  keys: ApiKey[]
  canManage: boolean
}

interface ApiKeysListProps {
  projectsWithKeys: ProjectWithKeys[]
}

export function ApiKeysList({ projectsWithKeys }: ApiKeysListProps) {
  const [deletingKey, setDeletingKey] = useState<string | null>(null)
  const router = useRouter()

  async function handleDeleteKey(keyId: string) {
    if (!confirm("Are you sure you want to delete this API key? This action cannot be undone.")) {
      return
    }

    setDeletingKey(keyId)
    try {
      const response = await fetch(`/api/v1/keys?id=${keyId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete API key")
      }

      router.refresh()
    } catch (error) {
      console.error("Error deleting API key:", error)
      alert("Failed to delete API key. Please try again.")
    } finally {
      setDeletingKey(null)
    }
  }

  const hasAnyKeys = projectsWithKeys.some(p => p.keys.length > 0)

  if (!hasAnyKeys) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        <Key className="mx-auto mb-2 h-8 w-8 opacity-50" />
        <p>No API keys yet. Create one above to get started!</p>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      <h3 className="text-lg font-semibold">Existing API Keys</h3>
      {projectsWithKeys
        .filter(p => p.keys.length > 0)
        .map((project) => (
          <div key={project.id} className="space-y-4">
            <div className="border-l-4 border-primary pl-4">
              <h4 className="font-semibold">{project.name}</h4>
              <p className="text-sm text-muted-foreground">
                Project ID: {project.id}
              </p>
            </div>
            
            <div className="space-y-3">
              {project.keys.map((key) => (
                <Card key={key.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h5 className="font-medium">{key.name}</h5>
                      <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="font-mono">{key.key_preview}</span>
                        <span>•</span>
                        <span>
                          Created {formatDistanceToNow(new Date(key.created_at), { addSuffix: true })}
                        </span>
                        {key.last_used_at && (
                          <>
                            <span>•</span>
                            <span>
                              Last used {formatDistanceToNow(new Date(key.last_used_at), { addSuffix: true })}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    {project.canManage && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteKey(key.id)}
                        disabled={deletingKey === key.id}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
    </div>
  )
}
