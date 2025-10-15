"use client"

import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"

interface VideoStyleTemplate {
  id: string
  name: string
  description: string
  style: string
  tags: string[]
}

const videoStyleTemplates: VideoStyleTemplate[] = [
  {
    id: "product-update",
    name: "Product Update",
    description: "20-30s product update video",
    style: "Style: modern, clean UI, focus on clarity. Shots: intro logo bumper (0–2s), feature overview (2–8s), step-by-step demo (8–22s), closing CTA (22–30s). Camera: slow dolly-ins and parallax pans; keep motion subtle and continuous. Edits: smooth match cuts and 8–12 frame crossfades; occasional whip-pan transition between sections. Lighting: soft three-point lighting; key at 45°, soft fill, gentle rim; neutral HDRI reflections for UI mockups. Color: cool neutrals with one accent color; mild filmic contrast. Graphics: tasteful UI overlays and callouts with short labels (<6 words). Text: title safe area; high contrast; font 'Inter' or similar. Music/SFX: light tech ambient bed; soft UI click and whoosh cues; use J/L-cuts for continuity. Framing: 16:9 4K (3840×2160), 24 fps, 180° shutter look (natural motion blur). Avoid: jittery zooms, harsh spotlights, fast cuts under 8 frames, busy backgrounds.",
    tags: ["Product", "20-30s"],
  },
  {
    id: "feature-showcase",
    name: "Feature Showcase",
    description: "28s feature demo with code",
    style: "28s product update video. Follow the 5-shot structure (bumper → compare → demo → code peek → CTA). Camera: soft dolly-ins, parallax pans, subtle rack focus; no abrupt zooms. Lighting: soft three-point (key 60/fill 35/rim 20), neutral 5400K, mild HDRI. Edits: match cuts on UI alignment; 10-frame crossfades; whip-pan between sections. Graphics: Inter type, labels ≤6 words; accent color; title-safe margins. Include UI cursor interactions and micro-animations (hover, click, progress). Show a 2-line code snippet; monospace panel with highlight. Music: light ambient bed; quiet whooshes; L-cuts across transitions. Output: 3840×2160, 24 fps, H.264, ~45 Mbps, audio −15 LUFS.",
    tags: ["Demo", "28s"],
  },
  {
    id: "developer-update",
    name: "Developer Update",
    description: "30s developer-focused update",
    style: "30s developer update video. Show JSON payload diff (before→after), then a live test call, then logs. Camera: diagonal pan on code, macro depth; 6% dolly; rack focus to highlights. Lighting: cool neutral; rim light +25% on code panel; clean, low-glare. Edits: match cut on braces/line numbers; 12-frame crossfade; whip-pan to logs. Overlays: 3 numbered callouts. Accent color; Inter font. Keep text ≤6 words, high contrast. Music minimal; UI bleeps at actions; J-cut narration under 2s. Export 4K/24p; −1 dBTP; −14 LUFS.",
    tags: ["Code", "30s"],
  },
  {
    id: "anime-style",
    name: "Anime Style",
    description: "Cel-shaded anime aesthetic",
    style: "Style: cel-shaded, clean UI with anime accents; clear outlines, soft bloom. Shots: intro logo bumper (0–2s), feature overview (2–8s), step-by-step demo (8–22s), closing CTA (22–30s). Camera: slow dolly-ins, parallax pans; occasional rack-focus 'anime pull'; subtle parallax on layered UI. Edits: match cuts; 8–12 frame crossfades; stylized 6–8 frame 'speedline' wipe between sections. Lighting: soft three-point with gentle rim; warm key at 45°; slight screen-space glow on highlights. Color: cool neutrals + one accent; cel-shade shadows (two tones); mild filmic contrast. Graphics: anime UI callouts; sticker-style arrows; labels under 6 words. Text: title-safe; Inter or rounded gothic; add small furigana-style subtitle for key terms if shown. Music/SFX: light lo-fi/anime OST bed; soft UI clicks; brief whoosh/kira-kira sparkles on reveals; J/L-cuts. Framing: 16:9 4K (3840×2160), 24 fps (animate 'on twos' where fitting), 180° shutter look. Avoid: heavy bloom, neon gradients, shaky zooms, oversaturated skin tones, long static holds.",
    tags: ["Anime", "Creative"],
  },
  {
    id: "social-viral",
    name: "Social Viral",
    description: "Bold TikTok/social style",
    style: "Style: bold, minimal UI; kinetic captions; quick pace; meme-aware but clean. Shots: hook bumper (0–2s, punchy headline), feature overview (2–6s), fast demo beats (6–15s), CTA (15–20s). Camera: quick 3–5% push-ins; handheld-feel micro-moves; parallax pans on beats. Edits: match cuts + 4–8 frame whip/flash cuts on beat; jump cuts allowed for rhythm; 6–8 frame crossfades sparingly. Lighting: bright soft box; high fill (reduce harsh contrast); neutral HDRI for UI; crisp whites. Color: neutral base + one pop accent; high contrast; slight punchy saturation. Graphics: big captions (auto-sub style), emojis sparingly, label text ≤6 words; kinetic text (120–180ms). Text: keep within safe margins; Inter/SF/Roboto Bold for hooks; outline or drop-shadow for readability. Music/SFX: trendy upbeat bed; snappy whooshes/taps; beat-synced cuts; J-cuts into scenes. Framing: 9:16 vertical 4K (2160×3840), 30 fps, natural motion blur; safe areas for TikTok UI (top/bottom). Avoid: dense paragraphs, oversaturated skin tones, long static holds.",
    tags: ["Social", "Vertical"],
  },
  {
    id: "micro-update",
    name: "Micro Update",
    description: "10-12s quick update with presenter",
    style: "product micro-update. Style: modern, clean UI, clarity first. Presenter: 'Confident Operator'—tailored navy/charcoal suit, white shirt (no tie), slicked/cropped hair, groomed beard or clean-shaven, subtle gold chain or watch. Upright posture, purposeful, minimal gestures. Shots & timing: 0.0–1.0s Bumper: logo in; Operator adjusts cuff, nods. On-screen feature name. 1.0–8.5s Demo+Code: cursor performs action → code panel slides in (match cut). Highlight API lines; inline tags: 'auth', 'retry', 'typed'. Quick UI result toast. 8.5–12s CTA: metric card impact; end card with docs URL. Camera: slow 4–6% dolly; gentle parallax; 0.3s rack focus UI→code. Lighting: soft three-point; key 45°, soft fill, gentle rim; neutral HDRI. Edits: match cuts; 8–10 frame crossfades; one whip-pan into demo. Color: cool neutrals + accent; mild filmic contrast. Graphics/Text: Inter; labels ≤3 words. Title-safe margins (8%). Music/SFX: light tech ambient; soft clicks/whooshes with J/L-cuts. Keep SFX under −18 LUFS; clicks ≈ −12 dB peak. Framing/Export: 3840×2160 (16:9), 24 fps, 180° shutter look. H.264 High (35–50 Mbps) or ProRes 422. Audio −14 to −16 LUFS, true peak ≤ −1 dBFS. Avoid: jittery zooms, harsh spots, cuts <8 frames, busy backgrounds.",
    tags: ["Quick", "Presenter"],
  },
]

interface VideoStyleTemplatesProps {
  value: string
  onChange: (value: string) => void
}

export function VideoStyleTemplates({ value, onChange }: VideoStyleTemplatesProps) {
  const handleTemplateSelect = (template: VideoStyleTemplate) => {
    onChange(template.style)
  }

  const isTemplateSelected = (template: VideoStyleTemplate) => {
    return value.trim().toLowerCase() === template.style.trim().toLowerCase()
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label>Choose a Template</Label>
        <div className="grid gap-2 sm:grid-cols-2">
          {videoStyleTemplates.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => handleTemplateSelect(template)}
              className={`relative rounded-lg border p-4 text-left transition-all hover:border-primary hover:bg-accent ${
                isTemplateSelected(template)
                  ? "border-primary bg-accent ring-2 ring-primary ring-offset-2"
                  : "border-input"
              }`}
            >
              {isTemplateSelected(template) && (
                <div className="absolute top-2 right-2">
                  <div className="rounded-full bg-primary p-1">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <div className="font-semibold">{template.name}</div>
                <p className="text-xs text-muted-foreground">{template.description}</p>
                <div className="flex flex-wrap gap-1">
                  {template.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="videoStyle">Custom Style (or edit template)</Label>
        <Textarea
          id="videoStyle"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="modern, professional, smooth camera motion, cinematic"
          rows={3}
        />
        <p className="text-xs text-muted-foreground">
          Describe the visual style for your videos. You can select a template above or write your own.
        </p>
      </div>
    </div>
  )
}

