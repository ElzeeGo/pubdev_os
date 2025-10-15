"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { VideoStyleTemplates } from "@/components/video-style-templates"
import { ImageStyleTemplates } from "@/components/image-style-templates"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

interface SettingsFormProps {
  user: {
    name: string
    email: string
    settings: {
      tone?: string
      audience?: string
      hashtags?: string[]
      generateImages?: boolean
      imageStyle?: string
      generateVideos?: boolean
      videoModel?: "sora-2" | "sora-2-pro"
      videoDuration?: 4 | 8 | 12
      videoSize?: "1280x720" | "720x1280" | "1792x1024" | "1024x1792"
      videoStyle?: string
    }
  }
}

export function SettingsForm({ user }: SettingsFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [name, setName] = useState(user.name)
  const [tone, setTone] = useState(user.settings.tone || "professional")
  const [audience, setAudience] = useState(user.settings.audience || "developers")
  const [hashtags, setHashtags] = useState(user.settings.hashtags?.join(", ") || "")
  const [generateImages, setGenerateImages] = useState(user.settings.generateImages || false)
  const [imageStyle, setImageStyle] = useState(
    user.settings.imageStyle || "modern and minimalist, vibrant colors, tech-focused. Clean composition with clear visual hierarchy. Soft lighting, no harsh shadows. Cool color palette with one accent color. Sans-serif typography (Inter/SF). Focused on the product/feature. White or neutral background. Simple geometric shapes. High contrast for readability. Professional and polished. Output: 1920×1080 or 2048×2048, PNG."
  )
  const [generateVideos, setGenerateVideos] = useState(user.settings.generateVideos || false)
  const [videoModel, setVideoModel] = useState<"sora-2" | "sora-2-pro">(
    user.settings.videoModel || "sora-2"
  )
  const [videoDuration, setVideoDuration] = useState<4 | 8 | 12>(
    user.settings.videoDuration || 4
  )
  const [videoSize, setVideoSize] = useState<"1280x720" | "720x1280" | "1792x1024" | "1024x1792">(
    user.settings.videoSize || "1280x720"
  )
  const [videoStyle, setVideoStyle] = useState(
    user.settings.videoStyle || "Style: modern, clean UI, focus on clarity. Shots: intro logo bumper (0–2s), feature overview (2–8s), step-by-step demo (8–22s), closing CTA (22–30s). Camera: slow dolly-ins and parallax pans; keep motion subtle and continuous. Edits: smooth match cuts and 8–12 frame crossfades; occasional whip-pan transition between sections. Lighting: soft three-point lighting; key at 45°, soft fill, gentle rim; neutral HDRI reflections for UI mockups. Color: cool neutrals with one accent color; mild filmic contrast. Graphics: tasteful UI overlays and callouts with short labels (<6 words). Text: title safe area; high contrast; font 'Inter' or similar. Music/SFX: light tech ambient bed; soft UI click and whoosh cues; use J/L-cuts for continuity. Framing: 16:9 4K (3840×2160), 24 fps, 180° shutter look (natural motion blur). Avoid: jittery zooms, harsh spotlights, fast cuts under 8 frames, busy backgrounds."
  )

  async function handleSave() {
    setIsLoading(true)
    setIsSaved(false)

    try {
      const response = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          settings: {
            tone,
            audience,
            hashtags: hashtags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean),
            generateImages,
            imageStyle,
            generateVideos,
            videoModel,
            videoDuration,
            videoSize,
            videoStyle,
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save settings")
      }

      setIsSaved(true)
      router.refresh()

      // Reset success message after 3 seconds
      setTimeout(() => {
        setIsSaved(false)
      }, 3000)
    } catch (error) {
      console.error("Error saving settings:", error)
      alert("Failed to save settings. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={user.email} disabled />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>
        </CardContent>
      </Card>

      {/* Content Generation Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Content Generation</CardTitle>
          <CardDescription>Default settings for AI-generated posts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="tone">Tone</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger id="tone">
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="audience">Target Audience</Label>
            <Select value={audience} onValueChange={setAudience}>
              <SelectTrigger id="audience">
                <SelectValue placeholder="Select audience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="developers">Developers</SelectItem>
                <SelectItem value="technical-users">Technical Users</SelectItem>
                <SelectItem value="general-public">General Public</SelectItem>
                <SelectItem value="business">Business Professionals</SelectItem>
                <SelectItem value="designers">Designers</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="hashtags">Default Hashtags</Label>
            <Input
              id="hashtags"
              type="text"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              placeholder="#webdev, #coding, #tech"
            />
            <p className="text-xs text-muted-foreground">Comma-separated list</p>
          </div>
        </CardContent>
      </Card>

      {/* Image Generation Settings */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Image Generation</CardTitle>
          <CardDescription>Configure AI image generation for your posts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="generateImages"
              checked={generateImages}
              onChange={(e) => setGenerateImages(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="generateImages" className="cursor-pointer">
              Enable automatic image generation for posts
            </Label>
          </div>

          {generateImages && (
            <ImageStyleTemplates 
              value={imageStyle} 
              onChange={setImageStyle} 
            />
          )}
        </CardContent>
      </Card>

      {/* Video Generation Settings */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Video Generation with Sora 2</CardTitle>
          <CardDescription>Configure AI video generation for your posts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="generateVideos"
              checked={generateVideos}
              onChange={(e) => setGenerateVideos(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="generateVideos" className="cursor-pointer">
              Enable automatic video generation for posts
            </Label>
          </div>

          {generateVideos && (
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="videoModel">Video Model</Label>
                <Select value={videoModel} onValueChange={(v) => setVideoModel(v as "sora-2" | "sora-2-pro")}>
                  <SelectTrigger id="videoModel">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sora-2">Sora 2 (Fast, Good Quality)</SelectItem>
                    <SelectItem value="sora-2-pro">Sora 2 Pro (Slow, Best Quality)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {videoModel === "sora-2" ? "$0.25/sec (~$1.00 for 4 sec)" : (
                    videoSize === "1792x1024" || videoSize === "1024x1792"
                      ? "$1.25/sec (~$5.00 for 4 sec, wide format)"
                      : "$0.75/sec (~$3.00 for 4 sec)"
                  )}
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="videoDuration">Default Duration</Label>
                <Select value={videoDuration.toString()} onValueChange={(v) => setVideoDuration(Number(v) as 4 | 8 | 12)}>
                  <SelectTrigger id="videoDuration">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4">4 seconds</SelectItem>
                    <SelectItem value="8">8 seconds</SelectItem>
                    <SelectItem value="12">12 seconds</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="videoSize">Default Format</Label>
                <Select value={videoSize} onValueChange={(v) => setVideoSize(v as "1280x720" | "720x1280" | "1792x1024" | "1024x1792")}>
                  <SelectTrigger id="videoSize">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1280x720">1280x720 - Landscape (16:9)</SelectItem>
                    <SelectItem value="720x1280">720x1280 - Portrait (9:16)</SelectItem>
                    <SelectItem value="1792x1024">1792x1024 - Wide Landscape</SelectItem>
                    <SelectItem value="1024x1792">1024x1792 - Tall Portrait</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <VideoStyleTemplates 
                value={videoStyle} 
                onChange={setVideoStyle} 
              />

              <div className="rounded-lg bg-blue-50 p-3 text-sm">
                <p className="font-medium text-blue-900">💡 Video Generation Tips</p>
                <ul className="mt-2 space-y-1 text-blue-800">
                  <li>• Videos take 2-5 minutes to generate</li>
                  <li>• Sora 2 Pro produces higher quality but costs more</li>
                  <li>• Longer videos cost proportionally more</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="lg:col-span-2">
        <Button onClick={handleSave} disabled={isLoading} className="w-full" size="lg">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : isSaved ? (
            <>✓ Settings Saved!</>
          ) : (
            "Save All Settings"
          )}
        </Button>
      </div>
    </div>
  )
}

