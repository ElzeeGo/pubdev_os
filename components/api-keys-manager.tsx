"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Copy, Trash2, Key, Check } from "lucide-react"
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

interface Project {
  id: string
  name: string
  slug: string
  organization_id: string
}

interface ApiKeysManagerProps {
  projectId?: string // Optional for single-project mode
  projectSlug?: string
  initialKeys: ApiKey[]
  canManage: boolean
  projects?: Project[] // For multi-project mode (global settings)
  showProjectSelector?: boolean
}

export function ApiKeysManager({ 
  projectId, 
  projectSlug, 
  initialKeys, 
  canManage,
  projects = [],
  showProjectSelector = false
}: ApiKeysManagerProps) {
  const [keys, setKeys] = useState<ApiKey[]>(initialKeys)
  const [isCreating, setIsCreating] = useState(false)
  const [newKeyName, setNewKeyName] = useState("")
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projectId || "")
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const router = useRouter()

  async function handleCreateKey() {
    if (!newKeyName.trim()) {
      alert("Please enter a name for the API key")
      return
    }

    if (showProjectSelector && !selectedProjectId) {
      alert("Please select a project")
      return
    }

    const targetProjectId = showProjectSelector ? selectedProjectId : projectId

    setIsCreating(true)
    try {
      const response = await fetch("/api/v1/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newKeyName,
          projectId: targetProjectId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create API key")
      }

      const data = await response.json()
      
      // Show the new key value
      setNewKeyValue(data.key)
      
      // Add to list
      setKeys([
        {
          id: data.id,
          name: data.name,
          key_preview: data.keyPreview,
          last_used_at: null,
          created_at: data.createdAt,
          expires_at: null,
        },
        ...keys,
      ])

      setNewKeyName("")
      setSelectedProjectId(projectId || "")
      router.refresh()
    } catch (error) {
      console.error("Error creating API key:", error)
      alert("Failed to create API key. Please try again.")
    } finally {
      setIsCreating(false)
    }
  }

  async function handleDeleteKey(keyId: string) {
    if (!confirm("Are you sure you want to delete this API key? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(`/api/v1/keys?id=${keyId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete API key")
      }

      setKeys(keys.filter((k) => k.id !== keyId))
      router.refresh()
    } catch (error) {
      console.error("Error deleting API key:", error)
      alert("Failed to delete API key. Please try again.")
    }
  }

  function copyToClipboard(text: string, keyId: string) {
    navigator.clipboard.writeText(text)
    setCopiedKey(keyId)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  function dismissNewKey() {
    setNewKeyValue(null)
  }

  return (
    <div className="space-y-6">
      {/* New Key Created Alert */}
      {newKeyValue && (
        <Card className="border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-green-600 dark:text-green-400" />
              <h3 className="font-semibold text-green-900 dark:text-green-100">
                API Key Created Successfully
              </h3>
            </div>
            <p className="text-sm text-green-800 dark:text-green-200">
              Make sure to copy your API key now. You won't be able to see it again!
            </p>
            <div className="flex items-center gap-2">
              <Input
                value={newKeyValue}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(newKeyValue, "new")}
              >
                {copiedKey === "new" ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <Button size="sm" variant="ghost" onClick={dismissNewKey}>
              Dismiss
            </Button>
          </div>
        </Card>
      )}

      {/* Create New Key */}
      {canManage && (
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold">Create New API Key</h3>
          <div className="space-y-4">
            {showProjectSelector && (
              <div>
                <Label htmlFor="projectSelect">Project</Label>
                <Select value={selectedProjectId} onValueChange={setSelectedProjectId} disabled={isCreating}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project..." />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex gap-3">
              <div className="flex-1">
                <Label htmlFor="keyName">Key Name</Label>
                <Input
                  id="keyName"
                  placeholder="My App Production"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  disabled={isCreating}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleCreateKey} disabled={isCreating}>
                  <Plus className="mr-2 h-4 w-4" />
                  {isCreating ? "Creating..." : "Create Key"}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Existing Keys - Only show in single project mode */}
      {!showProjectSelector && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Your API Keys</h3>
          
          {keys.length === 0 ? (
            <Card className="p-6 text-center text-muted-foreground">
              <Key className="mx-auto mb-2 h-8 w-8 opacity-50" />
              <p>No API keys yet. Create one to get started!</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {keys.map((key) => (
                <Card key={key.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{key.name}</h4>
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
                    {canManage && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteKey(key.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Setup Instructions - Only show in single project mode */}
      {!showProjectSelector && (
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold">Setup Instructions</h3>
        <div className="space-y-4 text-sm">
          <div>
            <p className="font-medium">1. Install the pubdev package</p>
            <pre className="mt-2 rounded bg-muted p-3 font-mono">
              npm install -D pubdev
            </pre>
          </div>
          <div>
            <p className="font-medium">2. Initialize in your project</p>
            <pre className="mt-2 rounded bg-muted p-3 font-mono">
              npx pubdev init
            </pre>
          </div>
          <div>
            <p className="font-medium">3. Use your API key and project ID</p>
            <pre className="mt-2 rounded bg-muted p-3 font-mono text-xs">
              {`API Key: <your-key-above>
Project ID: ${showProjectSelector ? '<select-project-from-dropdown-above>' : projectId}`}
            </pre>
          </div>
          <div>
            <p className="mt-4 text-muted-foreground">
              For more information, visit the{" "}
              <a
                href="https://github.com/pubdev/pubdev"
                className="text-primary underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                documentation
              </a>
              .
            </p>
          </div>
        </div>
      </Card>
      )}
    </div>
  )
}

