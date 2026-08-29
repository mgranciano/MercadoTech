"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { FormEvent, useState } from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SearchBarProps {
  className?: string
  initialQuery?: string
  onSearch?: (query: string) => void
}

export function SearchBar({
  className,
  initialQuery = "",
  onSearch,
}: SearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(initialQuery || searchParams?.get("q") || "")

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    if (onSearch) {
      onSearch(query)
    } else {
      router.push(`/buscar?q=${encodeURIComponent(query)}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn("relative flex-1 max-w-md", className)}>
      <input
        type="text"
        placeholder="Buscar productos..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full px-4 py-2 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <Button
        type="submit"
        size="icon"
        variant="ghost"
        className="absolute right-0"
      >
        <Search size={18} />
      </Button>
    </form>
  )
}
