import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { cn } from "@/lib/utils"

interface CartIndicatorProps {
  count?: number
  className?: string
  variant?: 'desktop' | 'mobile'
}

export function CartIndicator({ count = 0, className, variant = 'desktop' }: CartIndicatorProps) {
  return (
    <Link href="/carrito" className={cn("relative inline-flex", className)} data-testid={`nav-cart-link-${variant}`}>
      <ShoppingCart size={24} className="text-foreground" />
      {count > 0 && (
        <span className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-semibold" data-testid="nav-cart-badge">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  )
}
