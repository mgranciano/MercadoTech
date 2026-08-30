"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, Sparkles, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Category {
  id: string
  name: string
  slug: string
}

interface MobileNavProps {
  categories?: Category[]
}

export function MobileNav({ categories = [] }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </Button>

      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-card border-b border-border p-4 space-y-3">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-md hover:bg-muted transition-colors"
          >
            Inicio
          </Link>

          <Link
            href="/asistente"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition-colors"
          >
            <Sparkles size={16} />
            Asistente
          </Link>

          <Link
            href="/soporte"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition-colors"
          >
            <HelpCircle size={16} />
            Soporte
          </Link>

          <div className="border-t pt-3">
            <p className="text-xs font-semibold text-muted-foreground px-3 mb-2">
              Categorías
            </p>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categoria/${cat.slug}`}
                onClick={() => setIsOpen(false)}
                className="block px-6 py-2 text-sm rounded-md hover:bg-muted transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>

          <div className="border-t pt-3">
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-primary hover:bg-muted rounded-md transition-colors"
            >
              Ingresar
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
