"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { InlineLoader } from "@/components/inline-loader"
import { useRouter } from "next/navigation"
import { CheckCircle2, AlertCircle, RefreshCw, X, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react"

interface DraftVariantSelectorProps {
  draftId: string
  variants: string[]
  images?: Array<{ prompt: string; url?: string; base64?: string }>
  canPublish: boolean
  status?: string
}

export function DraftVariantSelector({ draftId, variants, images, canPublish, status }: DraftVariantSelectorProps) {
  const [selectedVariant, setSelectedVariant] = useState(0)
  const [customText, setCustomText] = useState(variants[0] || "")
  const [selectedImages, setSelectedImages] = useState<number[]>([])
  const [isPublishing, setIsPublishing] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [publishError, setPublishError] = useState<string | null>(null)
  const [publishSuccess, setPublishSuccess] = useState(false)
  const [regenerateError, setRegenerateError] = useState<string | null>(null)
  const [enlargedImageIndex, setEnlargedImageIndex] = useState<number | null>(null)
  const router = useRouter()

  // Handle ESC key to close enlarged image and arrow keys for navigation
  useEffect(() => {
    function handleKeyboard(e: KeyboardEvent) {
      if (e.key === "Escape" && enlargedImageIndex !== null) {
        setEnlargedImageIndex(null)
      }
      if (e.key === "ArrowLeft" && enlargedImageIndex !== null && enlargedImageIndex > 0) {
        setEnlargedImageIndex(enlargedImageIndex - 1)
      }
      if (e.key === "ArrowRight" && enlargedImageIndex !== null && images && enlargedImageIndex < images.length - 1) {
        setEnlargedImageIndex(enlargedImageIndex + 1)
      }
    }
    
    document.addEventListener("keydown", handleKeyboard)
    return () => document.removeEventListener("keydown", handleKeyboard)
  }, [enlargedImageIndex, images])

  const handleVariantChange = (index: number) => {
    setSelectedVariant(index)
    setCustomText(variants[index])
  }

  const handleImageToggle = (imageIndex: number) => {
    setSelectedImages((prev) => {
      if (prev.includes(imageIndex)) {
        return prev.filter((i) => i !== imageIndex)
      }
      // X allows up to 4 images per tweet
      if (prev.length >= 4) {
        return prev
      }
      return [...prev, imageIndex]
    })
  }

  const handlePublish = async () => {
    if (!canPublish) return

    setIsPublishing(true)
    setPublishError(null)
    setPublishSuccess(false)

    try {
      // Prepare selected images data
      const selectedImagesData = selectedImages
        .map((index) => images?.[index])
        .filter(Boolean)

      const response = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draftId,
          variantPick: selectedVariant,
          text: customText,
          images: selectedImagesData,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to publish")
      }

      setPublishSuccess(true)
      setTimeout(() => {
        router.refresh()
      }, 1500)
    } catch (error) {
      console.error("[catchy] Error publishing:", error)
      setPublishError(error instanceof Error ? error.message : "Failed to publish")
    } finally {
      setIsPublishing(false)
    }
  }

  const handleRegenerate = async () => {
    setIsRegenerating(true)
    setRegenerateError(null)

    try {
      const response = await fetch(`/api/drafts/${draftId}/regenerate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to regenerate")
      }

      // Refresh the page to show new variants
      router.refresh()
    } catch (error) {
      console.error("[catchy] Error regenerating:", error)
      setRegenerateError(error instanceof Error ? error.message : "Failed to regenerate")
    } finally {
      setIsRegenerating(false)
    }
  }

  const handlePreviousImage = () => {
    if (enlargedImageIndex !== null && enlargedImageIndex > 0) {
      setEnlargedImageIndex(enlargedImageIndex - 1)
    }
  }

  const handleNextImage = () => {
    if (enlargedImageIndex !== null && images && enlargedImageIndex < images.length - 1) {
      setEnlargedImageIndex(enlargedImageIndex + 1)
    }
  }

  const isPublished = status === "published"

  return (
    <div className="space-y-4">
      {publishSuccess && (
        <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800">
          <CheckCircle2 className="mb-1 inline h-4 w-4" /> Successfully published to X!
        </div>
      )}

      {publishError && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle className="mb-1 inline h-4 w-4" /> {publishError}
        </div>
      )}

      {regenerateError && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle className="mb-1 inline h-4 w-4" /> {regenerateError}
        </div>
      )}

      {isPublished && (
        <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
          <CheckCircle2 className="mb-1 inline h-4 w-4" /> This draft has been published
        </div>
      )}

      {isRegenerating && (
        <InlineLoader message="Regenerating variants with AI..." />
      )}

      {!isPublished && !isRegenerating && (
        <Button
          onClick={handleRegenerate}
          disabled={isRegenerating}
          variant="outline"
          className="w-full"
          size="sm"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Regenerate Variants
        </Button>
      )}

      {isPublishing && (
        <InlineLoader message="Publishing to X..." />
      )}

      <RadioGroup
        value={selectedVariant.toString()}
        onValueChange={(v) => handleVariantChange(Number.parseInt(v))}
        disabled={isPublished}
      >
        {variants.map((variant, index) => (
          <div key={index} className="flex items-start space-x-2">
            <RadioGroupItem value={index.toString()} id={`variant-${index}`} className="mt-1" />
            <Label htmlFor={`variant-${index}`} className="flex-1 cursor-pointer">
              <div className="rounded-lg border p-3 hover:bg-muted/50">
                <p className="text-sm">{variant}</p>
                <p className="mt-1 text-xs text-muted-foreground">{variant.length} characters</p>
              </div>
            </Label>
          </div>
        ))}
      </RadioGroup>

      <div className="space-y-2">
        <Label htmlFor="custom-text">Customize (optional)</Label>
        <Textarea
          id="custom-text"
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          rows={4}
          maxLength={280}
          disabled={isPublished}
        />
        <p className="text-xs text-muted-foreground">{customText.length} / 280 characters</p>
      </div>

      {images && images.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Select Images to Publish (up to 4)</Label>
          <div className="grid grid-cols-2 gap-3">
            {images.map((image, index) => (
              <div
                key={index}
                className={`group relative cursor-pointer overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                  selectedImages.includes(index)
                    ? "border-primary shadow-lg shadow-primary/20 ring-2 ring-primary/30 ring-offset-2 scale-[1.02]"
                    : "border-border/50 hover:border-primary/50 hover:shadow-md"
                } ${isPublished ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={() => !isPublished && handleImageToggle(index)}
              >
                {image.url ? (
                  <>
                    <img
                      src={image.url}
                      alt={`Generated image ${index + 1}`}
                      className="h-28 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setEnlargedImageIndex(index)
                      }}
                      className="absolute bottom-2 right-2 rounded-full bg-white/90 p-1.5 shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-white hover:scale-110"
                      aria-label="Enlarge image"
                    >
                      <ZoomIn className="h-3.5 w-3.5 text-gray-900" />
                    </button>
                  </>
                ) : (
                  <div className="flex h-28 items-center justify-center rounded-md bg-gradient-to-br from-muted/50 to-muted p-2">
                    <p className="text-center text-xs text-muted-foreground">Image prompt ready</p>
                  </div>
                )}
                {selectedImages.includes(index) && (
                  <div className="absolute right-2 top-2 rounded-full bg-primary p-1 shadow-lg animate-in zoom-in-50 duration-200">
                    <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
            <p className="text-xs font-medium text-muted-foreground">
              {selectedImages.length} of 4 images selected
            </p>
          </div>
        </div>
      )}

      {canPublish ? (
        <Button onClick={handlePublish} disabled={isPublishing || !customText.trim() || isPublished} className="w-full">
          {isPublishing ? "Publishing..." : isPublished ? "Published" : "Publish to X"}
        </Button>
      ) : (
        <p className="text-sm text-muted-foreground">Only admins and owners can publish posts</p>
      )}

      {/* Modern Image Enlargement Modal */}
      {enlargedImageIndex !== null && images?.[enlargedImageIndex]?.url && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setEnlargedImageIndex(null)}
        >
          {/* Close Button */}
          <button
            onClick={() => setEnlargedImageIndex(null)}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2.5 shadow-xl backdrop-blur-md transition-all duration-200 hover:bg-white/20 hover:scale-110 hover:rotate-90"
            aria-label="Close"
          >
            <X className="h-6 w-6 text-white" />
          </button>

          {/* Navigation Arrows */}
          {enlargedImageIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handlePreviousImage()
              }}
              className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 shadow-xl backdrop-blur-md transition-all duration-200 hover:bg-white/20 hover:scale-110"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6 text-white" />
            </button>
          )}
          
          {enlargedImageIndex < images.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleNextImage()
              }}
              className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 shadow-xl backdrop-blur-md transition-all duration-200 hover:bg-white/20 hover:scale-110"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6 text-white" />
            </button>
          )}

          {/* Image Counter */}
          <div className="absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-md">
            <p className="text-sm font-medium text-white">
              {enlargedImageIndex + 1} / {images.length}
            </p>
          </div>

          {/* Image Container */}
          <div
            className="relative flex max-h-[85vh] w-full max-w-6xl flex-col animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative flex items-center justify-center overflow-hidden rounded-2xl bg-black/40 shadow-2xl backdrop-blur-sm">
              <img
                src={images[enlargedImageIndex].url}
                alt={`Generated image ${enlargedImageIndex + 1} - enlarged view`}
                className="max-h-[70vh] w-auto rounded-2xl object-contain"
              />
            </div>
            
            {/* Prompt Display */}
            {images[enlargedImageIndex].prompt && (
              <div className="mt-4 max-h-32 overflow-y-auto rounded-xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-4 shadow-xl backdrop-blur-xl scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-white/20 hover:scrollbar-thumb-white/30">
                <p className="text-sm leading-relaxed text-white/90">
                  <span className="font-semibold text-white">Prompt: </span>
                  {images[enlargedImageIndex].prompt}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
