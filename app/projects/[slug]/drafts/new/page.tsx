"use client"

import type React from "react"

import { NavHeader } from "@/components/nav-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { InlineLoader } from "@/components/inline-loader"
import { VideoStyleTemplates } from "@/components/video-style-templates"
import { useRouter, useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { ArrowLeft, Plus, X } from "lucide-react"
import Link from "next/link"

export default function NewDraftPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [repository, setRepository] = useState("")
  const [changes, setChanges] = useState<string[]>([""])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<{ email?: string; name?: string } | null>(null)
  const [projectId, setProjectId] = useState<string | null>(null)
  
  // Video generation options
  const [generateVideo, setGenerateVideo] = useState(false)
  const [videoModel, setVideoModel] = useState<"sora-2" | "sora-2-pro">("sora-2")
  const [videoDuration, setVideoDuration] = useState<4 | 8 | 12>(4)
  const [videoSize, setVideoSize] = useState<"1280x720" | "720x1280" | "1792x1024" | "1024x1792">("1280x720")
  const [videoStyle, setVideoStyle] = useState("Style: modern, clean UI, focus on clarity. Shots: intro logo bumper (0–2s), feature overview (2–8s), step-by-step demo (8–22s), closing CTA (22–30s). Camera: slow dolly-ins and parallax pans; keep motion subtle and continuous. Edits: smooth match cuts and 8–12 frame crossfades; occasional whip-pan transition between sections. Lighting: soft three-point lighting; key at 45°, soft fill, gentle rim; neutral HDRI reflections for UI mockups. Color: cool neutrals with one accent color; mild filmic contrast. Graphics: tasteful UI overlays and callouts with short labels (<6 words). Text: title safe area; high contrast; font 'Inter' or similar. Music/SFX: light tech ambient bed; soft UI click and whoosh cues; use J/L-cuts for continuity. Framing: 16:9 4K (3840×2160), 24 fps, 180° shutter look (natural motion blur). Avoid: jittery zooms, harsh spotlights, fast cuts under 8 frames, busy backgrounds.")
  
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string

  useEffect(() => {
    // Fetch current user and project
    Promise.all([
      fetch("/api/auth/me").then((res) => res.json()),
      fetch(`/api/projects/${slug}`).then((res) => res.json()),
    ])
      .then(([userData, projectData]) => {
        setUser(userData.user)
        setProjectId(projectData.project?.id)
      })
      .catch(() => {})
  }, [slug])

  const handleAddChange = () => {
    setChanges([...changes, ""])
  }

  const handleRemoveChange = (index: number) => {
    setChanges(changes.filter((_, i) => i !== index))
  }

  const handleChangeUpdate = (index: number, value: string) => {
    const newChanges = [...changes]
    newChanges[index] = value
    setChanges(newChanges)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!projectId) {
      setError("Project not found")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          context: {
            title,
            description,
            repository,
            changes: changes.filter((c) => c.trim()),
          },
          videoOptions: generateVideo ? {
            model: videoModel,
            duration: videoDuration,
            size: videoSize,
            style: videoStyle,
          } : null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to create draft")
      }

      const { draft } = await response.json()
      router.push(`/drafts/${draft.id}`)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {user && <NavHeader user={user} />}
      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <Button asChild variant="ghost" size="sm" className="mb-4">
            <Link href={`/projects/${slug}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to project
            </Link>
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Create new draft</CardTitle>
              <CardDescription>Provide context to generate post variants</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      type="text"
                      placeholder="v2.0 Release"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="What's new in this release?"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="repository">Repository (optional)</Label>
                    <Input
                      id="repository"
                      type="text"
                      placeholder="github.com/user/repo"
                      value={repository}
                      onChange={(e) => setRepository(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label>Changes (optional)</Label>
                      <Button type="button" variant="outline" size="sm" onClick={handleAddChange}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add change
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {changes.map((change, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            type="text"
                            placeholder="Added new feature..."
                            value={change}
                            onChange={(e) => handleChangeUpdate(index, e.target.value)}
                          />
                          {changes.length > 1 && (
                            <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveChange(index)}>
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Video Generation Section */}
                  <div className="rounded-lg border p-4 space-y-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="generateVideo"
                        checked={generateVideo}
                        onChange={(e) => setGenerateVideo(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="generateVideo" className="cursor-pointer font-medium">
                        Generate AI Video with Sora 2
                      </Label>
                    </div>

                    {generateVideo && (
                      <div className="space-y-4 pl-6 border-l-2">
                        <div className="grid gap-2">
                          <Label htmlFor="videoModel">Video Quality</Label>
                          <select
                            id="videoModel"
                            value={videoModel}
                            onChange={(e) => setVideoModel(e.target.value as "sora-2" | "sora-2-pro")}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          >
                            <option value="sora-2">Sora 2 (Fast, Good Quality)</option>
                            <option value="sora-2-pro">Sora 2 Pro (Slow, Best Quality)</option>
                          </select>
                          <p className="text-xs text-muted-foreground">
                            {videoModel === "sora-2" ? "~$1.00/4sec, $2.00/8sec, $3.00/12sec" : (
                              videoSize === "1792x1024" || videoSize === "1024x1792" 
                                ? "~$5.00/4sec, $10.00/8sec, $15.00/12sec (wide)" 
                                : "~$3.00/4sec, $6.00/8sec, $9.00/12sec"
                            )}
                          </p>
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="videoDuration">Video Length</Label>
                          <select
                            id="videoDuration"
                            value={videoDuration}
                            onChange={(e) => setVideoDuration(Number(e.target.value) as 4 | 8 | 12)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          >
                            <option value={4}>4 seconds</option>
                            <option value={8}>8 seconds</option>
                            <option value={12}>12 seconds</option>
                          </select>
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="videoSize">Video Format</Label>
                          <select
                            id="videoSize"
                            value={videoSize}
                            onChange={(e) => setVideoSize(e.target.value as "1280x720" | "720x1280" | "1792x1024" | "1024x1792")}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          >
                            <option value="1280x720">1280x720 - Landscape (16:9)</option>
                            <option value="720x1280">720x1280 - Portrait (9:16)</option>
                            <option value="1792x1024">1792x1024 - Wide Landscape</option>
                            <option value="1024x1792">1024x1792 - Tall Portrait</option>
                          </select>
                        </div>

                        <VideoStyleTemplates 
                          value={videoStyle} 
                          onChange={setVideoStyle} 
                        />

                        <p className="text-xs text-muted-foreground bg-blue-50 p-2 rounded">
                          💡 Video will be generated based on your title and description. This may take 2-5 minutes.
                        </p>
                      </div>
                    )}
                  </div>

                  {error && <p className="text-sm text-red-500">{error}</p>}

                  {isLoading && (
                    <InlineLoader message="Generating draft variants with AI..." />
                  )}

                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Generating..." : "Generate drafts"}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
