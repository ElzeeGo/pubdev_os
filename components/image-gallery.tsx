"use client"

import { useState, useEffect } from "react"
import { X, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react"

interface ImageGalleryProps {
  images: Array<{ prompt: string; url?: string; base64?: string }>
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const [enlargedImageIndex, setEnlargedImageIndex] = useState<number | null>(null)

  // Handle ESC key to close enlarged image
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape" && enlargedImageIndex !== null) {
        setEnlargedImageIndex(null)
      }
      if (e.key === "ArrowLeft" && enlargedImageIndex !== null && enlargedImageIndex > 0) {
        setEnlargedImageIndex(enlargedImageIndex - 1)
      }
      if (e.key === "ArrowRight" && enlargedImageIndex !== null && enlargedImageIndex < images.length - 1) {
        setEnlargedImageIndex(enlargedImageIndex + 1)
      }
    }
    
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [enlargedImageIndex, images.length])

  const handlePrevious = () => {
    if (enlargedImageIndex !== null && enlargedImageIndex > 0) {
      setEnlargedImageIndex(enlargedImageIndex - 1)
    }
  }

  const handleNext = () => {
    if (enlargedImageIndex !== null && enlargedImageIndex < images.length - 1) {
      setEnlargedImageIndex(enlargedImageIndex + 1)
    }
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {images.map((image, index) => (
          <div key={index} className="group space-y-3">
            <div className="relative aspect-video overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-muted/50 to-muted shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
              {image.url ? (
                <>
                  <img
                    src={image.url}
                    alt={`Generated image ${index + 1}`}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <button
                    onClick={() => setEnlargedImageIndex(index)}
                    className="absolute bottom-3 right-3 rounded-full bg-white/90 p-2.5 shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-white hover:scale-110 hover:shadow-xl"
                    aria-label="Enlarge image"
                  >
                    <ZoomIn className="h-4 w-4 text-gray-900" />
                  </button>
                </>
              ) : (
                <div className="flex h-full items-center justify-center p-4 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Image prompt ready</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      (DALL-E integration needed)
                    </p>
                  </div>
                </div>
              )}
            </div>
            <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">{image.prompt}</p>
          </div>
        ))}
      </div>

      {/* Modern Image Enlargement Modal */}
      {enlargedImageIndex !== null && images[enlargedImageIndex]?.url && (
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
                handlePrevious()
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
                handleNext()
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
    </>
  )
}

