import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface ContainerProps {
  children: ReactNode
  className?: string
  as?: "div" | "section" | "article" | "main"
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "content" | "full"
}

const maxWidthMap = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  // Ancho de página para catálogo/paneles (mockup: max-w-[1440px]). No es
  // "2xl" de Tailwind (672px, pensado para texto) — ese queda disponible
  // para quien sí quiera una columna angosta.
  content: "max-w-[1440px]",
  full: "max-w-none",
}

export function Container({
  children,
  className = "",
  as: Component = "div",
  maxWidth = "content",
}: ContainerProps) {
  return (
    <Component
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        maxWidthMap[maxWidth],
        className
      )}
    >
      {children}
    </Component>
  )
}
