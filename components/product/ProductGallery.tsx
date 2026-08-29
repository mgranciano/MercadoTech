"use client"

import { useState } from "react"
import { ProductImage } from "@/components/shared/ProductImage"
import { cn } from "@/lib/utils"

interface GalleryImage {
  id: string
  image_url: string
}

interface ProductGalleryProps {
  images: GalleryImage[]
  title: string
}

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  if (images.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-muted text-muted-foreground">
        Sin imágenes
      </div>
    )
  }

  const goTo = (index: number) => {
    setActiveIndex((index + images.length) % images.length)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") goTo(activeIndex + 1)
    if (e.key === "ArrowLeft") goTo(activeIndex - 1)
  }

  const active = images[activeIndex]

  return (
    <div className="flex flex-col gap-3">
      <div
        className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
        tabIndex={0}
        role="group"
        aria-label={`Galería de imágenes de ${title}`}
        onKeyDown={handleKeyDown}
      >
        <ProductImage src={active.image_url} alt={title} fill priority className="w-full h-full" />
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`Ver imagen ${index + 1} de ${images.length}`}
              aria-current={index === activeIndex}
              className={cn(
                "relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 transition-colors",
                index === activeIndex ? "border-primary" : "border-transparent"
              )}
            >
              <ProductImage
                src={image.image_url}
                alt={`${title} - imagen ${index + 1}`}
                fill
                className="w-full h-full pointer-events-none"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
