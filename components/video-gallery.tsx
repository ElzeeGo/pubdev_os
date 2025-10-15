"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

interface VideoAsset {
  id: string
  prompt: string
  url?: string
  status: "queued" | "in_progress" | "completed" | "failed"
  progress?: number
  model: "sora-2" | "sora-2-pro"
  duration: number
  size: string
  created_at: string
  completed_at?: string
  error?: string
}

interface VideoGalleryProps {
  videos: VideoAsset[]
}

export function VideoGallery({ videos }: VideoGalleryProps) {
  if (!videos || videos.length === 0) {
    return null
  }

  return (
    <div className="grid gap-4">
      {videos.map((video) => (
        <Card key={video.id} className="overflow-hidden">
          {video.status === "completed" && video.url ? (
            <div className="space-y-2">
              <video 
                src={video.url} 
                controls 
                className="w-full bg-black"
                poster="/placeholder.jpg"
              >
                Your browser does not support the video tag.
              </video>
              <div className="p-4 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary">{video.model}</Badge>
                  <Badge variant="outline">{video.duration}s</Badge>
                  <Badge variant="outline">{video.size}</Badge>
                </div>
                {video.prompt && (
                  <p className="text-sm text-muted-foreground">
                    <strong>Prompt:</strong> {video.prompt}
                  </p>
                )}
              </div>
            </div>
          ) : video.status === "failed" ? (
            <div className="p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="destructive" className="text-sm">❌ Failed</Badge>
                <Badge variant="outline">{video.model}</Badge>
                <Badge variant="outline">{video.duration}s</Badge>
                <Badge variant="outline">{video.size}</Badge>
              </div>
              <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                <p className="text-sm font-medium text-red-900 mb-1">
                  Video Generation Error
                </p>
                <p className="text-sm text-red-700">
                  {video.error || "Video generation failed - no error details provided"}
                </p>
              </div>
              {video.prompt && (
                <p className="text-xs text-muted-foreground">
                  <strong>Attempted prompt:</strong> {video.prompt}
                </p>
              )}
            </div>
          ) : (
            <div className="p-6 text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <Badge variant="secondary">
                  {video.status === "queued" ? "Queued" : "Generating"}
                </Badge>
              </div>
              {video.progress !== undefined && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Progress: {video.progress}%
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${video.progress}%` }}
                    />
                  </div>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                This may take 2-5 minutes...
              </p>
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}

