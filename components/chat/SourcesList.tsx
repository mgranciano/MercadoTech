import Link from "next/link"
import { ProductImage } from "@/components/shared/ProductImage"
import { Price } from "@/components/shared/Price"
import type { ChatSource } from "@/types/chat"

interface SourcesListProps {
  sources: ChatSource[]
  className?: string
}

// Puro: solo props → render. Producto → mini-card con imagen/precio y link
// a /producto/[id]; artículo → título con ancla a /soporte (su página
// propia llega después de esta sesión).
export function SourcesList({ sources, className }: SourcesListProps) {
  if (sources.length === 0) return null

  return (
    <div className={className}>
      <p className="mb-2 text-xs font-semibold text-muted-foreground">Fuentes</p>
      <div className="flex flex-wrap gap-2">
        {sources.map((source) => (
          <Link
            key={`${source.source_type}-${source.source_id}`}
            href={source.source_type === "producto" ? `/producto/${source.source_id}` : "/soporte"}
            className="flex items-center gap-2 rounded-lg border border-border bg-background px-2 py-1.5 text-xs hover:border-primary transition-colors"
          >
            {source.source_type === "producto" && source.image_url && (
              <ProductImage
                src={source.image_url}
                alt={source.title}
                fill
                className="h-8 w-8 shrink-0 overflow-hidden rounded"
              />
            )}
            <span className="flex flex-col items-start">
              <span className="max-w-[140px] truncate font-medium">{source.title}</span>
              {source.source_type === "producto" && source.price !== undefined && (
                <Price value={source.price} className="text-[11px] font-semibold" />
              )}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
