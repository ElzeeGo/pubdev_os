"use client"

import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"

interface ImageStyleTemplate {
  id: string
  name: string
  description: string
  style: string
  tags: string[]
}

const imageStyleTemplates: ImageStyleTemplate[] = [
  {
    id: "hero-presenter",
    name: "Hero with Presenter",
    description: "Professional presenter with UI and code",
    style: "Create a hero image. Subject: 'Confident Operator' presenter in a sharp navy/charcoal suit, white shirt (no tie), subtle gold chain or watch; upright posture; purposeful gaze. Over-shoulder view to a clean desktop UI and a small code panel. Composition: medium 3/4 shot of presenter on left third; product UI and code panel on right two-thirds; clear visual hierarchy (Title → UI → Code → CTA). Camera/Lighting: mild 5% parallax angle; soft three-point lighting (key 45°, soft fill, gentle rim); neutral HDRI reflections on screens. Design: Title with feature name; Badges ≤3 words each ('Setup', 'Call', 'Result'); CTA chip with docs URL; Code panel: monospace with syntax highlight; highlight 2–3 active lines. Color: cool neutrals + accent color; mild filmic contrast. Font: Inter/SF. Output: 3840×2160 (16:9) and 2048×2048 (1:1), PNG, transparent-safe margins 8%. Avoid: busy backgrounds, harsh spotlights, brand logos on props, active smoking.",
    tags: ["Professional", "16:9"],
  },
  {
    id: "anime-poster",
    name: "Anime Poster",
    description: "Cel-shaded anime style feature poster",
    style: "Create an anime-style feature poster. Subject: heroic anime presenter (gender-neutral), sleek blazer, clean lines; dynamic pose pointing toward a floating UI window and code spell-runes (code panel with syntax glow). Style: crisp cel shading, thin line art, subtle halftone texture; limited palette of cool neutrals + accent color. Composition: character on right third; large UI card and compact code panel on left; motion streaks subtly direct eyes from title → UI → code → CTA. Design: Title (kanban-style banner); Micro-labels ≤3 words ('Fewer steps', 'Typed API', 'Retry'); Code panel: 2–3 lines with glowing selection; CTA sticker with docs URL; Font: geometric sans (anime poster vibe), high contrast. Lighting/FX: soft rim light; gentle bloom on accent; tiny particle dust for depth. Output: 2160×2700 (4:5 Instagram), PNG. Avoid: chibi/exaggerated proportions, neon gradients, illegible small text.",
    tags: ["Anime", "4:5"],
  },
  {
    id: "social-vertical",
    name: "Social Vertical",
    description: "9:16 announcement card for Gen Z",
    style: "Design a vertical announcement card (9:16) targeting Gen Z. Layout: bold title at top; split middle with UI screenshot (left) and code snippet (right); punchy CTA bar at bottom. Style: clean, minimal; big type; sticker-like badges; subtle shadow depth; short captions only. Color/Type: cool neutrals + accent color; large Inter/SF headline; monospace for code. Elements: Top with feature name; Badges ('1 tap', 'Typed', 'Faster'); Code: 2–3 lines with highlight; oversized caret; CTA bar with docs URL; Optional presenter insert: small circle portrait of the 'Confident Operator' (no tie). Camera/Lighting: flat lay UI with slight 3D tilt; soft even light; no harsh reflections. Output: 1080×1920 (9:16), PNG. Avoid: overused gradients, tiny text, heavy drop shadows, meme clutter.",
    tags: ["Social", "9:16"],
  },
  {
    id: "heist-noir",
    name: "Heist Noir",
    description: "Industrial grit with cinematic lighting",
    style: "Create a heist-noir themed feature image. Mood: industrial grit (steel/concrete), faint vignette, cool neutrals + accent color. Subject: composed presenter (tailored dark suit) in profile, foreground; in the background, a floating UI panel and a code panel like a 'blueprint'. Composition: presenter on left third; UI and code stacked on right; diagonal light slice across panels; clear hierarchy (Title → UI → Code → CTA). Lighting/Camera: soft key at 45°, stronger rim for silhouette; shallow depth of field; mild lens bloom on accent elements. Design: Title with feature name; Micro-labels ≤3 words ('Cleaner API', 'Idempotent', 'Typed'); Code: highlight critical line; add breadcrumb path; CTA chip with docs URL; Font: Inter/Roboto. Output: 3840×2160 (16:9) and 1440×1440 (1:1), PNG. Avoid: cliché hacker rain/green matrix, crushed blacks, illegible code.",
    tags: ["Cinematic", "16:9"],
  },
  {
    id: "minimal-clean",
    name: "Minimal Clean",
    description: "Simple modern design focused on clarity",
    style: "modern and minimalist, vibrant colors, tech-focused. Clean composition with clear visual hierarchy. Soft lighting, no harsh shadows. Cool color palette with one accent color. Sans-serif typography (Inter/SF). Focused on the product/feature. White or neutral background. Simple geometric shapes. High contrast for readability. Professional and polished. Output: 1920×1080 or 2048×2048, PNG.",
    tags: ["Minimal", "Simple"],
  },
  {
    id: "vibrant-tech",
    name: "Vibrant Tech",
    description: "Bold colors with modern tech aesthetic",
    style: "vibrant, modern tech aesthetic, eye-catching visuals. Bold color gradients with accent colors. Geometric patterns and shapes. Futuristic UI elements. Dynamic composition with energy. Soft glow effects on highlights. Clean sans-serif fonts. Tech-inspired graphics. High contrast. Professional polish. Output: 1920×1080, PNG.",
    tags: ["Vibrant", "Modern"],
  },
]

interface ImageStyleTemplatesProps {
  value: string
  onChange: (value: string) => void
}

export function ImageStyleTemplates({ value, onChange }: ImageStyleTemplatesProps) {
  const handleTemplateSelect = (template: ImageStyleTemplate) => {
    onChange(template.style)
  }

  const isTemplateSelected = (template: ImageStyleTemplate) => {
    return value.trim().toLowerCase() === template.style.trim().toLowerCase()
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label>Choose a Template</Label>
        <div className="grid gap-2 sm:grid-cols-2">
          {imageStyleTemplates.map((template) => (
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
        <Label htmlFor="imageStyle">Custom Style (or edit template)</Label>
        <Textarea
          id="imageStyle"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="modern and minimalist, vibrant colors, tech-focused"
          rows={3}
        />
        <p className="text-xs text-muted-foreground">
          Describe the visual style for your images. You can select a template above or write your own.
        </p>
      </div>
    </div>
  )
}

