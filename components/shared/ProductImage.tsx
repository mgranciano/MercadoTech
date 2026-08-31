"use client"

import Image from "next/image"
import { useState } from "react"
import { AlertCircle } from "lucide-react"

interface ProductImageProps {
  src: string
  alt: string
  className?: string
  width?: number
  height?: number
  priority?: boolean
  fill?: boolean
}

export function ProductImage({
  src,
  alt,
  className = "w-full h-auto",
  width = 400,
  height = 400,
  priority = false,
  fill = false,
}: ProductImageProps) {
  const [error, setError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-muted ${className}`}>
        <div className="text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-xs text-muted-foreground">{alt}</p>
        </div>
      </div>
    )
  }

  if (fill) {
    return (
      <div className={`relative bg-muted ${className}`}>
        <Image
          src={src}
          alt={alt}
          fill
          className={`object-cover ${isLoading ? "animate-pulse" : ""}`}
          priority={priority}
          onError={() => setError(true)}
          onLoad={() => setIsLoading(false)}
        />
      </div>
    )
  }

  return (
    <div className={`relative bg-muted ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`object-cover ${isLoading ? "animate-pulse" : ""}`}
        priority={priority}
        onError={() => setError(true)}
        onLoadingComplete={() => setIsLoading(false)}
      />
    </div>
  )
}
