import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { PRODUCTS_PAGE_SIZE } from "@/lib/constants/catalog"

interface PaginationProps {
  currentPage: number
  total: number
  onPageChange: (page: number) => void
}

export function Pagination({ currentPage, total, onPageChange }: PaginationProps) {
  const totalPages = Math.ceil(total / PRODUCTS_PAGE_SIZE)

  if (totalPages <= 1) {
    return null
  }

  const hasPrev = currentPage > 1
  const hasNext = currentPage < totalPages

  return (
    <div className="flex items-center justify-center gap-4 mt-8">
      <Button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrev}
        variant="outline"
        size="icon"
      >
        <ChevronLeft size={20} />
      </Button>

      <div className="text-sm text-muted-foreground text-center min-w-[120px]">
        Página {currentPage} de {totalPages}
      </div>

      <Button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNext}
        variant="outline"
        size="icon"
      >
        <ChevronRight size={20} />
      </Button>
    </div>
  )
}
