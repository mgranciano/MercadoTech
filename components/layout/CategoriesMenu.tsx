"use client"

import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Category {
  id: string
  name: string
  slug: string
}

interface CategoriesMenuProps {
  categories?: Category[]
  className?: string
}

export function CategoriesMenu({ categories = [], className }: CategoriesMenuProps) {
  return (
    <div className={cn("relative group", className)}>
      <Button variant="ghost" className="gap-1">
        Categorías
        <ChevronDown size={16} />
      </Button>
      <div className="absolute left-0 top-full pt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
        <div className="bg-card border border-border rounded-md shadow-lg p-2">
          {categories.length === 0 ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              Cargando categorías...
            </div>
          ) : (
            categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categoria/${cat.slug}`}
                className="block px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
              >
                {cat.name}
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
